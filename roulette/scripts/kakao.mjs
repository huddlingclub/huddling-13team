// 카카오 로컬 API 호출과 후보 CSV 병합. fetch-candidates와 fetch-categories가 함께 쓴다.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toCsv } from './csv.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const BASE = JSON.parse(readFileSync(join(ROOT, 'data/base.json'), 'utf8'));
export const CATEGORIES = JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8'));
export const CSV_PATH = join(ROOT, 'data/candidates.csv');

// 사람이 채운 칸과 네이버 확인 결과. 다시 검색해도 지우지 않는다.
const KEPT_COLUMNS = ['naver_url', 'baemin_url', 'note', 'menu_check', 'naver_name', 'naver_category'];

export function readApiKey() {
  if (process.env.KAKAO_REST_API_KEY) return process.env.KAKAO_REST_API_KEY.trim();
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return '';
  const line = readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith('KAKAO_REST_API_KEY='));
  return line ? line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') : '';
}

export function requireApiKey() {
  const key = readApiKey();
  if (!key) throw new Error('KAKAO_REST_API_KEY가 없어요. roulette/.env.local 에 KAKAO_REST_API_KEY=키 를 넣으세요.');
  return key;
}

export function parseRadius(argv) {
  const arg = argv.find((a) => a.startsWith('--radius='));
  const radius = arg ? Number(arg.slice('--radius='.length)) : 1000;
  if (!Number.isInteger(radius) || radius < 1 || radius > 20000) {
    throw new Error('--radius는 1~20000 사이 정수(미터)여야 해요.');
  }
  return radius;
}

function explainError(status, body) {
  if (status === 401) {
    return '키가 잘못됐어요. [플랫폼 키] → [REST API 키]의 키 값인지 확인하세요. 같은 화면의 클라이언트 시크릿이나 JavaScript 키는 쓰지 않아요.';
  }
  if (status === 403) return '카카오 앱 설정에서 카카오맵 사용 설정을 켜야 해요.';
  if (status === 429) return '호출 한도를 넘었어요. 잠시 뒤 다시 돌리세요.';
  return body;
}

export async function kakaoGet(path, params, apiKey) {
  const res = await fetch('https://dapi.kakao.com/v2/local/' + path + '?' + new URLSearchParams(params), {
    headers: { Authorization: 'KakaoAK ' + apiKey },
  });
  if (!res.ok) throw new Error('카카오 API ' + res.status + ': ' + explainError(res.status, await res.text()));
  return res.json();
}

export function distanceM(a, b) {
  const R = 6_371_000;
  const t = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(t(b.lat - a.lat) / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function toRow(menu, place) {
  return {
    menu,
    name: place.place_name,
    distance_m: place.distance || distanceM(BASE, { lat: Number(place.y), lng: Number(place.x) }),
    category: place.category_name.split(' > ').slice(1).join(' > '),
    road_address: place.road_address_name || place.address_name,
    phone: place.phone,
    kakao_url: place.place_url,
    lat: place.y,
    lng: place.x,
    kakao_id: place.id,
  };
}

// 새로 찾은 행을 기존 CSV에 합친다. 같은 메뉴·가게면 카카오 정보만 새로 쓰고 사람이 채운 칸은 남긴다.
// 카테고리 → 기본 메뉴 → 나머지 순, 그 안에서는 가까운 순으로 정렬한다.
export function mergeCandidates(newRows, menuOrder = []) {
  const existing = existsSync(CSV_PATH) ? parseCsv(readFileSync(CSV_PATH, 'utf8')) : [];
  const rowsByKey = new Map(existing.map((r) => [r.menu + '|' + r.kakao_id, r]));
  for (const row of newRows) {
    const key = row.menu + '|' + row.kakao_id;
    const prev = rowsByKey.get(key) ?? {};
    rowsByKey.set(key, { ...row, ...Object.fromEntries(KEPT_COLUMNS.map((k) => [k, prev[k] ?? ''])) });
  }
  const order = [...CATEGORIES.map((c) => c.name), ...menuOrder];
  const rank = (menu) => {
    const i = order.indexOf(menu);
    return i === -1 ? order.length : i;
  };
  const rows = [...rowsByKey.values()].sort(
    (a, b) => rank(a.menu) - rank(b.menu) || a.menu.localeCompare(b.menu) || Number(a.distance_m) - Number(b.distance_m),
  );
  writeFileSync(CSV_PATH, toCsv(rows));
  return rows;
}
