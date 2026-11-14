// 앱에 보이는 가게의 대표 사진 주소를 네이버 장소 페이지에서 읽어 data/candidates.csv의 image_url에 적는다.
// 사장님이 올린 사진을 먼저 쓰고, 없으면 첫 번째 사진을 쓴다. 사진이 없으면 "-"를 적어 다시 묻지 않는다.
// 앱은 이 주소에 ?type=f160_160을 붙여 160px 썸네일로 불러온다.
//
// 사용법: npm run stores:images            (image_url이 빈 행만)
//         npm run stores:images -- --all   (모든 행 다시)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isShownRow, parseCsv, toCsv } from './csv.mjs';
import { apolloState, DELAY_MS, placeIdFromUrl, sleep } from './naver.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV_PATH = join(ROOT, 'data/candidates.csv');
export const NO_IMAGE = '-';

function pickPhoto(state) {
  const photos = Object.values(state).filter(
    (v) => v && v.__typename === 'PlaceDetailTopPhotoItem' && (v.thumbnailUrl || v.originalUrl),
  );
  const photo = photos.find((v) => String(v.id).includes('_business_')) ?? photos.find((v) => !v.video) ?? photos[0];
  return photo ? photo.thumbnailUrl || photo.originalUrl : '';
}

const all = process.argv.includes('--all');
const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));

// 같은 가게가 여러 카테고리에 나오므로 네이버 ID별로 한 번만 묻는다.
const known = new Map();
for (const r of rows) {
  const id = placeIdFromUrl(r.naver_url);
  if (id && r.image_url && !all) known.set(id, r.image_url);
}
const todoIds = [
  ...new Set(
    rows
      .filter((r) => isShownRow(r) && placeIdFromUrl(r.naver_url))
      .map((r) => placeIdFromUrl(r.naver_url))
      .filter((id) => !known.has(id)),
  ),
];

console.log('사진 확인: 네이버 장소 ' + todoIds.length + '곳');
let found = 0;
for (const [i, id] of todoIds.entries()) {
  const state = await apolloState('https://m.place.naver.com/restaurant/' + id + '/home');
  const url = pickPhoto(state);
  known.set(id, url || NO_IMAGE);
  if (url) found++;
  await sleep(DELAY_MS);
  if ((i + 1) % 20 === 0 || i + 1 === todoIds.length) {
    for (const r of rows) {
      const rid = placeIdFromUrl(r.naver_url);
      if (rid && known.has(rid)) r.image_url = known.get(rid);
    }
    writeFileSync(CSV_PATH, toCsv(rows)); // 중간에 멈춰도 여기까지는 남는다
    console.log('  ' + (i + 1) + '/' + todoIds.length + ' (사진 있음 ' + found + ')');
  }
}
console.log('저장: data/candidates.csv');
