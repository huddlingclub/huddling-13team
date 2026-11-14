// data/candidates.csv에서 앱에 보여 줄 가게만 골라 data/stores.json을 만든다. 형식은 types.ts의 Store와 같다.
// 네이버나 배민 링크가 있고, 그 메뉴를 판다고 확인된 가게(menu_check가 menu, name, category)만 넣는다.
// 팀원이 배민 실제 링크를 붙인 가게는 직접 확인한 것으로 보고 menu_check와 상관없이 넣는다.
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
const SHOWN_CHECKS = new Set(['menu', 'name', 'category']);
const hasRealBaemin = (r) => r.baemin_url !== '' && r.baemin_url !== DUMMY_BAEMIN_URL;
const isShown = (r) =>
  (r.naver_url || r.baemin_url) && (!r.menu_check || SHOWN_CHECKS.has(r.menu_check) || hasRealBaemin(r));

// 카카오 분류 끝이 브랜드 이름(예: "한식 > 순대 > 신의주찹쌀순대")이면 네이버 분류("순대,순댓국")를 쓰고,
// 아니면 대개 더 구체적인 카카오 분류("한식 > 감자탕")를 쓴다.
function displayCategory(r) {
  const kakaoLast = r.category.split(' > ').pop() ?? '';
  const isBrand = kakaoLast !== '' && r.name.replace(/\s/g, '').includes(kakaoLast.replace(/\s/g, ''));
  return isBrand && r.naver_category ? r.naver_category : r.category;
}

const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));
const warnings = [];
const dummyNames = [];
const stores = rows
  .filter(isShown)
  .map((r) => {
    if (r.baemin_url === DUMMY_BAEMIN_URL) dummyNames.push(r.menu + ' ' + r.name);
    else if (r.baemin_url && !looksLikeBaemin(r.baemin_url)) warnings.push(r.name + ': 배민 링크 형식이 낯설어요 (' + r.baemin_url + ')');
    if (r.naver_url && !looksLikeNaver(r.naver_url)) warnings.push(r.name + ': 네이버 링크 형식이 낯설어요 (' + r.naver_url + ')');
    if (!r.lat || !r.lng) warnings.push(r.name + ': 좌표가 없어서 사용자 위치 기준 정렬에서 맨 뒤로 가요');
    return {
      id: r.menu + '-' + (r.kakao_id || r.name),
      menu: r.menu,
      name: r.name,
      category: displayCategory(r),
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
