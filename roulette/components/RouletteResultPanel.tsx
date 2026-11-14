import type { RouletteItem } from '../types';
import { BASE_LOCATION } from '../lib/location';
import type { NearbyStores } from '../lib/stores';
import { StoreList } from './StoreList';

interface RouletteResultPanelProps {
  winner: RouletteItem | null;
  isSpinning: boolean;
  nearby: NearbyStores | null;
  // 같은 메뉴가 다시 뽑혀도 등장 애니메이션을 다시 돌리기 위한 값
  resultKey: number;
}

export function nearbySummary(nearby: NearbyStores): string {
  const from = nearby.measuredFrom === 'device' ? '내 위치' : BASE_LOCATION.name;
  return nearby.stores.length > 0
    ? from + '에서 가까운 순 · ' + nearby.stores.length + '곳'
    : BASE_LOCATION.name + ' 근처';
}

// 데스크톱 우측 위 카드: 뽑힌 메뉴와 그 메뉴를 파는 근처 가게
export function RouletteResultPanel({ winner, isSpinning, nearby, resultKey }: RouletteResultPanelProps) {
  const ready = winner !== null && nearby !== null && !isSpinning;

  return (
    <section
      aria-label="뽑힌 메뉴와 근처 가게"
      className="flex max-h-[55vh] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(110,70,10,0.08)]"
    >
      <header className="shrink-0 px-5 pb-3 pt-5" aria-live="polite">
        {ready ? (
          <div key={resultKey} className="result-enter">
            <h2 className="flex min-w-0 items-center gap-2 text-[22px] font-bold leading-[30px] text-[#2a1f12]">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: winner.color }} aria-hidden="true" />
              <span className="truncate">{winner.text}</span>
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#7a6f60] tabular-nums">{nearbySummary(nearby)}</p>
          </div>
        ) : (
          <>
            <h2 className="text-[18px] font-bold leading-6 text-[#2a1f12]">근처 가게</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#7a6f60]">
              {isSpinning ? '돌리는 중…' : '돌리면 뽑힌 메뉴를 파는 가게를 보여 드려요'}
            </p>
          </>
        )}
      </header>

      {ready && (
        <div key={resultKey} className="result-enter panel-scroll min-h-0 overflow-y-auto px-5 pb-3">
          <StoreList menu={winner.text} stores={nearby.stores} />
        </div>
      )}
    </section>
  );
}
