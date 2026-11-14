import type { RouletteItem } from '../types';
import { BottomSheet } from './BottomSheet';
import { RouletteItemEditor } from './RouletteItemEditor';

interface RouletteManagerProps {
  items: RouletteItem[];
  onItemsChange: (items: RouletteItem[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 메뉴 편집 바텀시트. 앱 폭(데스크톱 430px, 그보다 좁으면 최대 768px)에 맞춰 연다.
export function RouletteManager({ items, onItemsChange, isOpen, onOpenChange }: RouletteManagerProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      className="h-[80vh] max-h-[600px] min-h-[400px] !max-w-[768px] lg:!max-w-[430px]"
    >
      {/* Drag Handle */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
      </div>

      <div className="flex flex-col h-full px-4 sm:px-6 pb-4 pt-9">
        <RouletteItemEditor variant="sheet" items={items} onItemsChange={onItemsChange} />
      </div>
    </BottomSheet>
  );
}
