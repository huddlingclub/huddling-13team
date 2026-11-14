// 기준 위치(data/base.json) 근처에서 메뉴별 음식점 후보를 카카오 로컬 API로 찾아
// data/candidates.csv에 저장한다. 이미 채운 링크와 메모는 다시 돌려도 남는다.
//
// 사용법: npm run stores:fetch -- [메뉴 ...] [--radius=1000]
// 키: roulette/.env.local 파일에 KAKAO_REST_API_KEY=... 한 줄 (git에 올라가지 않음)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toCsv } from './csv.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = JSON.parse(readFileSync(join(ROOT, 'data/base.json'), 'utf8'));
const CSV_PATH = join(ROOT, 'data/candidates.csv');
const DEFAULT_MENUS = ['김치찌개', '돈까스', '국밥', '쌀국수', '샐러드'];
const PAGE_SIZE = 15; // 카카오 키워드 검색은 한 번에 최대 15건
const MAX_PAGES = 3; // 검색어 하나당 최대 45건

function readApiKey() {
  if (process.env.KAKAO_REST_API_KEY) return process.env.KAKAO_REST_API_KEY.trim();
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return '';
  const line = readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith('KAKAO_REST_API_KEY='));
  return line ? line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') : '';
}

function parseArgs(argv) {
  const radiusArg = argv.find((a) => a.startsWith('--radius='));
  const radius = radiusArg ? Number(radiusArg.slice('--radius='.length)) : 1000;
  if (!Number.isInteger(radius) || radius < 1 || radius > 20000) {
    throw new Error('--radius는 1~20000 사이 정수(미터)여야 해요.');
  }
  const menus = argv.filter((a) => !a.startsWith('--'));
  return { radius, menus: menus.length > 0 ? menus : DEFAULT_MENUS };
}

function explainError(status, body) {
  if (status === 401) return '키가 잘못됐어요. JavaScript 키가 아니라 REST API 키인지 확인하세요.';
  if (status === 403) return '카카오 앱 설정에서 카카오맵 사용 설정을 켜야 해요.';
  if (status === 429) return '호출 한도를 넘었어요. 잠시 뒤 다시 돌리세요.';
  return body;
}

async function searchMenu(menu, radius, apiKey) {
  const places = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({
      query: menu,
      category_group_code: 'FD6', // 음식점
      x: String(BASE.lng),
      y: String(BASE.lat),
      radius: String(radius),
      sort: 'distance',
      size: String(PAGE_SIZE),
      page: String(page),
    });
    const res = await fetch('https://dapi.kakao.com/v2/local/search/keyword.json?' + params, {
      headers: { Authorization: 'KakaoAK ' + apiKey },
    });
    if (!res.ok) {
      throw new Error('카카오 API ' + res.status + ': ' + explainError(res.status, await res.text()));
    }
    const { documents, meta } = await res.json();
    places.push(...documents);
    if (meta.is_end) break;
  }
  return places;
}

function toRow(menu, place) {
  return {
    menu,
    name: place.place_name,
    distance_m: place.distance,
    naver_url: '',
    baemin_url: '',
    note: '',
    category: place.category_name.split(' > ').slice(1).join(' > '),
    road_address: place.road_address_name || place.address_name,
    phone: place.phone,
    kakao_url: place.place_url,
    lat: place.y,
    lng: place.x,
    kakao_id: place.id,
  };
}

async function main() {
  const { radius, menus } = parseArgs(process.argv.slice(2));
  const apiKey = readApiKey();
  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY가 없어요. roulette/.env.local 에 KAKAO_REST_API_KEY=키 를 넣으세요.');
  }

  const existing = existsSync(CSV_PATH) ? parseCsv(readFileSync(CSV_PATH, 'utf8')) : [];
  const rowsByKey = new Map(existing.map((r) => [r.menu + '|' + r.kakao_id, r]));

  console.log('기준 위치: ' + BASE.name + ' (' + BASE.lat + ', ' + BASE.lng + '), 반경 ' + radius + 'm');
  for (const menu of menus) {
    const places = await searchMenu(menu, radius, apiKey);
    for (const place of places) {
      const key = menu + '|' + place.id;
      const prev = rowsByKey.get(key);
      const row = toRow(menu, place);
      rowsByKey.set(key, prev ? { ...row, naver_url: prev.naver_url, baemin_url: prev.baemin_url, note: prev.note } : row);
    }
    console.log('  ' + menu + ': ' + places.length + '곳');
  }

  const menuOrder = (menu) => {
    const i = menus.indexOf(menu);
    return i === -1 ? menus.length : i;
  };
  const rows = [...rowsByKey.values()].sort(
    (a, b) =>
      menuOrder(a.menu) - menuOrder(b.menu) ||
      a.menu.localeCompare(b.menu) ||
      Number(a.distance_m) - Number(b.distance_m),
  );
  writeFileSync(CSV_PATH, toCsv(rows));

  const linked = rows.filter((r) => r.naver_url || r.baemin_url).length;
  console.log('저장: data/candidates.csv (' + rows.length + '행, 링크 채운 행 ' + linked + '개)');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
