import storesData from '../data/stores.json';
import categories from '../data/categories.json';
import { SCREEN_LABEL, type Screen } from './MenuFishing';

// 데스크톱에서 앱 왼쪽에 띄우는 메시지 박스. 지금 화면이 어떤 데이터(DB)와 API를 쓰는지만 짧게 보여 준다.
type Source = { kind: 'DB' | 'API'; name: string; note: string };

const STORE_DB: Source = { kind: 'DB', name: '가게 DB', note: '카카오 로컬 API·네이버 지도로 모은 ' + storesData.length + '곳' };
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

export function DataNote({ screen, className = '' }: { screen: Screen; className?: string }) {
  return (
    <aside
      role="note"
      aria-label="이 화면에서 쓴 데이터"
      className={'rounded-[36px] bg-fish-beige px-6 py-5 text-fish-ink [corner-shape:squircle] ' + className}
    >
      {/* 앱 쪽을 가리키는 말꼬리 */}
      <span aria-hidden="true" className="absolute -right-1.5 top-8 size-4 rotate-45 rounded-[3px] bg-fish-beige" />
      <div key={screen} className="result-enter relative">
        <p className="text-[12px] font-semibold text-fish-sub">{SCREEN_LABEL[screen]}</p>
        <h2 className="mt-0.5 text-[16px] font-bold leading-6">이 화면의 데이터</h2>
        <ul className="mt-3 space-y-2.5">
          {SOURCES[screen].map((s) => (
            <li key={s.name} className="flex items-start gap-2.5">
              <span
                className={
                  'mt-0.5 w-11 shrink-0 rounded-full py-[5px] text-center font-pixel text-[8px] leading-none ' +
                  (s.kind === 'API' ? 'bg-fish-navy text-white' : 'bg-white text-fish-navy')
                }
              >
                {s.kind}
              </span>
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
