import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { RouletteItem } from '../types';
import type { UserLocation } from '../lib/location';
import {
  countStores,
  distanceLine,
  naverSearchUrl,
  searchOrigin,
  shortCategory,
  storeThumbUrl,
  type NearbyStore,
} from '../lib/stores';
import { foodStyle } from '../lib/foodStyles';
import {
  DEFAULT_RADIUS,
  RADIUS_OPTIONS,
  catchable,
  currentStreak,
  loadDex,
  loadStreak,
  menuArt,
  radiusLabel,
  recordStreak,
  saveDex,
  seaMenus,
  timeGreeting,
  type SeaMenu,
} from '../lib/fishing';
import { useOpenOrderQr } from './OrderQr';
import seaUrl from '../assets/fishing/sea.png';
import penguinUrl from '../assets/fishing/penguin.png';
import iceUrl from '../assets/fishing/ice.png';

// 가게 목록 FAB 왼쪽의 펭귄 얼굴. 탭 아이콘(public/favicon-48.png)과 같은 그림이다.
const faviconUrl = import.meta.env.BASE_URL + 'favicon-48.png';

// 좌측 앱: 점심메뉴 낚시. 펭귄 퍼디가 얼음 구멍에서 메뉴를 낚아 올린다.
// 화면 흐름과 값은 팀 프로토타입(menu-fishing.html)의 S1~S9, E1을 따른다.
export type Screen = 'home' | 'collect' | 'setup' | 'cast' | 'bite' | 'result' | 'stores' | 'dex' | 'empty';

export const SCREEN_LABEL: Record<Screen, string> = {
  home: '빙산 낚시터',
  collect: '주변 메뉴 모으는 중',
  setup: '낚시 준비',
  cast: '캐스팅',
  bite: '입질 대기',
  result: '낚아 올린 메뉴',
  stores: '주문할 수 있는 가게',
  dex: '메뉴 도감',
  empty: '빈 바다',
};

const COLLECT_MS = 1600;
const CAST_MS = 1600;
const BITE_AT_MS = 900;
const PULL_BAR_MS = 2200;
// "탭해서 당기기!"를 누른 뒤 결과까지: 펭귄이 젖히고, 물보라가 튀고, 메뉴가 솟아오른 뒤 반짝인다.
const PULL_MS = 1250;
// 처음 홈에 들어오면 "오늘 바다에 사는 메뉴" 자리에 스켈레톤과 "근처를 검색중…"을 이만큼 보여 준다.
const HOME_SEARCH_MS = 1400;

const BUDGETS = ['1만원 이하', '1~2만원', '상관없음'];
const SORTS = ['거리순', '배달팁', '평점', '최소주문'];

const PIXEL = '[image-rendering:pixelated]';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fish-orange focus-visible:ring-offset-2';
const BTN =
  'block h-14 w-full rounded-[14px] border-2 border-b-4 text-[17px] font-bold transition-[transform,filter,background-color] duration-100 active:translate-y-0.5 ' +
  FOCUS;
const BTN_PRIMARY = BTN + ' border-[#141A33] bg-fish-navy text-white hover:brightness-125';
const BTN_SECONDARY = BTN + ' border-fish-navy bg-white text-fish-navy hover:bg-[#F4F7FB]';
const CHIP = 'inline-block rounded-full border-[1.5px] px-3 py-[7px] text-[13px] font-semibold leading-4';
const CARD = 'rounded-3xl border-2 border-b-[6px] border-fish-ink bg-white p-6';
const PIXEL_CHIP = 'inline-block rounded-full border-[1.5px] px-3 py-[7px] font-pixel text-[9px] leading-4';

// 데스크톱 왼쪽 메시지 박스가 보여 줄 지금 상태. 화면이나 검색 결과가 바뀔 때마다 알린다.
export interface FishingStatus {
  screen: Screen;
  meal: string; // 기기 시각으로 고른 식사 시간. 예: "늦은 점심"
  checkedAt: string; // 그때 읽은 기기 시각. 예: "14:05"
  searching: boolean; // 홈에 처음 들어와 근처를 검색하는 동안 true
  origin: 'device' | 'base'; // 근처를 잰 기준: 기기 위치 또는 서울스퀘어
  radius: number; // 미터
  menus: number; // 낚을 수 있는 메뉴 수
  stores: number; // 그 메뉴를 파는 반경 안 가게 수
  picked: { menu: string; stores: number; known: boolean } | null; // 낚은 메뉴와 그 메뉴의 반경 안 가게 수
}

interface MenuFishingProps {
  items: RouletteItem[];
  location: UserLocation | null;
  // 기기 위치는 낚싯대를 잡을 때 한 번 묻는다.
  onRequestLocation: () => void;
  onEditMenus: () => void;
  onStatusChange?: (status: FishingStatus) => void;
}

export function MenuFishing({ items, location, onRequestLocation, onEditMenus, onStatusChange }: MenuFishingProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [greeting, setGreeting] = useState(() => timeGreeting(new Date()));
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [sort, setSort] = useState(SORTS[0]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [pick, setPick] = useState<RouletteItem | null>(null);
  const [bitten, setBitten] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [searching, setSearching] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setSearching(false), HOME_SEARCH_MS);
    return () => clearTimeout(t);
  }, []);
  const [dex, setDex] = useState(loadDex);
  const [streak, setStreak] = useState(loadStreak);
  const openQr = useOpenOrderQr();

  const sea = useMemo(() => seaMenus(items, location, radius), [items, location, radius]);
  const pool = useMemo(() => sea.filter((m) => !excluded.includes(m.item.id) && catchable(m)), [sea, excluded]);
  const poolRef = useRef(pool);
  poolRef.current = pool;
  const picked = pick ? sea.find((m) => m.item.id === pick.id) ?? null : null;

  // 메시지 박스에 알릴 상태. 값이 그대로면 같은 객체라 다시 알리지 않는다.
  const origin = searchOrigin(location);
  const pickedMenu = picked?.item.text ?? null;
  const pickedStores = picked?.stores.length ?? 0;
  const pickedKnown = picked?.known ?? false;
  const status = useMemo<FishingStatus>(
    () => ({
      screen,
      meal: greeting.meal,
      checkedAt: greeting.checkedAt,
      searching,
      origin,
      radius,
      menus: pool.length,
      stores: countStores(pool.flatMap((m) => m.stores)),
      picked: pickedMenu === null ? null : { menu: pickedMenu, stores: pickedStores, known: pickedKnown },
    }),
    [screen, greeting, searching, origin, radius, pool, pickedMenu, pickedStores, pickedKnown],
  );
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // 화면이 바뀌면 새 화면으로 초점을 옮겨 스크린 리더가 화면 이름을 읽게 한다.
  const screenRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    screenRef.current?.focus({ preventScroll: true });
  }, [screen]);

  const go = (next: Screen) => {
    if (next === 'home') setGreeting(timeGreeting(new Date()));
    setScreen(next);
  };

  // 화면마다 시간이 지나면 다음으로 넘어간다. 화면을 떠나면 타이머를 지운다.
  useEffect(() => {
    if (screen === 'collect') {
      const t = setTimeout(() => setScreen(poolRef.current.length > 0 ? 'setup' : 'empty'), COLLECT_MS);
      return () => clearTimeout(t);
    }
    if (screen === 'cast') {
      const t = setTimeout(() => setScreen('bite'), CAST_MS);
      return () => clearTimeout(t);
    }
    if (screen === 'bite') {
      setBitten(false);
      setPulling(false);
      const t = setTimeout(() => setBitten(true), BITE_AT_MS);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // 끌어올리는 장면이 끝나면 결과로 넘어간다. 움직임 줄이기를 켠 사용자는 기다리지 않는다.
  useEffect(() => {
    if (!pulling) return;
    const t = setTimeout(() => setScreen('result'), PULL_MS);
    return () => clearTimeout(t);
  }, [pulling]);

  const pull = () => {
    if (pulling) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return go('result');
    setPulling(true);
  };

  const startFishing = () => {
    onRequestLocation();
    go('collect');
  };

  // 다시 던질 때는 방금 낚은 메뉴를 빼고 고른다(남은 메뉴가 하나뿐이면 그대로).
  const cast = () => {
    if (pool.length === 0) return go('empty');
    const choices = pick && pool.length > 1 ? pool.filter((m) => m.item.id !== pick.id) : pool;
    setPick(choices[Math.floor(Math.random() * choices.length)].item);
    go('cast');
  };

  // "주문하기"는 QR 창만 띄우고 가게 목록에 머문다. 낚은 메뉴는 도감과 연속 기록에 쌓인다.
  const order = () => {
    openQr();
    if (pick && !dex.includes(pick.text)) {
      const next = [...dex, pick.text];
      setDex(next);
      saveDex(next);
    }
    setStreak((prev) => recordStreak(prev, new Date()));
  };

  const toggleExcluded = (id: string) =>
    setExcluded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const nextRadius = RADIUS_OPTIONS.find((r) => r > radius);

  return (
    <div
      key={screen}
      ref={screenRef}
      tabIndex={-1}
      role="region"
      aria-label={'점심메뉴 낚시: ' + SCREEN_LABEL[screen]}
      className="relative h-full w-full overflow-hidden text-fish-ink outline-none"
    >
      {/* 픽셀 글꼴은 처음 쓰일 때 내려받는다. 캐스팅 화면의 CAST!가 늦게 바뀌지 않게 홈에서부터 미리 받아 둔다. */}
      <span aria-hidden="true" className="pointer-events-none invisible absolute font-pixel">
        CAST!
      </span>

      {screen === 'home' && (
        <HomeScreen
          greeting={greeting}
          sea={sea}
          excluded={excluded}
          poolSize={pool.length}
          searching={searching}
          onStart={startFishing}
          onDex={() => go('dex')}
          onEditMenus={onEditMenus}
        />
      )}

      {screen === 'collect' && (
        <section className="relative flex h-full flex-col">
          <SeaBackdrop />
          <div className="relative mx-8 my-auto text-center text-white">
            <MenuIcon menu="해산물" className="fish-shake mx-auto mb-4 size-24" />
            <h2 className="text-[22px] font-bold leading-[1.3]">바다를 살펴보는 중…</h2>
            <p className="mb-[18px] mt-2 text-[13px] opacity-90">내 위치 근처에 가게가 있는 메뉴만 모으고 있어요</p>
            <TimedBar ms={COLLECT_MS} />
          </div>
        </section>
      )}

      {screen === 'setup' && (
        <section className="relative flex h-full flex-col">
          <SeaBackdrop />
          <div className="relative px-5 pt-6">
            <BackButton label="낚시 준비" onClick={() => go('home')} />
          </div>
          <div className="panel-scroll relative min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
            <div className={CARD + ' fish-fade'}>
              <FieldLabel first>낚시터 반경</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map((r) => (
                  <Chip key={r} on={r === radius} onClick={() => setRadius(r)}>
                    {radiusLabel(r)}
                  </Chip>
                ))}
              </div>
              <FieldLabel>예산</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b} on={b === budget} onClick={() => setBudget(b)}>
                    {b}
                  </Chip>
                ))}
              </div>
              <FieldLabel>못 먹는 메뉴 제외</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Chip key={item.id} on={excluded.includes(item.id)} onClick={() => toggleExcluded(item.id)}>
                    {item.text}
                  </Chip>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-[12px] text-white" aria-live="polite">
              반경 {radiusLabel(radius)} · 낚을 수 있는 메뉴 {pool.length}종
            </p>
          </div>
          <div className="relative px-5 pb-7">
            <button type="button" onClick={cast} className={BTN_PRIMARY}>
              낚싯대 던지기
            </button>
          </div>
        </section>
      )}

      {screen === 'cast' && (
        <section className="relative h-full [container-type:inline-size]">
          <SeaBackdrop />
          <div className={CARD + ' relative mx-5 mt-6 !p-5'}>
            <span className={PIXEL_CHIP + ' border-fish-orange bg-fish-orange text-white'}>CAST!</span>
            <h2 className="mt-2.5 text-[24px] font-bold leading-[1.3]">
              펭귄이
              <br />
              낚싯대를 던져요!
            </h2>
            <p className="mt-1.5 text-[13px] text-fish-sub">화면을 탭하면 건너뛸 수 있어요</p>
          </div>
          <IceFloor />
          <img src={penguinUrl} alt="" draggable={false} className={PIXEL + ' fish-bob absolute'} style={PENGUIN_ON_ICE} />
          <p className="absolute inset-x-0 bottom-5 text-center font-pixel text-[9px] text-fish-navy">TAP TO SKIP</p>
          <button type="button" onClick={() => go('bite')} aria-label="건너뛰기" className={'absolute inset-0 ' + FOCUS} />
        </section>
      )}

      {screen === 'bite' && (
        <section className="relative flex h-full flex-col overflow-hidden [container-type:inline-size]">
          <SeaBackdrop />
          <div className="relative mt-6 text-center text-white" aria-live="polite">
            <h2 className="text-[28px] font-bold leading-[1.3] text-[#FFD34D]">
              {pulling ? '영차, 끌어올려요!' : bitten ? '입질이 왔어요!' : '찌가 흔들려요…'}
            </h2>
            <p className="mt-1.5 text-[13px]">
              {pulling ? '무엇이 걸렸을까요?' : bitten ? '찌가 흔들릴 때 탭해서 당겨요' : '조금만 기다려 주세요'}
            </p>
          </div>
          <IceFloor />
          {bitten && !pulling && (
            // 입질 순간 펭귄 머리 위에 뜨는 느낌표
            <span aria-hidden="true" className="absolute -translate-x-1/2" style={ALERT_SPOT}>
              <span className="fish-alert block rounded-md border-2 border-b-4 border-fish-navy bg-[#FFD34D] px-2.5 py-1.5 font-pixel text-[14px] leading-none text-fish-navy">
                !
              </span>
            </span>
          )}
          <img
            src={penguinUrl}
            alt=""
            draggable={false}
            className={PIXEL + ' absolute ' + (pulling ? 'fish-heave' : bitten ? 'fish-shake' : 'fish-bob')}
            style={PENGUIN_ON_ICE}
          />
          {pulling && picked && (
            <>
              <PullSplash />
              {/* 낚은 메뉴가 얼음 구멍(줄 끝)에서 튀어나와 한 바퀴 돌며 펭귄 위로 솟는다 */}
              <span
                aria-hidden="true"
                className="fish-catch absolute grid size-20 place-items-center"
                style={{ left: 'calc(' + HOLE_X + ' - 40px)', bottom: 'calc(' + HOLE_Y + ' - 40px)' }}
              >
                <MenuIcon menu={picked.item.text} className="size-20" fallbackClassName="size-12 text-white" />
              </span>
              <span aria-hidden="true" className="fish-flash pointer-events-none absolute inset-0 bg-white" />
            </>
          )}
          <div className="absolute inset-x-5 bottom-7">
            <div className={pulling ? 'invisible' : ''}>
              <p className="mb-2 font-pixel text-[9px] text-fish-navy">PULL!</p>
              <div className="mb-4">
                <TimedBar ms={PULL_BAR_MS} track="bg-fish-line" />
              </div>
            </div>
            <button
              type="button"
              onClick={pull}
              disabled={pulling}
              className={BTN + ' border-[#7A1E17] bg-[#E5483B] text-white hover:brightness-110 disabled:translate-y-0.5'}
            >
              {pulling ? '영차!' : '탭해서 당기기!'}
            </button>
          </div>
        </section>
      )}

      {screen === 'result' && picked && (
        <ResultScreen menu={picked} onEat={() => go('stores')} onRecast={cast} />
      )}

      {screen === 'stores' && picked && (
        <StoresScreen
          menu={picked}
          sort={sort}
          onSort={setSort}
          onBack={() => go('result')}
          onOrder={order}
          onRecast={cast}
        />
      )}

      {screen === 'dex' && (
        <DexScreen items={items} dex={dex} streakDays={currentStreak(streak, new Date())} onHome={() => go('home')} />
      )}

      {screen === 'empty' && (
        <section className="relative flex h-full flex-col">
          <SeaBackdrop />
          <div className={CARD + ' fish-fade relative mx-5 mt-6'}>
            <span className={PIXEL_CHIP + ' border-[#E5483B] bg-[#E5483B] text-white'}>EMPTY SEA</span>
            <h2 className="mt-2.5 text-[24px] font-bold leading-[1.3]">
              지금 이 바다엔
              <br />
              낚을 게 없어요
            </h2>
            <p className="mt-1.5 text-[13px] text-fish-sub">대신 이런 건 어때요?</p>
          </div>
          <img src={penguinUrl} alt="" draggable={false} className={PIXEL + ' relative mx-auto my-5 w-[130px]'} />
          <div className="relative mt-auto space-y-2.5 px-5 pb-7">
            {nextRadius && (
              <OptionButton
                title="반경 넓히기"
                sub={radiusLabel(radius) + ' → ' + radiusLabel(nextRadius) + '로 바다를 넓혀요'}
                onClick={() => {
                  setRadius(nextRadius);
                  go('setup');
                }}
              />
            )}
            <OptionButton
              title="제외 조건 풀기"
              sub="못 먹는 메뉴 설정을 초기화해요"
              onClick={() => {
                setExcluded([]);
                go('setup');
              }}
            />
            <OptionButton title="지난번에 먹은 메뉴" sub="도감에서 다시 골라요" onClick={() => go('dex')} />
          </div>
        </section>
      )}
    </div>
  );
}

// S1 홈: 시간대 문구, 빙산 위 펭귄, 오늘 바다에 사는 메뉴.
function HomeScreen({
  greeting,
  sea,
  excluded,
  poolSize,
  searching,
  onStart,
  onDex,
  onEditMenus,
}: {
  greeting: ReturnType<typeof timeGreeting>;
  sea: SeaMenu[];
  excluded: string[];
  poolSize: number;
  searching: boolean;
  onStart: () => void;
  onDex: () => void;
  onEditMenus: () => void;
}) {
  return (
    <section className="flex h-full flex-col bg-[#DCEBFA]">
      <div className="px-5 pt-6">
        <span className={CHIP + ' border-fish-line bg-white text-fish-navy'}>{greeting.meal + ' · ' + greeting.range}</span>
        <h1 className="mt-3 whitespace-pre-line break-keep text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">{greeting.title}</h1>
        <p className="mt-1.5 break-keep text-[14px] leading-5 text-fish-sub">{greeting.sub}</p>
      </div>

      {/* 빙판 위 펭귄. 화면이 낮으면 펭귄만 줄어들고 빙판은 폭을 그대로 채운다. */}
      <div className="relative mt-1.5 min-h-[160px] flex-1 overflow-hidden [container-type:size]" aria-hidden="true">
        <div className={'absolute inset-0 bg-cover ' + PIXEL} style={{ backgroundImage: 'url(' + seaUrl + ')', backgroundPosition: 'center 30%' }} />
        <img src={iceUrl} alt="" draggable={false} className={PIXEL + ' absolute left-0 w-full max-w-none'} style={{ bottom: '-7.7cqw' }} />
        <img
          src={penguinUrl}
          alt=""
          draggable={false}
          className={PIXEL + ' fish-bob absolute'}
          style={{ left: '15.4cqw', bottom: '24.7cqw', width: 'min(43.6cqw, calc((100cqh - 24.7cqw - 8px) * 1.1))' }}
        />
      </div>

      <div className="relative -mt-5 rounded-t-[28px] bg-white px-5 pb-6 pt-3.5">
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-sm bg-fish-line" />
        <div className="flex items-baseline justify-between">
          <h2 className="text-[14px] font-bold">오늘 바다에 사는 메뉴</h2>
          <span className="text-[12px] text-fish-sub tabular-nums" aria-live="polite">
            {searching ? (
              '근처를 검색중…'
            ) : (
              <>
                {poolSize}종 ·{' '}
                <button
                  type="button"
                  onClick={onEditMenus}
                  className={'rounded font-semibold text-fish-navy underline underline-offset-2 hover:text-fish-ink ' + FOCUS}
                >
                  편집
                </button>
              </>
            )}
          </span>
        </div>
        {searching ? (
          // 메뉴 칸과 같은 수·크기의 빈 칸이 반짝이며, 다 찾으면 같은 자리에 메뉴가 나온다.
          <ul aria-hidden="true" className="mb-4 mt-2.5 grid grid-cols-5 gap-2.5">
            {sea.map((m) => (
              <li key={m.item.id} className="fish-skeleton h-[58px] rounded-xl" />
            ))}
          </ul>
        ) : (
          <ul className="fish-fade mb-4 mt-2.5 grid grid-cols-5 gap-2.5">
            {sea.map((m) => {
              const out = excluded.includes(m.item.id) || !catchable(m);
              return (
                <li
                  key={m.item.id}
                  title={m.item.text}
                  className={'grid h-[58px] place-items-center rounded-xl bg-fish-beige ' + (out ? 'opacity-30' : '')}
                >
                  <MenuIcon menu={m.item.text} className="size-12" label={m.item.text + (out ? ' (오늘은 없음)' : '')} />
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-1.5 flex gap-2.5">
          <button type="button" onClick={onStart} className={BTN_PRIMARY + ' flex-1'}>
            낚싯대 잡기
          </button>
          <button type="button" onClick={onDex} className={BTN_SECONDARY + ' !w-[110px] shrink-0'}>
            메뉴 도감
          </button>
        </div>
      </div>
    </section>
  );
}

// S6 낚아 올린 결과
function ResultScreen({ menu, onEat, onRecast }: { menu: SeaMenu; onEat: () => void; onRecast: () => void }) {
  const { dish } = menuArt(menu.item.text);
  return (
    <section className="relative flex h-full flex-col">
      <SeaBackdrop shade={false} />
      <div className="absolute inset-0 bg-[rgba(14,26,51,0.55)]" />
      <div className="panel-scroll relative min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-6">
        <div className={CARD + ' fish-pop text-center'}>
          <p className="text-[14px] font-bold text-fish-orange">오늘의 점심이 걸렸어요!</p>
          <div className="fish-wiggle mx-auto my-4 grid size-[200px] place-items-center rounded-3xl bg-fish-beige">
            <MenuIcon menu={menu.item.text} className="size-44" fallbackClassName="size-20 text-fish-ink" />
          </div>
          <h2 className="text-[30px] font-bold leading-[1.3]">{dish}</h2>
          {dish !== menu.item.text && (
            <span className={CHIP + ' mt-2 border-fish-line bg-white text-fish-navy'}>{menu.item.text}</span>
          )}
          <p className="mb-[18px] mt-3.5 leading-normal text-fish-sub">
            퍼디가 골랐어요.
            <br />
            맛없으면 퍼디 탓!
          </p>
          <button type="button" onClick={onEat} className={BTN_PRIMARY}>
            이거 먹을래
          </button>
        </div>
      </div>
      <div className="relative px-5 pb-7">
        <button type="button" onClick={onRecast} className={BTN_SECONDARY}>
          다시 던지기
        </button>
      </div>
    </section>
  );
}

// S7 그 메뉴를 파는 근처 가게. 가게를 누르면 지도, "주문하기"는 배민 주문 QR 창을 연다.
function StoresScreen({
  menu,
  sort,
  onSort,
  onBack,
  onOrder,
  onRecast,
}: {
  menu: SeaMenu;
  sort: string;
  onSort: (sort: string) => void;
  onBack: () => void;
  onOrder: () => void;
  onRecast: () => void;
}) {
  const name = menu.item.text;
  const { dish } = menuArt(name);
  const count = menu.stores.length;
  return (
    <section className="relative flex h-full flex-col bg-[#F6F8FB]">
      <div className="px-3 pt-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="결과로 돌아가기"
          className={'grid size-10 place-items-center rounded-full hover:bg-black/5 ' + FOCUS}
        >
          <ChevronLeft className="size-6" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-3 px-5 py-2">
        <span className="grid size-14 shrink-0 place-items-center rounded-[14px] bg-fish-beige">
          <MenuIcon menu={name} className="size-12" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-fish-sub">{dish === name ? name : dish + ' · ' + name}</p>
          <h2 className="text-[22px] font-bold leading-[1.3]">
            {count > 0 ? '근처에 ' + count + '곳 있어요' : '확인한 가게가 아직 없어요'}
          </h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pb-3.5 pt-2">
        {SORTS.map((s) => (
          <Chip key={s} on={s === sort} onClick={() => onSort(s)}>
            {s}
          </Chip>
        ))}
      </div>

      {count > 0 ? (
        // 아래 여백은 떠 있는 "다시 낚시할래요" 버튼에 마지막 가게가 가리지 않게 한다.
        <ul className="panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-28">
          {menu.stores.map((store) => (
            <StoreCard key={store.id} store={store} menu={name} onOrder={onOrder} />
          ))}
        </ul>
      ) : (
        <div className="flex-1 px-5 pt-6 text-center">
          <p className="text-[14px] text-fish-sub">{name} 가게는 네이버 지도에서 찾아볼 수 있어요.</p>
          <a
            href={naverSearchUrl(name)}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'mt-3 inline-flex h-10 items-center gap-1.5 rounded-[10px] border-2 border-fish-navy bg-white px-4 text-[14px] font-bold text-fish-navy hover:bg-[#F4F7FB] ' +
              FOCUS
            }
          >
            네이버 지도에서 찾기
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={onRecast}
        className={
          'absolute bottom-6 left-1/2 z-10 flex h-14 -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border-2 border-b-4 border-[#141A33] bg-fish-navy pl-2 pr-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(20,26,51,0.3)] transition-[transform,filter] duration-100 hover:brightness-125 active:translate-y-0.5 ' +
          FOCUS
        }
      >
        <span className="grid size-10 place-items-center rounded-full bg-white">
          <img src={faviconUrl} alt="" width={30} height={30} draggable={false} className={PIXEL + ' size-[30px]'} />
        </span>
        다시 낚시할래요
      </button>
    </section>
  );
}

function StoreCard({ store, menu, onOrder }: { store: NearbyStore; menu: string; onOrder: () => void }) {
  const placeUrl = store.naverUrl ?? store.kakaoUrl ?? naverSearchUrl(store.name);
  const sub = shortCategory(store.category);
  return (
    <li className="fish-fade flex items-center gap-3 rounded-2xl border border-fish-line bg-white p-3.5">
      <a
        href={placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={'-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 ' + FOCUS}
      >
        <StorePhoto store={store} menu={menu} />
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[16px] leading-[22px]">{store.name}</b>
          {sub && <span className="mt-1 block truncate text-[12px] text-fish-sub">{sub}</span>}
          {store.distance !== null && (
            <span className="mt-1 block text-[12px] text-fish-sub tabular-nums">{distanceLine(store.distance)}</span>
          )}
        </span>
      </a>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={onOrder}
        className={'shrink-0 rounded-[10px] bg-fish-navy px-2.5 py-2 text-[12px] font-bold text-white hover:brightness-125 ' + FOCUS}
      >
        주문하기
      </button>
    </li>
  );
}

// 가게 카드 썸네일: 그 가게의 네이버 대표 사진(사장님 사진 우선)을 160px로 받아 채운다.
// 사진이 없거나 불러오지 못하면 카테고리 픽셀 아이콘을 보여 준다.
function StorePhoto({ store, menu }: { store: NearbyStore; menu: string }) {
  const [failed, setFailed] = useState(false);
  const photo = store.imageUrl && !failed ? storeThumbUrl(store.imageUrl) : null;
  return (
    <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-fish-beige">
      {photo ? (
        <img
          src={photo}
          alt=""
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <MenuIcon menu={menu} className="size-12" />
      )}
    </span>
  );
}

// S9 메뉴 도감과 연속 기록
function DexScreen({
  items,
  dex,
  streakDays,
  onHome,
}: {
  items: RouletteItem[];
  dex: string[];
  streakDays: number;
  onHome: () => void;
}) {
  const caught = items.filter((item) => dex.includes(item.text)).length;
  return (
    <section className="relative flex h-full flex-col">
      <SeaBackdrop />
      <div className="relative flex items-center justify-between px-5 pt-6 text-white">
        <BackButton label="메뉴 도감" onClick={onHome} />
        <span className={PIXEL_CHIP + ' border-[#FFD34D] bg-[#FFD34D] text-fish-navy tabular-nums'}>
          {caught} / {items.length}
        </span>
      </div>
      <p className="relative px-5 pb-3.5 pt-1.5 text-[12px] text-white">지금까지 낚은 메뉴</p>
      <ul className="panel-scroll relative grid min-h-0 flex-1 grid-cols-3 content-start gap-3 overflow-y-auto px-5 pb-4">
        {items.map((item) =>
          dex.includes(item.text) ? (
            <li
              key={item.id}
              className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-fish-ink bg-white px-1 text-center text-[12px] font-semibold"
            >
              <MenuIcon menu={item.text} className="size-14" />
              <span className="break-keep">{menuArt(item.text).dish}</span>
            </li>
          ) : (
            <li
              key={item.id}
              aria-label="아직 낚지 않은 메뉴"
              className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-fish-line bg-[#E8EEF6] text-[12px] font-semibold text-fish-sub"
            >
              <span className="text-[28px] font-extrabold leading-none" aria-hidden="true">
                ?
              </span>
              <span aria-hidden="true">???</span>
            </li>
          ),
        )}
      </ul>
      <div className="relative px-5 pb-7">
        <div className={CARD + ' mb-3 !px-4 !py-3.5'}>
          <b>{streakDays > 0 ? '연속 낚시 ' + streakDays + '일째' : '오늘 첫 낚시를 해 보세요'}</b>
          <p className="mt-1 text-[12px] text-fish-sub">
            {streakDays > 0 ? '내일도 낚으면 연속 기록이 이어져요' : '낚은 메뉴를 주문하면 도감에 쌓여요'}
          </p>
        </div>
        <button type="button" onClick={onHome} className={BTN_PRIMARY}>
          내일 또 낚으러 오기
        </button>
      </div>
    </section>
  );
}

// 바다 배경. 위쪽은 글자가 잘 보이도록 남색으로 어둡게 덮는다.
// 캐스팅·입질 화면의 빙판 낚시터. 얼음 구멍이 아래 버튼 영역(약 140px) 위에 오도록 빙판을 올리고,
// 그 아래는 빙판과 같은 눈 색으로 채운다. 펭귄은 구멍 왼쪽에 서고 낚싯줄 끝이 구멍 한가운데로 들어간다.
// 값은 ice.png(220×227, 어두운 물 x 96~190·y 172~194)와 penguin.png(220×199, 줄 끝 x 178·y 180)에서 계산했다.
// 부모 section은 [container-type:inline-size]여야 한다(cqw = 화면 폭의 1%).
const ICE_BOTTOM = 'calc(140px - 15cqw)'; // 구멍 아래 끝이 140px 위에 오게
const HOLE_X = '52cqw'; // 줄 끝 = 구멍 안
const HOLE_Y = 'calc(140px + 5cqw)'; // 구멍 세로 가운데(아래에서)
const PENGUIN_ON_ICE: React.CSSProperties = { left: '16.7cqw', bottom: 'calc(140px + 1.3cqw)', width: '43.6cqw' };
const ALERT_SPOT: React.CSSProperties = { left: '36.3cqw', bottom: 'calc(140px + 42.7cqw)' }; // 펭귄 머리 위

function IceFloor() {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-[#F3F7FB]" style={{ height: 'calc(' + ICE_BOTTOM + ' + 4px)' }} />
      <img src={iceUrl} alt="" draggable={false} className={PIXEL + ' absolute left-0 w-full max-w-none'} style={{ bottom: ICE_BOTTOM }} />
    </>
  );
}

// 끌어올릴 때 얼음 구멍(줄 끝)에서 퍼지는 파문과 위로 튀는 물방울
const SPLASH_DROPS: [string, string, string][] = [
  ['-28px', '-30px', '90ms'],
  ['-14px', '-52px', '130ms'],
  ['2px', '-62px', '110ms'],
  ['16px', '-48px', '150ms'],
  ['30px', '-26px', '120ms'],
];

function PullSplash() {
  return (
    <span aria-hidden="true" className="absolute size-0" style={{ left: HOLE_X, bottom: HOLE_Y }}>
      <span className="fish-ripple absolute -left-9 -top-3 h-6 w-[72px] rounded-[50%] border-[3px] border-white/85" />
      {SPLASH_DROPS.map(([dx, dy, delay]) => (
        <span
          key={dx}
          className="fish-drop absolute -left-1 -top-1 size-2 bg-white"
          style={{ '--dx': dx, '--dy': dy, animationDelay: delay } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

function SeaBackdrop({ shade = true }: { shade?: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className={'absolute inset-0 bg-cover bg-center ' + PIXEL}
        style={{ backgroundImage: 'url(' + seaUrl + ')' }}
      />
      {shade && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[rgba(15,31,77,0.85)] to-[rgba(15,31,77,0)]"
        />
      )}
    </>
  );
}

// 카테고리 픽셀 아이콘. 직접 넣은 메뉴처럼 아이콘이 없으면 선 아이콘으로 대신한다.
function MenuIcon({
  menu,
  className,
  fallbackClassName = 'size-7 text-fish-ink',
  label,
}: {
  menu: string;
  className: string;
  fallbackClassName?: string;
  label?: string;
}) {
  const { icon } = menuArt(menu);
  if (icon) {
    return <img src={icon} alt={label ?? ''} draggable={false} className={PIXEL + ' ' + className} />;
  }
  const { Icon } = foodStyle(menu);
  return (
    <Icon
      className={fallbackClassName}
      strokeWidth={1.75}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

// 정해진 시간 동안 왼쪽에서 오른쪽으로 차는 막대
function TimedBar({ ms, track = 'bg-white/85' }: { ms: number; track?: string }) {
  return (
    <div className={'h-2.5 overflow-hidden rounded-[5px] ' + track} aria-hidden="true">
      <i className="fish-fill block h-full bg-fish-orange" style={{ animationDuration: ms + 'ms' }} />
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={
        CHIP +
        ' transition-colors duration-100 ' +
        FOCUS +
        (on ? ' border-fish-navy bg-fish-navy text-white' : ' border-fish-line bg-white text-fish-navy hover:border-fish-navy')
      }
    >
      {children}
    </button>
  );
}

function FieldLabel({ first, children }: { first?: boolean; children: React.ReactNode }) {
  return <h3 className={'mb-2 text-[14px] font-bold ' + (first ? '' : 'mt-3.5')}>{children}</h3>;
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={'-ml-1.5 flex items-center gap-0.5 rounded-lg pr-1 text-[18px] font-bold text-white ' + FOCUS}
    >
      <ChevronLeft className="size-6" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </button>
  );
}

function OptionButton({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex w-full items-center justify-between rounded-[14px] border-2 border-fish-ink bg-white px-4 py-3.5 text-left font-bold transition-colors duration-100 hover:bg-[#F4F7FB] ' +
        FOCUS
      }
    >
      <span>
        {title}
        <small className="mt-[3px] block text-[12px] font-normal text-fish-sub">{sub}</small>
      </span>
      <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
    </button>
  );
}
