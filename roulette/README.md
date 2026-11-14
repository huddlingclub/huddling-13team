# 점심메뉴 낚시

펭귄 퍼디가 얼음 구멍에서 점심 메뉴를 낚아 올리고, 그 메뉴를 파는 근처 가게를 보여 주는 앱입니다. 처음에는 룰렛 앱을 가져와 바탕으로 썼고, 화면을 팀 프로토타입(menu-fishing.html)의 낚시 흐름으로 바꿨습니다. 폴더 이름은 그대로 `roulette/`입니다.

원본은 `vespexx-platform/soonr-work-design` 저장소의 `250812-labs-roulette` 브랜치(커밋 `71d9b11`)이며, 여기서 룰렛에 필요한 파일만 골라 옮겼습니다.

## 실행

```bash
cd roulette
npm install
npm run dev
```

브라우저에서 http://localhost:5173/huddling/ 을 엽니다. 라이브와 같은 경로에서 돌도록 기준 경로를 `/huddling/`로 맞춰 두었습니다. 배포용 빌드는 `npm run build`로 만들고, 결과물은 `dist/`에 생깁니다.

## 배포

라이브 주소는 https://clipfriends.club/huddling 입니다. `main`에 `roulette/` 변경이 합쳐지면 GitHub Actions([deploy-roulette.yml](../.github/workflows/deploy-roulette.yml))가 빌드해서 Cloudflare Worker `huddling-roulette`로 배포합니다. `main`에 있는 룰렛이 곧 라이브입니다.

- [wrangler.jsonc](wrangler.jsonc): 정적 파일만 있는 Worker입니다. `clipfriends.club/huddling`과 `clipfriends.club/huddling/*` 두 경로만 맡고, `assets.base_path`로 `dist/`를 `/huddling` 아래에 올립니다. `clipfriends.club`의 나머지 경로는 다른 저장소의 Worker가 맡으며, 같은 호스트에서는 Route가 Custom Domain보다 먼저 실행되어 서로 간섭하지 않습니다.
- GitHub Actions 배포에는 저장소 시크릿 `CLOUDFLARE_API_TOKEN`이 필요합니다. 지금 토큰(`huddling-club-1114`)에는 배포에 필요한 권한만 남겼습니다. 계정에서는 Workers Scripts 편집과 Account Settings 읽기, `clipfriends.club` zone에서는 Workers Routes 편집, 사용자 정보에서는 Memberships와 User Details 읽기입니다. 토큰을 새로 만들 때도 이 권한만 주고 `gh secret set CLOUDFLARE_API_TOKEN --repo huddlingclub/huddling-13team`으로 등록합니다.
- 토큰에는 만료일(지금은 2026-11-30 23:59 KST)이 걸려 있습니다. 만료되면 자동 배포가 실패하고, 라이브는 마지막으로 배포한 상태 그대로 남습니다. 더 배포하려면 Cloudflare 대시보드 → My Profile → API Tokens에서 이 토큰을 Edit해 만료일을 늘립니다. 토큰 값이 그대로라 시크릿은 다시 넣지 않아도 됩니다.
- `clipfriends.club`은 Cloudflare의 Always Use HTTPS가 켜져 있어서 http 주소로 들어오면 https로 넘어갑니다.
- 손으로 배포하려면 `npx wrangler login` 후 `npm run deploy`를 실행합니다. 평소에는 `main`에 합치는 것으로 배포합니다.
- 응답 보안 헤더는 [public/_headers](public/_headers)에 있습니다. 같은 도메인에 로그인이 필요한 다른 앱이 있어서, CSP로 외부 스크립트를 막고 글꼴(cdn.jsdelivr.net, Google Fonts), 가게 사진(search.pstatic.net), Cloudflare 방문 통계(Web Analytics)만 허용합니다. 외부 스크립트, 이미지, 글꼴을 새로 쓰면 이 파일의 CSP에 주소를 더해야 화면에 나옵니다.

## 공유 미리보기

카카오톡, 슬랙 등에 링크를 붙이면 [public/og-image.png](public/og-image.png)(1200×630)가 미리보기로 나옵니다. 메타 태그는 [index.html](index.html)에 있고, 이미지 원본은 앱의 바다·빙판·펭귄 그림과 메뉴 아이콘을 그대로 써서 그린 [scripts/og-image.html](scripts/og-image.html)입니다. 그림이나 문구를 고친 뒤에는 `roulette` 폴더에서 아래 명령으로 이미지를 다시 만듭니다(Pretendard 글꼴을 CDN에서 받으므로 인터넷이 필요합니다).

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=5000 --screenshot=public/og-image.png scripts/og-image.html
```

카카오톡은 한 번 읽은 미리보기를 한동안 기억하므로, 이미지를 바꾼 뒤 예전 미리보기가 나오면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 주소의 캐시를 지웁니다.

## 기능

- 낚싯대를 잡으면 근처에 가게가 있는 메뉴를 모으고(낚시 준비에서 반경과 못 먹는 메뉴를 고름), 펭귄이 낚싯대를 던져 그중 하나를 무작위로 낚아 올립니다. 메뉴는 근처 가게를 나눈 카테고리 10개이고, 카테고리마다 픽셀 아이콘과 대표 요리(한식이면 비빔밥)를 보여 줍니다. "다시 던지기"는 방금 낚은 메뉴를 빼고 고릅니다.
- 낚은 메뉴를 파는 서울스퀘어 근처 가게를 가까운 순으로 보여 줍니다. 가게를 누르면 네이버 지도(네이버 링크가 없으면 카카오맵)가 열립니다. 가게마다 붙은 "주문하기" 버튼은 PC와 폰 모두에서 QR 창을 띄우고, 창을 닫으면 가게 목록으로 돌아옵니다. QR은 앱 전체에 하나뿐이고 어느 가게에서 눌러도 https://www.huddling.club/ 로 보냅니다(주소는 [components/OrderQr.tsx](components/OrderQr.tsx)의 `ORDER_QR_URL`).
- 확인한 가게가 없는 메뉴는 "네이버 지도에서 찾기" 버튼으로 "서울역 + 메뉴"를 검색합니다.
- 쇼케이스라 위치는 서울스퀘어로 고정했습니다. 위치 권한을 묻지 않고, 가게 거리와 낚시터 반경은 모두 서울스퀘어에서 잽니다([lib/location.ts](lib/location.ts)). 가게 데이터가 서울스퀘어 1km 안이라 반경 2km는 1km와 같은 가게를 보여 줍니다.
- 가게 화면에서 "주문하기"를 누르면 낚은 메뉴가 메뉴 도감에 쌓이고, 날마다 이어서 낚으면 연속 기록이 늘어납니다. 낚을 메뉴가 없으면 빈 바다 화면에서 반경 넓히기, 제외 조건 풀기, 도감 보기를 고릅니다.
- 낚시 준비의 "예산"과 가게 화면의 "배달팁·평점·최소주문" 정렬은 프로토타입대로 화면만 있고 아직 데이터가 없어 걸러지지 않습니다. 가게 목록은 늘 거리순입니다.
- 메뉴는 홈의 "편집"을 눌러 바텀시트에서 추가하고, 이름을 눌러 수정하고, 휴지통 버튼으로 지웁니다. 메뉴, 도감, 연속 기록은 브라우저 로컬 스토리지에 저장되어 새로고침해도 유지됩니다.

## 화면 구조

낚시 앱 한 화면입니다. 1024px 이상에서는 흰 배경 가운데에 430px 폭으로 두고, 그보다 좁으면 화면 폭(최대 768px)을 채웁니다. 낚아 올린 메뉴의 가게는 앱 안의 가게 화면에 나오고, 메뉴 편집 바텀시트도 앱 폭에 맞춰 열립니다.

- 낚시 앱 화면은 프로토타입의 S1~S9, E1을 따릅니다: 홈(빙산 낚시터와 시간대 문구) → 주변 메뉴 수집 → 낚시 준비 → 캐스팅(탭하면 건너뜀) → 입질 대기 → 낚아 올린 결과 → 가게 목록 → 메뉴 도감, 그리고 낚을 메뉴가 없을 때의 빈 바다. 시간대 문구는 루트 README의 표를 따르고, 배경·펭귄·빙판 그림과 메뉴 픽셀 아이콘은 [assets/fishing/](assets/fishing/)에 있습니다.
- 가게 목록의 썸네일은 그 가게의 네이버 대표 사진(사장님 사진 우선)을 네이버 이미지 프록시에서 160px로 받아 씁니다. 사진이 없거나 불러오지 못한 가게는 카테고리 픽셀 아이콘이 나옵니다.

## 근처 가게 데이터

기준 위치는 서울스퀘어(서울특별시 중구 한강대로 416, [data/base.json](data/base.json))입니다. 카카오에서 근처 음식점을 모으고, 네이버 지도에서 같은 가게가 있는지(그리고 메뉴는 실제로 파는지) 확인한 가게만 앱에 보여 줍니다. 배달 앱은 공개 API가 없어서 배민 링크는 사람이 앱에서 복사합니다.

룰렛 기본 항목은 카테고리 10개입니다. 카테고리는 [data/categories.json](data/categories.json)에서 카카오 분류 경로로 정하고, 여러 규칙에 맞으면 더 구체적인 규칙이 이깁니다. 예를 들어 "한식 > 육류,고기 > 삼겹살"은 한식이 아니라 고기에 들어갑니다.

| 카테고리 | 카카오 분류 |
|---|---|
| 한식 | 한식(고기·해산물 제외), 퓨전한식, 한식뷔페, 도시락 |
| 중식, 일식, 분식 | 중식, 일식, 분식 |
| 양식 | 양식(햄버거 제외), 패밀리레스토랑, 퓨전요리 |
| 아시안 | 아시아음식 |
| 고기 | 한식 > 육류,고기 |
| 해산물 | 한식 > 해물,생선 |
| 패스트푸드 | 패스트푸드, 양식 > 햄버거 |
| 샐러드 | 샐러드 |

술집, 간식(베이커리·디저트), 치킨, 샤브샤브, 구내식당, 푸드코트는 점심 룰렛에 맞지 않아 넣지 않았습니다.

1. [카카오 디벨로퍼스](https://developers.kakao.com/)에서 앱을 만들고 카카오맵 사용 설정을 켠 뒤, `roulette/.env.local`에 `KAKAO_REST_API_KEY=REST API 키`를 한 줄로 적습니다. 이 파일은 git에 올라가지 않습니다.
2. `npm run stores:categories`를 실행하면 반경 1km 음식점을 카카오 카테고리 검색으로 모두 모아(1,400여 곳, 30초 정도) 카테고리마다 가까운 30곳을 `data/candidates.csv`에 저장합니다. `--radius=1500`, `--per=50`으로 반경과 개수를 바꿉니다.
3. 김치찌개처럼 메뉴 이름으로 찾으려면 `npm run stores:fetch -- 김치찌개 마라탕`을 실행합니다. 카카오 키워드 검색으로 메뉴당 가까운 45곳을 저장합니다.
4. `npm run stores:naver`를 실행하면 아직 확인하지 않은 후보를 네이버 지도에서 같은 상호로 찾습니다. 카카오 좌표에서 150m 안에 같은 상호가 있으면 `naver_url`을 채우고 `menu_check`를 적습니다. 메뉴 행은 네이버 메뉴판·상호·분류로 그 메뉴를 파는지도 봅니다. 네이버가 잠시 막으면(429) 기다렸다가 이어서 하고, 300곳에 5~7분 걸립니다. 메뉴별 검색 단어는 [scripts/match-naver.mjs](scripts/match-naver.mjs)의 `MENU_KEYWORDS`에 있습니다.
5. `npm run stores:images`를 실행하면 앱에 보이는 가게의 네이버 대표 사진 주소를 `image_url`에 적습니다. 사장님이 올린 사진을 먼저 쓰고, 없으면 첫 번째 사진을 씁니다. 사진이 없는 가게는 `-`로 적어 다시 묻지 않습니다. 같은 가게는 한 번만 물어서 300곳에 7분 정도 걸립니다.
6. 배민 앱에서 가게를 찾아 공유하기 → 링크 복사로 받은 `https://s.baemin.com/...` 링크를 `baemin_url`에 붙입니다. 지금 화면의 "배민 주문" 버튼은 이 링크 대신 huddling.club QR을 열지만, 링크를 붙여 둔 가게는 메뉴 확인과 상관없이 목록에 나옵니다.
7. `npm run stores:build`를 실행하면 앱에 보여 줄 가게를 `data/stores.json`으로 저장합니다. 지금은 시연용으로 배민 링크가 빈 가게에 더미 링크(`https://baemin.com/`, 누르면 배민 첫 화면)를 넣습니다. 실제 링크만 쓰려면 [package.json](package.json)의 `stores:build`에서 `--dummy-baemin`을 지웁니다.

| `menu_check` | 뜻 | 앱에 보임 |
|---|---|---|
| `category` | 카테고리 행: 카카오 분류로 나눴고 네이버에도 있음. 메뉴 행: 분류가 메뉴와 맞음 | 예 |
| `menu` | 네이버 메뉴판에 그 메뉴가 있음 | 예 |
| `name` | 상호에 메뉴 이름이 있음 (예: 뽀글뽀글 김치찌개) | 예 |
| `no` | 네이버 메뉴판을 봤는데 그 메뉴가 없음 | 아니요 |
| `unknown` | 네이버에 메뉴판이 없어 판단 못 함 | 아니요 |
| `not_found` | 네이버에서 같은 가게를 못 찾음 (폐업 가능성) | 아니요 |

배민 실제 링크를 붙인 가게는 직접 확인한 것으로 보고 `menu_check`와 상관없이 보여 줍니다. 후보를 다시 모아도 이미 채운 링크, 메모, 네이버 확인 결과는 지워지지 않습니다.

지금 앱에는 388곳이 들어 있습니다. 카테고리는 한식 28, 중식 26, 일식 29, 양식 29, 분식 20, 아시안 29, 고기 23, 해산물 26, 패스트푸드 29, 샐러드 35곳이고, 메뉴는 김치찌개 25, 돈까스 28, 국밥 32, 쌀국수 29곳입니다. 샐러드에는 샐러드 전문점과 메뉴판에 샐러드가 있는 가게가 함께 들어 있습니다.

## 파일 구조

| 파일 | 역할 |
|---|---|
| `App.tsx` | 화면 전체, 메뉴 상태와 저장, 메뉴 편집 바텀시트 |
| `components/MenuFishing.tsx` | 좌측 점심메뉴 낚시 앱. 홈부터 도감까지 화면 9개와 화면 사이 흐름 |
| `lib/fishing.ts` | 낚시 데이터: 메뉴별 픽셀 아이콘과 대표 요리, 시간대 문구, 반경 안 가게로 낚을 수 있는 메뉴 고르기, 도감과 연속 기록 저장 |
| `components/RouletteItemEditor.tsx` | 메뉴 추가·수정·삭제 로직과 목록 |
| `components/RouletteManager.tsx` | 메뉴 편집 바텀시트 |
| `components/StoreList.tsx`, `components/StoreRow.tsx` | 우측 목록에서 쓰던 가게 목록과 가게 한 줄. 우측 목록을 뺀 뒤로는 화면에 쓰이지 않음 |
| `components/OrderQr.tsx` | "배민 주문" 버튼이 여는 QR 창. 앱 전체에 하나만 그리고 huddling.club으로 보냄 |
| `components/FoodThumb.tsx`, `lib/foodStyles.ts` | 카테고리별 썸네일 파스텔과 아이콘. `assets/food/`에 파일이 있으면 그 아이콘을 씀 |
| `lib/location.ts` | 고정 위치(서울스퀘어). 가게 거리와 낚시터 반경의 기준 |
| `lib/stores.ts` | 메뉴별 가게 찾기와 거리순 정렬, 거리·분류 표시, 네이버 검색 링크 |
| `data/base.json` | 기준 위치(서울스퀘어) 좌표와 검색 지역 이름 |
| `data/categories.json` | 룰렛 기본 항목이자 가게를 나누는 카테고리 10개와 카카오 분류 규칙 |
| `data/candidates.csv` | 카카오 후보와 네이버 확인 결과, 사람이 채우는 링크 |
| `data/stores.json` | 앱이 보여 주는 확인된 가게. `npm run stores:build`가 만듦 |
| `scripts/fetch-categories.mjs`, `scripts/fetch-candidates.mjs` | 카카오에서 카테고리별 / 메뉴 이름별 후보 모으기 (공통 함수는 `scripts/kakao.mjs`) |
| `scripts/match-naver.mjs`, `scripts/fetch-images.mjs`, `scripts/build-stores.mjs` | 네이버에서 같은 가게와 메뉴 확인, 대표 사진 주소 모으기(공통 함수는 `scripts/naver.mjs`), 보여 줄 가게를 `stores.json`으로 내보내기 |
| `scripts/og-image.html`, `public/og-image.png` | 링크 공유 미리보기 이미지의 원본과 결과물 |
| `components/BottomSheet.tsx` | 메뉴 편집 바텀시트 껍데기 |
| `components/ui/input.tsx` | 입력창 ([shadcn/ui](https://ui.shadcn.com/), MIT) |
| `styles/globals.css` | Pretendard와 픽셀 글꼴(Press Start 2P), 색상 변수, 바텀시트와 낚시 애니메이션. 낚시 색은 `tailwind.config.ts`의 `fish` |

기술 스택은 Vite 5, React 18, TypeScript, Tailwind CSS 3, lucide-react, qrcode.react입니다.

## 원본에서 바꾼 점

- 원본에 커밋되어 있던 `node_modules`, 쓰지 않는 shadcn 컴포넌트 50여 개, Figma에서 내보낸 초안 파일은 가져오지 않았습니다.
- 아이콘 경로 파일을 `imports/svg-ib3k91vro6.ts`에서 `assets/svgPaths.ts`로 옮기고, 쓰는 아이콘 하나만 남겼습니다.
- 개발 모드에서 새로고침하면 추가한 항목이 기본값으로 돌아가던 버그를 고쳤습니다. 항목을 effect에서 읽지 않고 첫 렌더링 전에 읽도록 바꿨습니다.
- 이 프로젝트의 Tailwind 3에서는 동작하지 않는 v4 전용 CSS 문법(`@theme`, `@custom-variant`)을 지웠습니다. 화면에는 변화가 없습니다.
- 좌측 돌림판(`RouletteWheel.tsx`)과 모바일 결과 모달(`SimpleModal.tsx`)을 점심메뉴 낚시 앱으로 바꾸면서 지웠고, 돌림판 화면에서만 쓰던 `assets/svgPaths.ts`도 지웠습니다.
- 데스크톱 우측 카테고리 목록(`CategoryFeed.tsx`)과 데스크톱 여부 훅(`useIsDesktop.ts`)을 지우고 낚시 앱 한 화면만 남겼습니다.
- 기본 항목을 "항목 1~5"에서 근처 가게 카테고리 10개(한식, 중식, 일식, 양식, 분식, 아시안, 고기, 해산물, 패스트푸드, 샐러드)로 바꿨습니다. 기본 항목은 [data/categories.json](data/categories.json)에서 고치고, 고친 뒤에는 [App.tsx](App.tsx)의 `CURRENT_VERSION`을 올려야 이미 저장된 항목이 새 기본값으로 바뀝니다.
