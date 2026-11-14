import type { RouletteItem } from '../types';
import { RouletteItemEditor } from './RouletteItemEditor';

interface RouletteSidePanelProps {
  items: RouletteItem[];
  onItemsChange: (items: RouletteItem[]) => void;
  winner: RouletteItem | null;
  isSpinning: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

// 데스크톱 우측 메뉴 목록 카드 (kihya 데스크톱의 장바구니 카드 구조)
export function RouletteSidePanel({ items, onItemsChange, winner, isSpinning, inputRef }: RouletteSidePanelProps) {
  return (
    <aside
      aria-label="메뉴 목록"
      className="w-[340px] shrink-0 self-start mt-3 max-h-[calc(100vh-24px)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(110,70,10,0.08)]"
    >
      <header className="flex items-baseline justify-between gap-3 px-5 pt-5 pb-4 shrink-0">
        <h2 className="text-[18px] leading-6 font-bold text-[#2a1f12]">
          메뉴 목록
          <span className="ml-1.5 text-[#b86500] tabular-nums">{items.length}</span>
        </h2>
        <p className="text-[13px] leading-5 text-[#7a6f60]">이름을 누르면 수정돼요</p>
      </header>

      <RouletteItemEditor variant="panel" items={items} onItemsChange={onItemsChange} inputRef={inputRef} />

      <footer className="shrink-0 mt-auto flex items-center justify-between gap-3 border-t border-[#f2ebe1] px-5 py-4">
        <span className="text-[14px] leading-5 text-[#7a6f60]">최근 결과</span>
        {isSpinning ? (
          <span className="text-[14px] leading-5 text-[#7a6f60]">돌리는 중…</span>
        ) : winner ? (
          <span className="flex min-w-0 items-center gap-2 text-[20px] leading-7 font-bold text-[#2a1f12]">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: winner.color }} />
            <span className="truncate">{winner.text}</span>
          </span>
        ) : (
          <span className="text-[14px] leading-5 text-[#7a6f60]">아직 돌리지 않았어요</span>
        )}
      </footer>
    </aside>
  );
}
