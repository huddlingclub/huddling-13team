import type { RouletteItem } from '../types';
import { findNearbyStores, type NearbyStore } from './stores';

// 점심메뉴 낚시(좌측 앱) 데이터. 디자인 원본은 팀에서 공유한 menu-fishing.html 프로토타입이다.

// 카테고리마다 픽셀 아이콘(assets/fishing/menu/<slug>.svg)과 결과 화면에 보여 줄 대표 요리.
const MENU_ART: Record<string, { slug: string; dish: string }> = {
  한식: { slug: 'hansik', dish: '비빔밥' },
  중식: { slug: 'jungsik', dish: '짜장면' },
  일식: { slug: 'ilsik', dish: '연어초밥' },
  분식: { slug: 'bunsik', dish: '떡볶이' },
  양식: { slug: 'yangsik', dish: '토마토 파스타' },
  아시안: { slug: 'asian', dish: '쌀국수' },
  고기: { slug: 'gogi', dish: '삼겹살' },
  해산물: { slug: 'haesanmul', dish: '생선구이' },
  패스트푸드: { slug: 'fastfood', dish: '햄버거' },
  샐러드: { slug: 'salad', dish: '샐러드 볼' },
};

const ICONS = import.meta.glob('../assets/fishing/menu/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

// 직접 넣은 메뉴처럼 픽셀 아이콘이 없으면 icon은 null이고 dish는 메뉴 이름 그대로다.
export function menuArt(menu: string): { icon: string | null; dish: string } {
  const name = menu.trim();
  const art = MENU_ART[name];
  return {
    icon: art ? ICONS['../assets/fishing/menu/' + art.slug + '.svg'] ?? null : null,
    dish: art?.dish ?? name,
  };
}

// 시간대별 메인 문구. [from, to) 시각(11.5 = 11:30), 칩 이름, 메인 문구, 대체 문구.
// 루트 README의 "메인 화면 시간대별 문구" 표를 프로토타입에서 다듬은 버전이다.
const TIME_COPY: [number, number, string, string, string][] = [
  [5, 7, '아침', '든든한 아침 한 끼, 낚아볼까요?', '하루의 시작, 뭘 먹을까요?'],
  [7, 10, '아침', '아침 메뉴가\n고민이신가요?', '가볍게 속을 채울 메뉴를 낚아보세요'],
  [10, 11.5, '브런치', '브런치를\n드시고 싶은가요?', '늦은 아침, 여유롭게 한 끼 어때요?'],
  [11.5, 13.5, '점심', '점심 메뉴가\n고민이신가요?', '고민은 퍼디가 할게요. 던지기만 하세요'],
  [13.5, 15, '늦은 점심', '늦은 점심을\n드시고 싶은가요?', '아직 점심 전이라면 지금이 기회예요'],
  [15, 17, '간식', '출출한 오후,\n간식 어떠세요?', '달콤한 간식을 낚아볼까요?'],
  [17, 20, '저녁', '특별한 저녁을\n드시고 싶은가요?', '오늘 저녁, 뭐가 잡힐까요?'],
  [20, 22, '저녁', '하루를 마무리할\n한 끼가 필요하세요?', '오늘 수고한 나에게 주는 한 끼'],
  [22, 24, '야식', '야식이 당기는\n밤이네요', '야식, 낚시해볼까요?'],
  [0, 5, '새벽', '잠이 안 오는 새벽,\n뭐라도 드실래요?', '새벽 감성 메뉴, 낚아볼까요?'],
];

const SHARED_SUB = '고민은 퍼디가 할게요. 던지기만 하세요';

export interface Greeting {
  meal: string; // 식사 시간 이름. 예: "늦은 점심"
  range: string; // 그 식사 시간의 구간. 예: "13:30–15:00"
  checkedAt: string; // 식사 시간을 고를 때 읽은 기기 시각. 예: "14:05"
  title: string; // 줄바꿈(\n) 포함
  sub: string;
}

// 홈에 들어올 때마다 기기 시각을 읽어 식사 시간을 고른다. 보조 문구는 대체 문구와 공통 문구 중 하나를 무작위로 고른다.
export function timeGreeting(now: Date): Greeting {
  const h = now.getHours() + now.getMinutes() / 60;
  const [from, to, label, title, alt] = TIME_COPY.find(([f, t]) => h >= f && h < t) ?? TIME_COPY[3];
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = (v: number) => pad(Math.floor(v) % 24) + ':' + (v % 1 ? '30' : '00');
  return {
    meal: label,
    range: clock(from) + '–' + clock(to),
    checkedAt: pad(now.getHours()) + ':' + pad(now.getMinutes()),
    title,
    sub: Math.random() < 0.5 ? alt : SHARED_SUB,
  };
}

// 낚시터 반경(미터). 서울스퀘어에서 잰다. 가게 데이터가 서울스퀘어 1km 안이라 2km는 1km와 같은 가게를 보여 준다.
export const RADIUS_OPTIONS = [500, 1000, 2000];
export const DEFAULT_RADIUS = 1000;

export function radiusLabel(meters: number): string {
  return meters < 1000 ? meters + 'm' : meters / 1000 + 'km';
}

export interface SeaMenu {
  item: RouletteItem;
  stores: NearbyStore[]; // 반경 안의 가게, 가까운 순
  known: boolean; // 데이터에 이 메뉴의 가게가 한 곳이라도 있는지
}

export function seaMenus(items: RouletteItem[], radius: number): SeaMenu[] {
  return items.map((item) => {
    const stores = findNearbyStores(item.text);
    return { item, stores: stores.filter((s) => (s.distance ?? Infinity) <= radius), known: stores.length > 0 };
  });
}

// 반경 안에 가게가 있으면 낚을 수 있다. 가게 데이터가 없는 메뉴(직접 넣은 메뉴)는
// 거리를 모르니 늘 낚을 수 있고, 가게 화면에서 네이버 지도 검색으로 이어진다.
export function catchable(menu: SeaMenu): boolean {
  return !menu.known || menu.stores.length > 0;
}

// 메뉴 도감과 연속 기록. 가게 화면에서 "주문하기"를 누를 때 쌓인다.
const DEX_KEY = 'fishingDex';
const STREAK_KEY = 'fishingStreak';

export interface Streak {
  last: string; // 마지막으로 낚은 날(YYYY-MM-DD, 기기 시간대)
  days: number;
}

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 시크릿 창 등에서 저장이 막혀도 낚시는 계속한다.
  }
}

function dayKey(d: Date): string {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

function yesterdayKey(now: Date): string {
  return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

export function loadDex(): string[] {
  const saved = readJson<unknown>(DEX_KEY);
  return Array.isArray(saved) ? saved.filter((v): v is string => typeof v === 'string') : [];
}

export function saveDex(names: string[]) {
  writeJson(DEX_KEY, names);
}

export function loadStreak(): Streak | null {
  const saved = readJson<Streak>(STREAK_KEY);
  return saved && typeof saved.last === 'string' && typeof saved.days === 'number' ? saved : null;
}

// 오늘 낚은 것을 기록한다. 어제도 낚았으면 하루 늘리고, 하루라도 건너뛰었으면 1일부터 다시 센다.
export function recordStreak(prev: Streak | null, now: Date): Streak {
  const today = dayKey(now);
  if (prev?.last === today) return prev;
  const next = { last: today, days: prev?.last === yesterdayKey(now) ? prev.days + 1 : 1 };
  writeJson(STREAK_KEY, next);
  return next;
}

// 지금 이어지고 있는 연속 일수. 어제나 오늘 낚지 않았으면 0이다.
export function currentStreak(streak: Streak | null, now: Date): number {
  if (!streak) return 0;
  return streak.last === dayKey(now) || streak.last === yesterdayKey(now) ? streak.days : 0;
}
