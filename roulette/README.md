# 돌려돌려 돌림판

항목을 넣고 돌리면 하나를 뽑아 주는 룰렛 앱입니다. 점심 메뉴 룰렛 아이디어의 바탕으로 쓰려고 가져왔습니다.

원본은 `vespexx-platform/soonr-work-design` 저장소의 `250812-labs-roulette` 브랜치(커밋 `71d9b11`)이며, 여기서 룰렛에 필요한 파일만 골라 옮겼습니다.

## 실행

```bash
cd roulette
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다. 배포용 빌드는 `npm run build`로 만들고, 결과물은 `dist/`에 생깁니다.

## 기능

- 캔버스로 그린 돌림판이 3초 동안 감속하며 돌고, 12시 방향 포인터가 가리킨 메뉴를 보여 줍니다. 기본 항목은 근처 가게를 나눈 카테고리 10개입니다.
- 뽑힌 메뉴를 파는 서울스퀘어 근처 가게를 가까운 순으로 보여 줍니다. 가게를 누르면 네이버 지도(네이버 링크가 없으면 카카오맵)가 열리고, 배민 링크가 있는 가게에는 "배민 주문" 버튼이 붙습니다. 폰에서는 이 버튼이 배민 앱을 열고, PC에서는 폰 카메라로 찍을 QR을 펼칩니다.
- 확인한 가게가 없는 메뉴는 "네이버 지도에서 찾기" 버튼으로 "서울역 + 메뉴"를 검색합니다.
- 처음 돌리기를 누를 때 위치 권한을 묻습니다. 허용하고 서울스퀘어에서 3km 안에 있으면 내 위치에서 가까운 순으로, 아니면 서울스퀘어에서 가까운 순으로 정렬합니다. 위치는 HTTPS 주소나 localhost에서만 받을 수 있습니다.
- 메뉴는 추가하고, 이름을 눌러 수정하고, 휴지통 버튼으로 지웁니다.
- 항목은 브라우저 로컬 스토리지에 저장되어 새로고침해도 유지됩니다.

## 화면 구조

[kihya 데스크톱](https://m.kihya.com/) 구조를 따릅니다.

- **1024px 이상**: 크림색 배경 위에 좌측 모바일 앱(430px)과 우측 열(340px)을 나란히 둡니다. 우측 열 위쪽 카드에 뽑힌 메뉴와 근처 가게가 나오고(결과 모달은 띄우지 않음), 아래쪽 카드에서 메뉴를 바로 편집합니다. 앱의 "항목 추가하기"를 누르면 우측 입력창으로 이동합니다.
- **1024px 미만**: 모바일 앱 화면만 보이고, 결과 모달에 뽑힌 메뉴와 근처 가게가 나옵니다. "항목 추가하기"를 누르면 바텀시트에서 편집합니다.

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
5. 배민 앱에서 가게를 찾아 공유하기 → 링크 복사로 받은 `https://s.baemin.com/...` 링크를 `baemin_url`에 붙입니다.
6. `npm run stores:build`를 실행하면 앱에 보여 줄 가게를 `data/stores.json`으로 저장합니다. 지금은 시연용으로 배민 링크가 빈 가게에 더미 링크(`https://baemin.com/`, 누르면 배민 첫 화면)를 넣습니다. 실제 링크만 쓰려면 [package.json](package.json)의 `stores:build`에서 `--dummy-baemin`을 지웁니다.

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
| `App.tsx` | 화면 전체, 항목 상태와 저장, 돌리기 버튼과 결과 모달 |
| `components/RouletteWheel.tsx` | 캔버스 돌림판 그리기, 회전 애니메이션, 당첨 항목 계산 |
| `components/RouletteItemEditor.tsx` | 항목 추가·수정·삭제 로직과 목록. 바텀시트와 우측 카드가 함께 씀 |
| `components/RouletteManager.tsx` | 모바일 바텀시트 |
| `components/RouletteResultPanel.tsx` | 데스크톱 우측 위 카드: 뽑힌 메뉴와 근처 가게 |
| `components/StoreList.tsx` | 근처 가게 목록, 지도 링크, 배민 주문 버튼과 PC용 QR. 결과 카드와 모바일 결과 모달이 함께 씀 |
| `components/RouletteSidePanel.tsx` | 데스크톱 우측 아래 메뉴 목록 카드 |
| `hooks/useIsDesktop.ts` | 1024px 기준 데스크톱 여부 |
| `hooks/useUserLocation.ts` | 처음 돌릴 때 기기 위치를 한 번 받음 |
| `lib/location.ts` | 기기 위치 받기, 실패 시 기준 위치, 두 좌표 사이 거리 |
| `lib/stores.ts` | 메뉴별 가게 찾기와 거리순 정렬, 거리·분류 표시, 네이버 검색 링크 |
| `data/base.json` | 기준 위치(서울스퀘어) 좌표와 검색 지역 이름 |
| `data/categories.json` | 룰렛 기본 항목이자 가게를 나누는 카테고리 10개와 카카오 분류 규칙 |
| `data/candidates.csv` | 카카오 후보와 네이버 확인 결과, 사람이 채우는 링크 |
| `data/stores.json` | 앱이 보여 주는 확인된 가게. `npm run stores:build`가 만듦 |
| `scripts/fetch-categories.mjs`, `scripts/fetch-candidates.mjs` | 카카오에서 카테고리별 / 메뉴 이름별 후보 모으기 (공통 함수는 `scripts/kakao.mjs`) |
| `scripts/match-naver.mjs`, `scripts/build-stores.mjs` | 네이버에서 같은 가게와 메뉴 확인, 보여 줄 가게를 `stores.json`으로 내보내기 |
| `components/BottomSheet.tsx`, `components/SimpleModal.tsx` | 바텀시트와 모달 껍데기 |
| `components/ui/input.tsx` | 입력창 ([shadcn/ui](https://ui.shadcn.com/), MIT) |
| `styles/globals.css` | Pretendard 폰트, 색상 변수, 바텀시트 애니메이션 |

기술 스택은 Vite 5, React 18, TypeScript, Tailwind CSS 3, lucide-react, qrcode.react입니다.

## 원본에서 바꾼 점

- 원본에 커밋되어 있던 `node_modules`, 쓰지 않는 shadcn 컴포넌트 50여 개, Figma에서 내보낸 초안 파일은 가져오지 않았습니다.
- 아이콘 경로 파일을 `imports/svg-ib3k91vro6.ts`에서 `assets/svgPaths.ts`로 옮기고, 쓰는 아이콘 하나만 남겼습니다.
- 개발 모드에서 새로고침하면 추가한 항목이 기본값으로 돌아가던 버그를 고쳤습니다. 항목을 effect에서 읽지 않고 첫 렌더링 전에 읽도록 바꿨습니다.
- 이 프로젝트의 Tailwind 3에서는 동작하지 않는 v4 전용 CSS 문법(`@theme`, `@custom-variant`)을 지웠습니다. 화면에는 변화가 없습니다.
- 기본 항목을 "항목 1~5"에서 근처 가게 카테고리 10개(한식, 중식, 일식, 양식, 분식, 아시안, 고기, 해산물, 패스트푸드, 샐러드)로 바꿨습니다. 기본 항목은 [data/categories.json](data/categories.json)에서 고치고, 고친 뒤에는 [App.tsx](App.tsx)의 `CURRENT_VERSION`을 올려야 이미 저장된 항목이 새 기본값으로 바뀝니다.
