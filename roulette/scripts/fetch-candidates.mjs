// 기준 위치(data/base.json) 근처에서 메뉴 이름(예: 김치찌개)으로 음식점 후보를 카카오 키워드 검색으로 찾아
// data/candidates.csv에 저장한다. 카테고리(한식, 중식 …)는 fetch-categories.mjs가 모은다.
//
// 사용법: npm run stores:fetch -- [메뉴 ...] [--radius=1000]
// 키: roulette/.env.local 파일에 KAKAO_REST_API_KEY=... 한 줄 (git에 올라가지 않음)
import { BASE, kakaoGet, mergeCandidates, parseRadius, requireApiKey, toRow } from './kakao.mjs';

const DEFAULT_MENUS = ['김치찌개', '돈까스', '국밥', '쌀국수', '샐러드'];
const PAGE_SIZE = 15; // 카카오 키워드 검색은 한 번에 최대 15건
const MAX_PAGES = 3; // 검색어 하나당 최대 45건

async function searchMenu(menu, radius, apiKey) {
  const places = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { documents, meta } = await kakaoGet(
      'search/keyword.json',
      {
        query: menu,
        category_group_code: 'FD6', // 음식점
        x: String(BASE.lng),
        y: String(BASE.lat),
        radius: String(radius),
        sort: 'distance',
        size: String(PAGE_SIZE),
        page: String(page),
      },
      apiKey,
    );
    places.push(...documents);
    if (meta.is_end) break;
  }
  return places;
}

async function main() {
  const argv = process.argv.slice(2);
  const radius = parseRadius(argv);
  const args = argv.filter((a) => !a.startsWith('--'));
  const menus = args.length > 0 ? args : DEFAULT_MENUS;
  const apiKey = requireApiKey();

  console.log('기준 위치: ' + BASE.name + ' (' + BASE.lat + ', ' + BASE.lng + '), 반경 ' + radius + 'm');
  const found = [];
  for (const menu of menus) {
    const places = await searchMenu(menu, radius, apiKey);
    found.push(...places.map((p) => toRow(menu, p)));
    console.log('  ' + menu + ': ' + places.length + '곳');
  }
  const rows = mergeCandidates(found, [...DEFAULT_MENUS, ...menus]);
  console.log('저장: data/candidates.csv (' + rows.length + '행)');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
