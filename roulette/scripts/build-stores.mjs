// data/candidates.csv에서 네이버나 배민 링크를 채운 가게만 골라
// 앱이 읽는 data/stores.json을 만든다. 형식은 types.ts의 Store와 같다.
//
// 사용법: npm run stores:build
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DUMMY_BAEMIN_URL, parseCsv } from './csv.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV_PATH = join(ROOT, 'data/candidates.csv');
const JSON_PATH = join(ROOT, 'data/stores.json');

const looksLikeBaemin = (url) => /^https:\/\/s\.baemin\.com\//.test(url) || url.startsWith('baemin://');
const looksLikeNaver = (url) => /^https:\/\/(map\.naver\.com|naver\.me|m\.place\.naver\.com)\//.test(url);

const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));
const warnings = [];
const dummyNames = [];
const stores = rows
  .filter((r) => r.naver_url || r.baemin_url)
  .map((r) => {
    if (r.baemin_url === DUMMY_BAEMIN_URL) dummyNames.push(r.menu + ' ' + r.name);
    else if (r.baemin_url && !looksLikeBaemin(r.baemin_url)) warnings.push(r.name + ': 배민 링크 형식이 낯설어요 (' + r.baemin_url + ')');
    if (r.naver_url && !looksLikeNaver(r.naver_url)) warnings.push(r.name + ': 네이버 링크 형식이 낯설어요 (' + r.naver_url + ')');
    if (!r.lat || !r.lng) warnings.push(r.name + ': 좌표가 없어서 사용자 위치 기준 정렬에서 맨 뒤로 가요');
    return {
      id: r.menu + '-' + (r.kakao_id || r.name),
      menu: r.menu,
      name: r.name,
      category: r.category,
      address: r.road_address,
      lat: Number(r.lat) || null,
      lng: Number(r.lng) || null,
      distanceFromBase: Number(r.distance_m) || null,
      naverUrl: r.naver_url || null,
      baeminUrl: r.baemin_url || null,
      kakaoUrl: r.kakao_url || null,
    };
  });

writeFileSync(JSON_PATH, JSON.stringify(stores, null, 2) + '\n');

const counts = {};
for (const s of stores) counts[s.menu] = (counts[s.menu] ?? 0) + 1;
const summary = Object.entries(counts).map(([menu, n]) => menu + ' ' + n).join(', ');
console.log('저장: data/stores.json (' + stores.length + '곳' + (summary ? ': ' + summary : '') + ')');
if (dummyNames.length > 0) {
  console.log('  배민 더미 링크 ' + dummyNames.length + '곳: baemin_url을 배민 앱의 공유 링크(https://s.baemin.com/...)로 바꿔 주세요.');
}
for (const w of warnings) console.warn('  확인 필요 · ' + w);
