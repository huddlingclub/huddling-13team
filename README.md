# 허들링클럽 13팀 · 조이허브

2026년 11월 14일 허들링클럽(#1114-허들링클럽) 13팀 작업 저장소입니다.

## 팀

- **팀명**: 조이허브
- **멤버**: 준, jhj3697510, 김연정, SooHee Kim, 이수진

## 진행 상황

- 저장소 클론 완료 (2026-11-14 11:03 KST)
- 컨셉 논의 진행 중
- 점심메뉴 낚시를 [clipfriends.club/huddling](https://clipfriends.club/huddling/)에 배포함 (마지막 배포 2026-11-14 16:28 KST). 하루 작업은 아래 [작업 기록](#작업-기록-2026-11-14)에 있습니다
- 서비스([clipfriends.club/huddling](https://clipfriends.club/huddling/))는 2026-11-14 24:00 KST까지만 웹에 공개 (준, 18:13 KST)
- 해커톤에서 팀이 상을 받음 (18:20 KST Slack 언급)
- 16:03~18:20 KST 사이 팀원들의 마무리 인사가 오감
- 최종 업데이트: 2026-11-14 18:25 KST

## 일정

- 11:55 퀵싱크
- 12시부터 3시간 단위 청크로 작업
- **2시까지 완료해야 함**

(준, 2026-11-14 11:52 KST)

## 아이디어 후보

최종 아이디어는 **점심 메뉴 룰렛** (얼음낚시 컨셉)으로 결정되었습니다. 팀원들의 반응이 가장 좋았고, 이후 논의도 이 방향으로 진행되었습니다.

| # | 아이디어 | 내용 | 제안 | 상태 |
|---|---|---|---|---|
| 1 | **점심 메뉴 룰렛** | 룰렛을 돌려 점심 메뉴를 고르고, 그 메뉴를 파는 근처 가게를 추려서 보여준다 | 준 | **✅ 선택** |
| 2 | 우산 가져가 | 비 오는 날 날씨 API로 알림을 띄워 우산을 챙기게 한다 | jhj3697510 | 후보 |
| 3 | 퍼디·버디 얼굴 맞추기 게임 | [치이카와 퍼즐 게임](https://chiikawawallpaper.com/ko/puzzle) 같은 얼굴 맞추기 게임. 같은 게임 로직으로 "햄버거 그리기"를 만드는 변형안도 나옴 (준) | jhj3697510 | 후보 |
| 4 | 하고 싶은 일 리스트 | 귀여운 화면의 버킷리스트. 완료한 항목에 귀여운 스티커를 붙인다 | jhj3697510 | 후보 |

---

## 🎣 얼음낚시 컨셉 (점심 메뉴 룰렛)

### 문제 정의

배가 고픈 결정장애 퍼디가 배달을 시키려고 할 때, 낚시를 하면 메뉴를 고를 수 있다. (jhj3697510)

### 기본 흐름 (Flow)

1. **메뉴 선정**: 내 주변 주문 가능한 메뉴들로 룰렛/뽑기를 돌려 메뉴 선정
2. **가게 리스트**: 메뉴가 선택되면 배달 API 연결되어 가게 리스트업
3. **대기 화면**: 리스트업 되는 동안 뽑힌 메뉴 조각을 모아 치이카와 스타일 스티커/그림 완성

### 캐릭터와 세계관

- **펭귄 퍼디/버디**가 얼음낚시를 해서 음식을 뽑아 올림
- 문구: **"펭귄이 못 먹으니 우리가 대신 먹어줄게요"** 같은 귀여운 카피
- 서비스 종료 화면: **베스트 팀원상** 추가

### 비주얼 요소

- **배경**: 이글루 + 호수
- **소품**: 낚시대, 양동이
- **디자인 방향**: 토스 스타일 1페이지 1띵 형태 (준, 12:47 KST)
- **음식 이미지**:
  - 1차: 픽셀 이미지
  - 추후: Higgsfield로 실사 음식 이미지 전환 고려

### 효과 (선택 사항, 전부 넣지 않아도 됨)

- 물결
- 찌 주변 파문
- 눈발
- 물속 거품
- 낮에는 밝고 밤에는 어두운 배경
- 낚시 로딩 중 **'펭차펭차'** 소리 (jhj3697510 제안)

### 게임·UX 제안

- **뽑기 개수**: 최소 3, 최대 10개 (SooHee Kim, 12:46 KST)
- **새로 생긴 가게 = 레어 물고기**: 근처에 최근 생긴 가게가 나오면 반짝이는 희귀 등급으로 보여 줌 (김연정)
- **낚시 준비 단계**: 조건들을 미끼 모양으로 표현 (jhj3697510)
- **인터넷 연결 실패 시**: 연결이 안 될 때 실패 또는 다른 모션 띄우기 (jhj3697510, 12:12 KST)

### 메인 화면 시간대별 문구

모바일 기기 기준으로 시간대에 맞는 메인 문구를 호출합니다.

| 시간대 | 메인 문구 | 대체 문구 (A/B용) |
|---|---|---|
| 05:00 ~ 07:00 | 든든한 아침 한 끼, 낚아볼까요? | 하루의 시작, 뭘 먹을까요? |
| 07:00 ~ 10:00 | 아침 메뉴가 고민이신가요? | 가볍게 속을 채울 메뉴를 낚아보세요 |
| 10:00 ~ 11:30 | 브런치를 드시고 싶은가요? | 늦은 아침, 여유롭게 한 끼 어때요? |
| 11:30 ~ 13:30 | 점심 메뉴가 고민이신가요? | 오늘 점심, 얼음 구멍 속에 있을지도 몰라요 |
| 13:30 ~ 15:00 | 늦은 점심을 드시고 싶은가요? | 아직 점심 전이라면 지금이 기회예요 |
| 15:00 ~ 17:00 | 출출한 오후, 간식 어떠세요? | 달콤한 간식을 낚아볼까요? |
| 17:00 ~ 20:00 | 특별한 저녁을 드시고 싶은가요? | 오늘 저녁, 뭐가 잡힐까요? |
| 20:00 ~ 22:00 | 하루를 마무리할 한 끼가 필요하세요? | 오늘 수고한 나에게 주는 한 끼 |
| 22:00 ~ 24:00 | 야식이 당기는 밤이네요 | 야식, 낚시할까요? 🎣 |
| 00:00 ~ 05:00 | 잠이 안 오는 새벽, 뭐라도 드실래요? | 새벽 감성 메뉴, 낚아볼까요? |

**적용 팁** (SooHee Kim):
- 경계 시간(11:30, 13:30 등)은 "이상 ~ 미만"으로 처리하면 겹치지 않아요.
- 대체 문구를 두면 접속할 때마다 랜덤으로 보여줄 수 있어요.
- 낚시 콘셉트를 더 살리려면 버튼 문구를 "낚시 시작하기"나 "구멍 뚫기"로 통일하는 것도 좋아요.
- 주말과 평일에 브런치 구간 시간을 다르게 두는 것도 고려해볼 만해요.

---

## 도메인 후보 (미확정)

김연정 제안. 확정되지 않았습니다.

| 도메인 | 의미 | 비고 |
|---|---|---|
| icebite.kr | 얼음 + 한입(입질). 차가운 배경과 따뜻한 음식의 대비 | |
| menuhole.com | 메뉴 + 얼음 구멍 | |
| bboggle.kr | 뽀글뽀글 (물속 거품). 로딩 연출과 잘 맞음 | |
| pongdang.kr | 퐁당 (찌가 물에 떨어지는 소리) | |
| **kkoruk.kr** | 꼬르륵 (얼음 구멍 거품 + 배고플 때 소리) | 김연정 추천, jhj3697510 1표 |

---

## 구현 노트

### 배달 및 가게 데이터

**배달 앱 공개 API 없음:**
- 배달의민족, 쿠팡이츠, 요기요, 네이버 배달은 일반 개발자용 위치 기반 가게 검색 API나 공식 딥링크를 제공하지 않습니다.

**대안:**
1. **[카카오 로컬 API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)**를 사용해 근처 음식점 검색
   - 카테고리 `FD6` (음식점)
   - 키워드 검색 + 좌표(x, y) + 반경(radius)
2. **소상공인 상가(상권)정보 오픈 데이터** ([data.go.kr](https://www.data.go.kr))로 근처 음식점 검색
3. 배달 앱 연결은 앱 스킴(`baemin://`, `yogiyo://` 등, 비공식이며 변경될 수 있음)으로 앱을 열고 메뉴명을 클립보드에 복사하거나, 네이버/카카오 지도 링크로 대체

### 우산 가져가 (참고용)

- 기상청 단기예보 API (공공데이터포털)
- OpenWeatherMap으로 강수 확률 받아오기

## 작업 방법

1. 저장소를 처음 한 번만 클론합니다. Codex에 "이 저장소를 내 데스크톱 경로에 클론해줘"라고 요청하거나 직접 실행합니다.

   ```bash
   git clone https://github.com/huddlingclub/huddling-13team.git ~/Desktop/huddling-13team
   ```

2. 각자 브랜치를 만들어 작업합니다. `main`에 직접 푸시하지 않습니다.

   ```bash
   git switch -c 이름/작업내용
   ```

3. 작업한 브랜치를 푸시하고 Pull Request를 엽니다.

   ```bash
   git push -u origin 이름/작업내용
   ```

팀 채팅방에는 준이 메인 에이전트를 붙일 예정입니다.

## 프로젝트 구조

| 폴더 | 내용 |
|---|---|
| [roulette/](roulette/) | 점심메뉴 낚시 앱 (Vite + React). 돌림판 앱에서 시작했고 [clipfriends.club/huddling](https://clipfriends.club/huddling/)에 배포됨 |

### 작업 브랜치

- [이수진/에셋-아이콘](https://github.com/huddlingclub/huddling-13team/tree/%EC%9D%B4%EC%88%98%EC%A7%84/%EC%97%90%EC%85%8B-%EC%95%84%EC%9D%B4%EC%BD%98) (이수진, 13:58 KST)

## 작업 기록 (2026-11-14)

오늘 이 저장소에서 한 작업을 커밋, 브랜치, PR, 배포로 모았습니다. 시간은 모두 한국 시간(KST)이고, 커밋 작성자 keepYaoung은 준입니다.

오늘 결과물은 [clipfriends.club/huddling](https://clipfriends.club/huddling/)에 올라간 **점심메뉴 낚시**입니다. 펭귄 퍼디가 얼음 구멍에서 점심 메뉴를 낚아 올리면 그 메뉴를 파는 서울스퀘어 근처 가게를 사진, 거리와 함께 보여 주고, "주문하기"를 누르면 huddling.club으로 가는 QR이 뜹니다. `main`에 `roulette/` 변경이 합쳐지면 GitHub Actions가 자동으로 다시 배포합니다.

### 하루 흐름

| 시간 | 한 일 | 브랜치 · PR |
|---|---|---|
| 11:00–11:42 | README를 쓰고, soonr-work-design의 돌림판 앱을 가져와 점심 메뉴 룰렛과 데스크톱 2단 화면으로 바꿈 | `main` |
| 11:56–13:19 | 서울스퀘어 1km 근처 가게 데이터(카카오로 모으고 네이버로 확인), 카테고리 10개, Cloudflare Worker 배포와 자동 배포 | `joon-infra` · [#1](https://github.com/huddlingclub/huddling-13team/pull/1) |
| 13:48–14:21 | 우측 카테고리 카드를 만든 뒤 점심메뉴 낚시 한 화면으로 바꾸고, 주문하기를 QR 창으로 | `joon/category-feed` · [#2](https://github.com/huddlingclub/huddling-13team/pull/2) |
| 13:49 | `/huddling` 전용 펭귄 파비콘 | `main` |
| 14:33–14:53 | 가게 대표 사진, 탭 제목 "꼬륵 : 낚아낚아 퍼디", 다시 낚시 FAB, 끌어올리기 애니메이션, 데이터 메시지 박스, 홈 검색 스켈레톤 | `joon/store-photos` · [#3](https://github.com/huddlingclub/huddling-13team/pull/3) |
| 15:01–15:04 | 캐스팅·입질 화면을 빙판 위 얼음 구멍 낚시로 | `joon/ice-fishing` · [#4](https://github.com/huddlingclub/huddling-13team/pull/4) |
| 15:26–15:27 | 메시지 박스에 화면마다 식사 시간(TIME)과 주변 검색 결과(NEAR) | `joon/note-status` · [#5](https://github.com/huddlingclub/huddling-13team/pull/5) |
| 16:12–16:13 | README에 오늘 작업 기록(이 섹션) | `joon/worklog` · [#6](https://github.com/huddlingclub/huddling-13team/pull/6) |
| 16:27–16:28 | 링크 공유 미리보기(OG) 이미지와 메타 태그. 펭귄 퍼디가 얼음 구멍에서 비빔밥을 낚는 장면 | `joon/og-image` · [#7](https://github.com/huddlingclub/huddling-13team/pull/7) |

### PR

| PR | 브랜치 | 제목 | 열림 → 합침 | 합친 커밋 |
|---|---|---|---|---|
| [#1](https://github.com/huddlingclub/huddling-13team/pull/1) | `joon-infra` | 점심 룰렛: 근처 가게 목록과 clipfriends.club/huddling 배포 | 13:06 → 13:19 | `d2c5d10` |
| [#2](https://github.com/huddlingclub/huddling-13team/pull/2) | `joon/category-feed` | 우측 목록: 카테고리별 카드(참고 디자인 색)와 흰 배경 | 13:49 → 14:21 | `408099c` |
| [#3](https://github.com/huddlingclub/huddling-13team/pull/3) | `joon/store-photos` | 낚시 화면: 가게 사진, 탭 제목, 다시 낚시 FAB, 끌어올리기 애니메이션, 데이터 메시지 박스 | 14:33 → 14:53 | `10fe7a7` |
| [#4](https://github.com/huddlingclub/huddling-13team/pull/4) | `joon/ice-fishing` | 낚시 화면: 빙판 위 얼음 구멍에서 낚시하기 | 15:02 → 15:04 | `0535e98` |
| [#5](https://github.com/huddlingclub/huddling-13team/pull/5) | `joon/note-status` | 메시지 박스: 화면마다 식사 시간과 주변 검색 결과 보여 주기 | 15:27 → 15:27 | `90ec33b` |
| [#6](https://github.com/huddlingclub/huddling-13team/pull/6) | `joon/worklog` | README: 2026-11-14 작업 기록(커밋, 브랜치, PR, 배포) | 16:12 → 16:13 | `6c0e653` |
| [#7](https://github.com/huddlingclub/huddling-13team/pull/7) | `joon/og-image` | 공유 미리보기(OG) 이미지: 펭귄 퍼디가 메뉴를 낚는 장면 | 16:28 → 16:28 | `eafc6a3` |

PR #2는 연 뒤에도 같은 브랜치에서 작업을 이어 갔습니다. 우측 카드 목록은 결국 빠지고 점심메뉴 낚시 한 화면이 되었고, 준이 이 브랜치를 `main`에 직접 합쳐서(`408099c`) GitHub에는 PR #2가 합쳐진 것으로 표시됩니다.

### 브랜치

| 브랜치 | 만든 사람 | 상태 |
|---|---|---|
| `main` | | 배포 기준. 마지막 배포 커밋 `eafc6a3` (16:28) |
| `joon-infra` | 준 | PR #1로 합침 |
| `joon/category-feed` | 준 | PR #2로 합침 |
| `joon/store-photos` | 준 | PR #3로 합침 |
| `joon/ice-fishing` | 준 | PR #4로 합침 |
| `joon/note-status` | 준 | PR #5로 합침 |
| `joon/worklog` | 준 | PR #6으로 합침 |
| `joon/og-image` | 준 | PR #7로 합침 |
| [`이수진/에셋-아이콘`](https://github.com/huddlingclub/huddling-13team/tree/%EC%9D%B4%EC%88%98%EC%A7%84/%EC%97%90%EC%85%8B-%EC%95%84%EC%9D%B4%EC%BD%98) | 이수진 | **아직 합치지 않음, PR 없음.** `roulette/public/menu/`에 카테고리 아이콘 10종(96×96 픽셀아트 SVG)이 있음. 지금 앱은 `roulette/assets/fishing/menu/`의 다른 아이콘을 씀 |

합친 브랜치 일곱 개는 원격에 그대로 남아 있습니다.

### 커밋

시간순입니다. 브랜치 칸은 커밋을 처음 올린 브랜치입니다.

| 시간 | 커밋 | 브랜치 | 내용 |
|---|---|---|---|
| 11:00 | `4af1c2c` | `main` | 팀 소개와 작업 방법 README 추가 |
| 11:16 | `4b72777` | `main` | soonr-work-design에서 돌림판 앱 가져오기 |
| 11:20 | `9dd1502` | `main` | 기본 항목을 점심 메뉴로 변경 |
| 11:42 | `c73e1f3` | `main` | 데스크톱에서 좌측 앱 + 우측 메뉴 목록 레이아웃 |
| 11:56 | `b371d43` | `joon-infra` | 서울스퀘어 기준 근처 가게 후보 스크립트와 기기 위치 모듈 |
| 12:10 | `b107ad8` | `joon-infra` | 뽑힌 메뉴의 근처 가게를 네이버 지도 링크와 배민 주문 버튼으로 보여 주기 |
| 12:14 | `bfcf1a7` | `joon-infra` | 카카오 401 안내에 클라이언트 시크릿 혼동 추가 |
| 12:20 | `b321155` | `joon-infra` | 서울스퀘어 반경 1km 메뉴별 후보 가게 217곳 |
| 12:28 | `a4c6026` | `joon-infra` | 서울스퀘어 1km 메뉴별 5곳에 네이버 링크와 더미 배민 링크 채우기 |
| 12:41 | `3c9ff78` | `joon-infra` | 카카오 후보를 네이버에서 같은 상호로 찾아 메뉴 확인, 137곳 채우기 |
| 12:53 | `9e6987d` | `joon-infra` | 서울스퀘어 1km 음식점을 카테고리 10개로 나누고 룰렛 기본 항목으로 쓰기 |
| 13:06 | `e2ff001` | `joon-infra` | clipfriends.club/huddling에 Cloudflare Worker로 배포, main 푸시 시 자동 배포 |
| 13:19 | `d2c5d10` | `main` | PR #1 합침 |
| 13:48 | `11e1c8b` | `joon/category-feed` | 우측 목록을 카테고리별 카드(Morning/Evening Circle 참고)로 바꾸고 흰 배경 적용 |
| 13:48 | `1b6b7e1` | `이수진/에셋-아이콘` | 점심 메뉴 카테고리 아이콘 10종 추가 (이수진) |
| 13:49 | `08ab92c` | `main` | /huddling 전용 펭귄 파비콘 |
| 13:53 | `19db6ca` | `joon/category-feed` | 배민 주문 버튼이 huddling.club으로 가는 QR 하나를 창으로 열기 |
| 14:10 | `eb0e7ea` | `joon/category-feed` | 좌측 앱을 점심메뉴 낚시 프로토타입(홈~도감, 빈 바다)으로 바꾸기 |
| 14:18 | `b23839b` | `joon/category-feed` | 우측 목록을 빼고 점심메뉴 낚시 한 화면으로, 주문하기는 QR 모달만 띄우기 |
| 14:20 | `408099c` | `main` | `joon/category-feed` 합침 (PR #2) |
| 14:33 | `6d55b8b` | `joon/store-photos` | 가게 목록 썸네일을 각 가게의 네이버 대표 사진으로 |
| 14:41 | `5cc3fbf` | `joon/store-photos` | 탭 제목 꼬륵, 가게 목록 다시 낚시 FAB, 끌어올리기 애니메이션 보강 |
| 14:48 | `971cf9b` | `joon/store-photos` | 데스크톱 왼쪽에 화면별 데이터(DB·API) 메시지 박스 |
| 14:52 | `fd29a45` | `joon/store-photos` | 홈 오늘 바다에 사는 메뉴에 근처 검색 스켈레톤 |
| 14:53 | `10fe7a7` | `main` | PR #3 합침 |
| 15:01 | `67d73e4` | `joon/ice-fishing` | 캐스팅·입질 화면을 빙판 위 얼음 구멍 낚시로 |
| 15:04 | `0535e98` | `main` | PR #4 합침 |
| 15:26 | `4156589` | `joon/note-status` | 메시지 박스에 화면마다 식사 시간과 주변 검색 결과 붙이기 |
| 15:27 | `90ec33b` | `main` | PR #5 합침 |
| 16:12 | `d391f61` | `joon/worklog` | README에 2026-11-14 작업 기록(커밋·브랜치·PR·배포) 추가 |
| 16:13 | `6c0e653` | `main` | PR #6 합침 |
| 16:27 | `b28d690` | `joon/og-image` | 펭귄 퍼디가 메뉴를 낚는 공유 미리보기(OG) 이미지 |
| 16:28 | `eafc6a3` | `main` | PR #7 합침 |

이 밖에 Cursor Agent가 Slack 대화를 이 README에 반영한 커밋 7개가 `main`에 있습니다: `b2157ec`(11:34), `af21d14`(11:57), `776d9e0`(12:27), `ab8aa2b`(12:58), `edaf51e`(13:12), `395fa89`(13:29), `a9556bf`(13:59).

### 배포

`.github/workflows/deploy-roulette.yml`(Deploy roulette)이 `main`의 `roulette/`가 바뀔 때마다 빌드하고 `wrangler deploy`로 Worker `huddling-roulette`에 올립니다. 이 Worker는 `clipfriends.club/huddling`과 `/huddling/*`만 맡고, 도메인의 다른 경로는 기존 앱 그대로입니다. PR #1을 열기 전에 `joon-infra`를 `wrangler deploy`로 한 번 직접 올렸고, 그 뒤로는 모두 Actions가 배포했습니다. 서비스는 2026-11-14 24:00 KST까지만 웹에 공개합니다 (준, 18:13 KST).

| 시간 | 계기 | 결과 |
|---|---|---|
| 13:20 | PR #1 합침 `d2c5d10` | 성공 |
| 13:49 | 파비콘 커밋 `08ab92c` | 성공 |
| 14:21 | `joon/category-feed` 합침 `408099c` | 성공 |
| 14:53 | PR #3 합침 `10fe7a7` | 성공 |
| 15:04 | PR #4 합침 `0535e98` | 성공 |
| 15:27 | PR #5 합침 `90ec33b` | 성공 |
| 16:28 | PR #7 합침 `eafc6a3` | 성공 |

PR #6은 루트 README만 바꿔서 배포가 돌지 않았습니다.

### 데이터와 키

- **가게 데이터**: 서울스퀘어(서울 중구 한강대로 416) 반경 1km 음식점 1,421곳을 카카오 로컬 API로 모으고, 네이버 지도에서 같은 가게를 확인한 388줄을 `roulette/data/stores.json`에 넣었습니다. 한 가게가 여러 메뉴에 들어간 경우가 있어 실제 가게는 303곳이고, 384줄에 네이버 대표 사진이 있습니다.
- **카테고리**: 한식, 중식, 일식, 양식, 분식, 아시안, 고기, 해산물, 패스트푸드, 샐러드 10개(`roulette/data/categories.json`).
- **주문하기**: 누르면 https://www.huddling.club/ 로 가는 QR 하나를 띄웁니다. 가게 데이터의 배민 링크는 아직 더미(`https://baemin.com/`)입니다.
- **키**: 카카오 REST API 키는 `roulette/.env.local`에만 있고 git에는 올리지 않았습니다. 배포용 Cloudflare 토큰은 저장소 시크릿 `CLOUDFLARE_API_TOKEN`입니다.

## 참고 링크 · 디자인

- [DesignBookmark](https://designbookmark.com/): 바이브 디자인할 때 쓸 디자인 도구와 리소스 2,000여 개 모음
- [치이카와 퍼즐 게임](https://chiikawawallpaper.com/ko/puzzle): 얼굴 맞추기 게임 레퍼런스
- [Pinterest 레퍼런스](https://pin.it/1wWvtfXoP): SooHee Kim 제공 비주얼 레퍼런스
- [SooHee Kim Figma](https://www.figma.com/design/tTieHZTKxCkx7r83I1VRFL/huddling-club-13%EC%A1%B0?node-id=0-1&t=Ua1sE7SxwKBrgTow-1): 팀 피그마 파일
- [이수진 유저플로우 Figma](https://www.figma.com/design/mXFwcvJ5qChL2YuGdSZi66/%ED%97%88%EB%93%A4%EB%A7%81-%ED%81%B4%EB%9F%BD-%EC%9C%A0%EC%A0%80%ED%94%8C%EB%A1%9C%EC%9A%B0?node-id=0-1&t=JmN0o2OSlLWRwLGb-1): 이 화면에 플로우 정리 예정
- [SooHee Kim Figma Make: 플로우 기반 화면 생성](https://www.figma.com/make/Rv4DRcyyqOPPp9a67d3v3O/%ED%94%8C%EB%A1%9C%EC%9A%B0-%EA%B8%B0%EB%B0%98-%ED%99%94%EB%A9%B4-%EC%83%9D%EC%84%B1?t=sYNWziFgi39lzf5N-1) (12:46 KST)
- [SooHee Kim Figma Site](https://mull-bulk-22700610.figma.site) (12:47 KST)
- 김연정이 Slack에 픽셀 이미지 스타일 레퍼런스 이미지를 공유함 (12:51 KST). 이미지는 Slack에만 있음
- 김연정이 Slack에 음식 아이콘 참고 이미지를 공유함 (13:05 KST, "음식아이콘 참고해주세요!"). 이미지는 Slack에만 있음
- [clipfriends.club/huddling](https://clipfriends.club/huddling/): 준이 공유한 링크 (13:07 KST)
- [김연정 Figma (eXCFrame 고도화)](https://www.figma.com/design/H8ixrCTB4yIGAxUEqVv7WQ/eXCFrame-%EA%B3%A0%EB%8F%84%ED%99%94?node-id=307-2346&t=QMGNielYkpJSgEmJ-1): 김연정 공유 (13:19 KST)
- jhj3697510이 Slack에 움직이는 배경 이미지를 공유함 (13:25 KST, "이건 움직이는 배경입니다"). 이미지는 Slack에만 있음
- jhj3697510이 Slack에 파비콘 이미지를 공유함 (13:43 KST). 이미지는 Slack에만 있음
- 김연정이 Slack에 디자인 압축파일(zip)을 공유함 (13:48 KST). 파일은 Slack에만 있음
