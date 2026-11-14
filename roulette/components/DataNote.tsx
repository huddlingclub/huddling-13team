import { useState } from 'react';
import categories from '../data/categories.json';
import { SCREEN_LABEL, type FishingStatus, type Screen } from './MenuFishing';
import { STORE_TOTAL, measuredFromLabel } from '../lib/stores';
import { radiusLabel } from '../lib/fishing';

// 데스크톱에서 앱 왼쪽에 띄우는 메시지 박스. 화면마다 위에는 기기 시각으로 고른 식사 시간(TIME)과
// 주변 검색 결과(NEAR)를, 아래에는 그 화면이 쓰는 데이터(DB)와 API를 짧게 보여 준다.
type Source = { kind: 'DB' | 'API'; name: string; note: string };

const STORE_DB: Source = { kind: 'DB', name: '가게 DB', note: '카카오 로컬 API·네이버 지도로 모은 ' + STORE_TOTAL + '곳' };
const CATEGORY_DB: Source = { kind: 'DB', name: '메뉴 카테고리', note: '카카오 분류 기반 ' + categories.length + '종' };
const DEX_DB: Source = { kind: 'DB', name: '도감 기록', note: '브라우저 localStorage' };
const LOCATION_API: Source = { kind: 'API', name: '위치 API', note: '브라우저 Geolocation' };

const SOURCES: Record<Screen, Source[]> = {
  home: [STORE_DB, DEX_DB],
  collect: [LOCATION_API, STORE_DB],
  setup: [STORE_DB, CATEGORY_DB],
  cast: [STORE_DB],
  bite: [STORE_DB],
  result: [CATEGORY_DB],
  stores: [
    STORE_DB,
    { kind: 'API', name: '네이버 지도', note: '가게 링크·대표 사진' },
  ],
  dex: [DEX_DB, CATEGORY_DB],
  empty: [LOCATION_API, STORE_DB],
};

// 위쪽 두 줄. detail이 null이면 아직 검색 중이라 글 대신 스켈레톤을 보여 준다.
type Step = { tag: 'TIME' | 'NEAR'; title: string; detail: string | null };

function timeStep(s: FishingStatus): Step {
  return { tag: 'TIME', title: '지금은 ' + s.meal + ' 시간', detail: '기기 시간 ' + s.checkedAt + ' 기준' };
}

// 주변 검색 줄은 화면마다 그 화면에서 검색 결과를 어떻게 쓰는지 보여 준다. 낚기 전(캐스팅·입질)에는 뭐가 걸렸는지 숨긴다.
function nearStep(s: FishingStatus): Step {
  const area = measuredFromLabel(s.origin) + ' ' + radiusLabel(s.radius) + ' 안';
  const searched = area + '을 검색했어요';
  const step = (title: string, detail: string | null): Step => ({ tag: 'NEAR', title, detail });

  if (s.screen === 'home' && s.searching) return step('근처를 검색중…', null);
  switch (s.screen) {
    case 'collect':
      return step('근처를 다시 검색중…', null);
    case 'cast':
    case 'bite':
      return step('메뉴 ' + s.menus + '종 중에서 낚아요', area + '에 가게가 있는 메뉴');
    case 'result':
    case 'stores': {
      const p = s.picked;
      if (!p) break;
      if (!p.known) return step(p.menu + ' 가게는 DB에 없어요', '네이버 지도 검색으로 찾아요');
      return step(
        p.menu + ' 가게 ' + p.stores + '곳',
        s.screen === 'stores' ? measuredFromLabel(s.origin) + '에서 가까운 순이에요' : searched,
      );
    }
    case 'empty':
      return step('낚을 메뉴가 없어요', searched);
  }
  return step('가게 ' + s.stores + '곳 · 메뉴 ' + s.menus + '종', searched);
}

export function DataNote({ status, className = '' }: { status: FishingStatus; className?: string }) {
  const { screen } = status;
  return (
    <aside
      role="note"
      aria-label="이 화면에서 확인한 것과 쓴 데이터"
      className={'rounded-[36px] bg-fish-beige px-6 py-5 text-fish-ink [corner-shape:squircle] ' + className}
    >
      {/* 앱 쪽을 가리키는 말꼬리 */}
      <span aria-hidden="true" className="absolute -right-1.5 top-8 size-4 rotate-45 rounded-[3px] bg-fish-beige" />
      <div key={screen} className="result-enter relative">
        <h2 className="text-[16px] font-bold leading-6">{SCREEN_LABEL[screen]}</h2>
        <ul className="mt-3 space-y-2.5">
          {[timeStep(status), nearStep(status)].map((step) => (
            <StepRow key={step.tag} step={step} />
          ))}
        </ul>
        <h3 className="mt-4 text-[12px] font-semibold leading-[18px] text-fish-sub">쓴 데이터</h3>
        <ul className="mt-2 space-y-2.5">
          {SOURCES[screen].map((s) => (
            <li key={s.name} className="flex items-start gap-2.5">
              <Tag className={s.kind === 'API' ? 'bg-fish-navy text-white' : 'bg-white text-fish-navy'}>{s.kind}</Tag>
              <span className="min-w-0">
                <b className="block text-[14px] leading-5">{s.name}</b>
                <span className="block text-balance break-keep text-[12px] leading-[18px] text-fish-sub">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// 검색이 끝나는 순간에만 결과 글자를 띄워 올린다. 화면이 바뀔 때는 박스 전체가 한 번 떠오르므로 따로 움직이지 않는다.
function StepRow({ step }: { step: Step }) {
  const pending = step.detail === null;
  const [wasPending, setWasPending] = useState(pending);
  const [reveal, setReveal] = useState(false);
  if (wasPending !== pending) {
    setWasPending(pending);
    setReveal(wasPending && !pending);
  }
  return (
    <li className="flex items-start gap-2.5">
      <Tag className="bg-fish-orange text-fish-navy" decorative>
        {step.tag}
      </Tag>
      <span className={'min-w-0 ' + (reveal ? 'fish-fade' : '')}>
        <b className="block text-balance break-keep text-[14px] leading-5">{step.title}</b>
        {pending ? (
          <span aria-hidden="true" className="note-skeleton mt-1.5 block h-3 w-28 rounded-full" />
        ) : (
          <span className="block break-keep text-[12px] leading-[18px] text-fish-sub tabular-nums">
            {step.detail}
          </span>
        )}
      </span>
    </li>
  );
}

// 줄 앞의 픽셀 라벨. TIME·NEAR는 제목이 같은 뜻을 말하므로 스크린 리더에는 읽히지 않게 한다.
function Tag({ children, className, decorative = false }: { children: string; className: string; decorative?: boolean }) {
  return (
    <span
      aria-hidden={decorative || undefined}
      className={'mt-0.5 w-11 shrink-0 rounded-full py-[5px] text-center font-pixel text-[8px] leading-none ' + className}
    >
      {children}
    </span>
  );
}
