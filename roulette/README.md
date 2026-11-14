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

## 파일 구조

| 파일 | 역할 |
|---|---|
| `App.tsx` | 화면 전체, 항목 상태와 저장, 돌리기 버튼과 결과 모달 |
| `components/RouletteWheel.tsx` | 캔버스 돌림판 그리기, 회전 애니메이션, 당첨 항목 계산 |
| `components/RouletteItemEditor.tsx` | 항목 추가·수정·삭제 로직과 목록. 바텀시트와 우측 카드가 함께 씀 |
| `components/RouletteManager.tsx` | 모바일 바텀시트 |
| `components/RouletteSidePanel.tsx` | 데스크톱 우측 메뉴 목록 카드 |
| `hooks/useIsDesktop.ts` | 1024px 기준 데스크톱 여부 |
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
