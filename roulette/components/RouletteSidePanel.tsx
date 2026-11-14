import type { RouletteItem } from '../types';
import { RouletteItemEditor } from './RouletteItemEditor';

interface RouletteSidePanelProps {
  items: RouletteItem[];
  onItemsChange: (items: RouletteItem[]) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

// 데스크톱 우측 아래 메뉴 목록 카드 (kihya 데스크톱의 장바구니 카드 구조).
// 최근 결과는 위쪽 RouletteResultPanel이 근처 가게와 함께 보여 준다.
export function RouletteSidePanel({ items, onItemsChange, inputRef }: RouletteSidePanelProps) {
  return (
    <aside
      aria-label="메뉴 목록"
      className="min-h-[180px] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(110,70,10,0.08)]"
    >
      <header className="flex items-baseline justify-between gap-3 px-5 pt-5 pb-4 shrink-0">
        <h2 className="text-[18px] leading-6 font-bold text-[#2a1f12]">
          메뉴 목록
          <span className="ml-1.5 text-[#b86500] tabular-nums">{items.length}</span>
        </h2>
        <p className="text-[13px] leading-5 text-[#7a6f60]">이름을 누르면 수정돼요</p>
      </header>

      <RouletteItemEditor variant="panel" items={items} onItemsChange={onItemsChange} inputRef={inputRef} />
    </aside>
  );
}
