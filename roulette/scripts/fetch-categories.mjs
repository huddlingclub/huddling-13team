// 기준 위치 반경 안의 음식점을 카카오 카테고리 검색으로 모두 모아 data/categories.json 규칙으로
// 룰렛 카테고리(한식, 중식 …)에 나누고, 카테고리마다 가까운 가게를 data/candidates.csv에 저장한다.
// 규칙은 카카오 분류 경로의 앞부분이고, 여러 규칙에 맞으면 더 긴(구체적인) 규칙이 이긴다.
// 예: "한식 > 육류,고기 > 삼겹살"은 "한식"보다 "한식 > 육류,고기"(고기)에 들어간다.
//
// 사용법: npm run stores:categories -- [--radius=1000] [--per=30]
import { BASE, CATEGORIES, distanceM, kakaoGet, mergeCandidates, parseRadius, requireApiKey, toRow } from './kakao.mjs';

const PAGE_SIZE = 15;
const MAX_IN_RECT = 45; // 카카오가 한 검색에 주는 최대 개수. 넘으면 칸을 4개로 쪼갠다.

function classify(categoryName) {
  const path = categoryName.split(' > ').slice(1); // 맨 앞 "음식점" 제외
  let best = null;
  let bestLen = 0;
  for (const c of CATEGORIES) {
    for (const rule of c.kakao) {
      const parts = rule.split(' > ');
      if (parts.length > bestLen && parts.every((p, i) => path[i] === p)) {
        best = c.name;
        bestLen = parts.length;
      }
    }
  }
  return best;
}

async function collectRect(rect, apiKey, found, depth = 0) {
  const params = (page) => ({ category_group_code: 'FD6', rect: rect.join(','), size: String(PAGE_SIZE), page: String(page) });
  let res = await kakaoGet('search/category.json', params(1), apiKey);
  if (res.meta.total_count > MAX_IN_RECT && depth < 8) {
    const [x1, y1, x2, y2] = rect;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    for (const sub of [[x1, y1, mx, my], [mx, y1, x2, my], [x1, my, mx, y2], [mx, my, x2, y2]]) {
      await collectRect(sub, apiKey, found, depth + 1);
    }
    return;
  }
  for (let page = 1; ; page++) {
    if (page > 1) res = await kakaoGet('search/category.json', params(page), apiKey);
    for (const d of res.documents) found.set(d.id, d);
    if (res.meta.is_end) break;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const radius = parseRadius(argv);
  const perArg = argv.find((a) => a.startsWith('--per='));
  const per = perArg ? Number(perArg.slice('--per='.length)) : 30;
  const apiKey = requireApiKey();

  const dLat = radius / 111_320;
  const dLng = radius / (111_320 * Math.cos((BASE.lat * Math.PI) / 180));
  const found = new Map();
  await collectRect([BASE.lng - dLng, BASE.lat - dLat, BASE.lng + dLng, BASE.lat + dLat], apiKey, found);

  const groups = new Map(CATEGORIES.map((c) => [c.name, []]));
  const skipped = {};
  let inside = 0;
  for (const place of found.values()) {
    const d = distanceM(BASE, { lat: Number(place.y), lng: Number(place.x) });
    if (d > radius) continue;
    inside++;
    const name = classify(place.category_name);
    if (name) groups.get(name).push({ ...place, distance: String(d) });
    else {
      const lv2 = place.category_name.split(' > ')[1] ?? '기타';
      skipped[lv2] = (skipped[lv2] ?? 0) + 1;
    }
  }

  console.log('기준 위치: ' + BASE.name + ', 반경 ' + radius + 'm 음식점 ' + inside + '곳');
  const rows = [];
  for (const [name, places] of groups) {
    const nearest = places.sort((a, b) => Number(a.distance) - Number(b.distance)).slice(0, per);
    rows.push(...nearest.map((p) => toRow(name, p)));
    console.log('  ' + name + ': ' + places.length + '곳 중 가까운 ' + nearest.length + '곳');
  }
  const skippedText = Object.entries(skipped)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => k + ' ' + n)
    .join(', ');
  console.log('  카테고리에 안 넣음: ' + skippedText);

  const all = mergeCandidates(rows);
  console.log('저장: data/candidates.csv (' + all.length + '행)');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
