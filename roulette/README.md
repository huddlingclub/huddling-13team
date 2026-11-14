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

- 캔버스로 그린 돌림판이 3초 동안 감속하며 돌고, 12시 방향 포인터가 가리킨 항목을 결과 모달로 보여 줍니다.
- 메뉴는 추가하고, 이름을 눌러 수정하고, 휴지통 버튼으로 지웁니다.
- 항목은 브라우저 로컬 스토리지에 저장되어 새로고침해도 유지됩니다.

## 화면 구조

[kihya 데스크톱](https://m.kihya.com/) 구조를 따릅니다.

- **1024px 이상**: 크림색 배경 위에 좌측 모바일 앱(430px)과 우측 메뉴 목록 카드(340px)를 나란히 둡니다. 메뉴는 우측 카드에서 바로 편집하고, 카드 아래쪽에 최근 결과가 나옵니다. 앱의 "항목 추가하기"를 누르면 우측 입력창으로 이동합니다.
- **1024px 미만**: 모바일 앱 화면만 보이고, "항목 추가하기"를 누르면 바텀시트에서 편집합니다.

## 근처 가게 데이터

기준 위치는 서울스퀘어(서울특별시 중구 한강대로 416, [data/base.json](data/base.json))입니다. 카카오 로컬 API로 근처 음식점 후보를 뽑고, 팀원이 네이버 지도와 배민에서 직접 확인한 가게만 앱에 보여 줍니다. 배달 앱은 입점 여부를 알려 주는 공개 API가 없어서 이 확인은 사람이 합니다.

1. [카카오 디벨로퍼스](https://developers.kakao.com/)에서 앱을 만들고 카카오맵 사용 설정을 켠 뒤, `roulette/.env.local`에 `KAKAO_REST_API_KEY=REST API 키`를 한 줄로 적습니다. 이 파일은 git에 올라가지 않습니다.
2. `npm run stores:fetch`를 실행하면 기본 메뉴 5개를 반경 1km 안에서 가까운 순으로 검색해 `data/candidates.csv`에 저장합니다. 메뉴나 반경을 바꾸려면 `npm run stores:fetch -- 마라탕 --radius=1500`처럼 실행합니다.
3. CSV를 구글 시트나 엑셀에서 열고, 가게마다 네이버 지도의 공유 링크를 `naver_url`에, 배민 앱의 공유하기 → 링크 복사로 받은 `https://s.baemin.com/...` 링크를 `baemin_url`에 붙입니다. 메뉴당 3~5곳이면 충분합니다.
4. `npm run stores:build`를 실행하면 링크가 하나라도 있는 가게만 `data/stores.json`으로 저장합니다.

`stores:fetch`를 다시 실행해도 이미 채운 `naver_url`, `baemin_url`, `note`는 지워지지 않습니다. 앱에서 기기 위치를 받을 때는 [lib/location.ts](lib/location.ts)의 `getUserLocation`을 씁니다. 위치를 받지 못하면 서울스퀘어 좌표를 돌려줍니다.

## 파일 구조

| 파일 | 역할 |
|---|---|
| `App.tsx` | 화면 전체, 항목 상태와 저장, 돌리기 버튼과 결과 모달 |
| `components/RouletteWheel.tsx` | 캔버스 돌림판 그리기, 회전 애니메이션, 당첨 항목 계산 |
| `components/RouletteItemEditor.tsx` | 항목 추가·수정·삭제 로직과 목록. 바텀시트와 우측 카드가 함께 씀 |
| `components/RouletteManager.tsx` | 모바일 바텀시트 |
| `components/RouletteSidePanel.tsx` | 데스크톱 우측 메뉴 목록 카드 |
| `hooks/useIsDesktop.ts` | 1024px 기준 데스크톱 여부 |
| `lib/location.ts` | 기기 위치 받기, 실패 시 기준 위치, 두 좌표 사이 거리 |
| `data/base.json` | 기준 위치(서울스퀘어) 좌표 |
| `scripts/fetch-candidates.mjs`, `scripts/build-stores.mjs` | 근처 가게 후보 CSV 만들기, 확인한 가게를 `stores.json`으로 내보내기 |
| `components/BottomSheet.tsx`, `components/SimpleModal.tsx` | 바텀시트와 모달 껍데기 |
| `components/ui/input.tsx` | 입력창 ([shadcn/ui](https://ui.shadcn.com/), MIT) |
| `styles/globals.css` | Pretendard 폰트, 색상 변수, 바텀시트 애니메이션 |

기술 스택은 Vite 5, React 18, TypeScript, Tailwind CSS 3, lucide-react입니다.

## 원본에서 바꾼 점

- 원본에 커밋되어 있던 `node_modules`, 쓰지 않는 shadcn 컴포넌트 50여 개, Figma에서 내보낸 초안 파일은 가져오지 않았습니다.
- 아이콘 경로 파일을 `imports/svg-ib3k91vro6.ts`에서 `assets/svgPaths.ts`로 옮기고, 쓰는 아이콘 하나만 남겼습니다.
- 개발 모드에서 새로고침하면 추가한 항목이 기본값으로 돌아가던 버그를 고쳤습니다. 항목을 effect에서 읽지 않고 첫 렌더링 전에 읽도록 바꿨습니다.
- 이 프로젝트의 Tailwind 3에서는 동작하지 않는 v4 전용 CSS 문법(`@theme`, `@custom-variant`)을 지웠습니다. 화면에는 변화가 없습니다.
- 기본 항목을 "항목 1~5"에서 점심 메뉴 5개(김치찌개, 돈까스, 국밥, 쌀국수, 샐러드)로 바꿨습니다. 기본 항목은 [App.tsx](App.tsx)의 `DEFAULT_ITEMS`에서 고치고, 고친 뒤에는 `CURRENT_VERSION`을 올려야 이미 저장된 항목이 새 기본값으로 바뀝니다.
