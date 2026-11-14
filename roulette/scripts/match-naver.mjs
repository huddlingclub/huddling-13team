// 후보 가게(data/candidates.csv)를 네이버 지도에서 같은 상호로 찾아 naver_url을 채우고,
// 그 가게가 뽑힌 메뉴를 실제로 파는지 menu_check에 적는다.
// 카테고리(한식, 중식 …) 행은 카카오 분류로 이미 나눴으므로 네이버에 있는지만 보고 category로 적는다.
//   menu: 네이버 메뉴판에 있음 / name: 상호에 있음 / category: 분류가 맞음
//   no: 메뉴판을 봤는데 없음 / unknown: 네이버에 메뉴판이 없어 판단 못 함
// stores:build는 menu, name, category인 가게만 앱에 넣는다.
//
// 네이버 모바일 장소 페이지를 읽는 비공식 방법이라, 네이버가 페이지 구조를 바꾸면 멈출 수 있다.
//
// 사용법: npm run stores:naver            (menu_check가 빈 행만)
//         npm run stores:naver -- --all   (모든 행 다시)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, toCsv } from './csv.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV_PATH = join(ROOT, 'data/candidates.csv');
const CATEGORY_NAMES = new Set(JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8')).map((c) => c.name));
const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const DELAY_MS = 700; // 너무 빠르면 네이버가 429로 막는다
const RETRY_WAITS_MS = [30_000, 60_000, 120_000];
const MATCH_RADIUS_M = 150; // 카카오와 네이버 좌표가 이 안이면 같은 가게로 본다

// 메뉴판이나 상호에서 찾을 단어. 없는 메뉴는 메뉴 이름 그대로 찾는다.
const MENU_KEYWORDS = {
  김치찌개: ['김치찌개', '김치찌게', '김치치기'],
  돈까스: ['돈까스', '돈가스', '돈카츠', '카츠'],
  국밥: ['국밥', '순대국', '순댓국', '해장국', '곰탕', '설렁탕'],
  쌀국수: ['쌀국수', 'pho'],
  샐러드: ['샐러드', 'salad', '포케', '샐러디'],
};
// 이 단어가 분류(카카오 또는 네이버)에 있으면 메뉴판 없이도 판다고 본다.
const CATEGORY_KEYWORDS = {
  돈까스: ['돈까스', '돈가스', '돈카츠'],
  국밥: ['국밥', '순대', '해장국', '곰탕', '설렁탕'],
  쌀국수: ['베트남'],
  샐러드: ['샐러드'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const compact = (s) => s.toLowerCase().replace(/[\s()·&,.\-_'"]/g, '');

function distanceM(a, b) {
  const R = 6_371_000;
  const t = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(t(b.lat - a.lat) / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

// 지점명 표기가 달라도("서울역점"/"서울역 본점") 같은 상호로 본다. 앞 4글자가 같거나 한쪽이 다른 쪽을 품으면 같다.
function sameName(a, b) {
  const x = compact(a);
  const y = compact(b);
  if (x.includes(y) || y.includes(x)) return true;
  const n = Math.min(4, x.length, y.length);
  return n >= 2 && x.slice(0, n) === y.slice(0, n);
}

async function apolloState(url) {
  let res = await fetch(url, { headers: { 'User-Agent': UA } });
  for (const wait of RETRY_WAITS_MS) {
    if (res.status !== 429) break;
    console.log('  네이버가 잠시 막았어요(429). ' + wait / 1000 + '초 뒤 다시 시도해요.');
    await sleep(wait);
    res = await fetch(url, { headers: { 'User-Agent': UA } });
  }
  if (!res.ok) throw new Error('네이버 ' + res.status + ': ' + url);
  const html = await res.text();
  const m = html.match(/window.__APOLLO_STATE__\s*=\s*(\{.*?\});\s*window\./s);
  if (!m) throw new Error('네이버 페이지 구조가 바뀌었거나 접근이 막혔어요: ' + url);
  return JSON.parse(m[1]);
}

async function findNaverPlace(row) {
  const here = { lat: Number(row.lat), lng: Number(row.lng) };
  const queries = [row.name, row.name.split(' ')[0]].filter((q, i, a) => a.indexOf(q) === i);
  for (const query of queries) {
    const url =
      'https://m.place.naver.com/restaurant/list?query=' + encodeURIComponent(query) + '&x=' + row.lng + '&y=' + row.lat;
    const state = await apolloState(url);
    await sleep(DELAY_MS);
    const best = Object.values(state)
      .filter((v) => v && v.__typename === 'PlaceListBusinessesItem')
      .map((v) => ({ id: v.id, name: v.name, category: v.category ?? '', d: distanceM(here, { lat: Number(v.y), lng: Number(v.x) }) }))
      .filter((v) => v.d <= MATCH_RADIUS_M && sameName(v.name, row.name))
      .sort((a, b) => a.d - b.d)[0];
    if (best) return best;
  }
  return null;
}

async function naverDetail(id) {
  const state = await apolloState('https://m.place.naver.com/restaurant/' + id + '/menu/list');
  await sleep(DELAY_MS);
  const base = Object.values(state).find((v) => v && v.__typename === 'PlaceDetailBase');
  const menus = Object.values(state)
    .filter((v) => v && v.__typename === 'PlaceMenuItem' && v.name)
    .map((v) => v.name);
  return { name: base?.name ?? '', category: base?.category ?? '', menus };
}

function checkMenu(row, detail) {
  const words = (MENU_KEYWORDS[row.menu] ?? [row.menu]).map(compact);
  const has = (text) => words.some((w) => compact(text).includes(w));
  if (detail.menus.some(has)) return 'menu';
  if (has(row.name) || has(detail.name)) return 'name';
  const cats = CATEGORY_KEYWORDS[row.menu] ?? [];
  if (cats.some((c) => row.category.includes(c) || detail.category.includes(c))) return 'category';
  return detail.menus.length > 0 ? 'no' : 'unknown';
}

const all = process.argv.includes('--all');
const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));
const todo = rows.filter((r) => all || !r.menu_check);
const tally = {};
let done = 0;

// 같은 가게가 여러 메뉴·카테고리에 나오면 네이버 검색은 한 번만 한다. null은 네이버에 없던 가게.
const placeByKakaoId = new Map();
for (const r of rows) {
  if (all || !r.menu_check) continue;
  const id = r.naver_url.match(/place\/(\d+)/)?.[1];
  if (id) placeByKakaoId.set(r.kakao_id, { id, name: r.naver_name, category: r.naver_category });
  else if (r.menu_check === 'not_found') placeByKakaoId.set(r.kakao_id, null);
}

console.log('네이버 확인: ' + todo.length + '곳');
for (const row of todo) {
  const knownId = row.naver_url.match(/place\/(\d+)/)?.[1];
  const place = knownId
    ? { id: knownId, name: row.naver_name, category: row.naver_category }
    : placeByKakaoId.has(row.kakao_id)
      ? placeByKakaoId.get(row.kakao_id)
      : await findNaverPlace(row);
  placeByKakaoId.set(row.kakao_id, place);
  if (!place) {
    row.menu_check = 'not_found';
    row.naver_name = '';
  } else if (CATEGORY_NAMES.has(row.menu)) {
    row.naver_url = 'https://map.naver.com/p/entry/place/' + place.id;
    row.naver_name = place.name;
    row.naver_category = place.category;
    row.menu_check = 'category';
  } else {
    const detail = await naverDetail(place.id);
    row.naver_url = 'https://map.naver.com/p/entry/place/' + place.id;
    row.naver_name = detail.name;
    row.naver_category = detail.category;
    row.menu_check = checkMenu(row, detail);
  }
  tally[row.menu_check] = (tally[row.menu_check] ?? 0) + 1;
  done++;
  if (done % 20 === 0 || done === todo.length) {
    writeFileSync(CSV_PATH, toCsv(rows)); // 중간에 멈춰도 여기까지는 남는다
    console.log('  ' + done + '/' + todo.length + ' ' + JSON.stringify(tally));
  }
}
console.log('저장: data/candidates.csv');

