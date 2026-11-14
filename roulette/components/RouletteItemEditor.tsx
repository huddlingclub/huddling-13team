import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { RouletteItem } from '../types';
import { Input } from './ui/input';

export const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
];

interface RouletteItemEditorProps {
  items: RouletteItem[];
  onItemsChange: (items: RouletteItem[]) => void;
  // sheet: 모바일 바텀시트, panel: 데스크톱 우측 목록 패널
  variant: 'sheet' | 'panel';
  inputRef?: React.Ref<HTMLInputElement>;
}

const EDIT_INPUT_CLASS =
  'w-full h-10 text-[16px] !bg-transparent !border-0 !border-none !outline-none !ring-0 !ring-transparent !ring-offset-0 focus:!border-0 focus:!border-none focus:!outline-none focus:!ring-0 focus:!ring-transparent focus:!shadow-none focus-visible:!border-0 focus-visible:!border-none focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!ring-offset-0 focus-visible:!shadow-none';

const EDIT_INPUT_STYLE = {
  border: '0 !important',
  borderWidth: '0 !important',
  borderColor: 'transparent !important',
  outline: 'none !important',
  boxShadow: 'none !important',
  backgroundColor: 'transparent !important',
  '--tw-ring-width': '0px !important',
  '--tw-ring-color': 'transparent !important',
  '--tw-ring-offset-width': '0px !important'
} as React.CSSProperties;

// 항목 추가·수정·삭제. 바텀시트와 데스크톱 패널이 같은 로직을 쓴다.
export function RouletteItemEditor({ items, onItemsChange, variant, inputRef }: RouletteItemEditorProps) {
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const isPanel = variant === 'panel';

  // 기본 항목인지 확인하는 함수 (수정되지 않은 기본 항목)
  const isDefaultItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return false;

    // ID가 기본 항목이고 색상이 기본 회색 계열인 경우에만 true
    const isOriginalId = ['1', '2', '3', '4', '5'].includes(id);
    const isDefaultColor = ['#D1D5DB', '#E5E7EB', '#F3F4F6'].includes(item.color);

    return isOriginalId && isDefaultColor;
  };

  const addItem = () => {
    if (!newItemText.trim()) return;

    const newItem: RouletteItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      color: COLORS[items.length % COLORS.length]
    };

    onItemsChange([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const startEditing = (item: RouletteItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id: string) => {
    const trimmedText = editingText.trim();

    // 빈 텍스트가 아닌 경우에만 저장
    if (trimmedText) {
      onItemsChange(items.map(item => {
        if (item.id === id) {
          // 텍스트가 실제로 변경되었는지 확인
          const hasTextChanged = item.text !== trimmedText;

          // 기본 항목이고 텍스트가 실제로 변경된 경우에만 랜덤 색상 할당
          if (isDefaultItem(id) && hasTextChanged) {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            return { ...item, text: trimmedText, color: randomColor };
          }

          // 텍스트만 업데이트 (색상은 기존 유지)
          return { ...item, text: trimmedText };
        }
        return item;
      }));
    }

    setEditingId(null);
    setEditingText('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const addRow = (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        placeholder="새 항목 입력"
        aria-label="새 메뉴 이름"
        value={newItemText}
        onChange={(e) => setNewItemText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addItem()}
        className={
          isPanel
            ? 'flex-1 h-11 rounded-full border-transparent bg-[#F6F6F6] px-4 text-[15px] text-black placeholder:text-[#737373] focus-visible:border-black/20 focus-visible:ring-[3px] focus-visible:ring-black/10'
            : 'flex-1 h-12 text-[16px] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-input focus:shadow-none'
        }
      />
      <button
        onClick={addItem}
        disabled={!newItemText.trim()}
        aria-label="항목 추가"
        className={
          isPanel
            ? 'h-11 w-11 bg-black rounded-full shrink-0 flex items-center justify-center text-white transition-colors duration-150 hover:bg-[#3A3A3C] disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-black/30'
            : 'h-12 px-4 bg-[#fe9800] rounded-md font-semibold shrink-0 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-none'
        }
      >
        <Plus className={isPanel ? 'size-5' : 'size-4'} />
      </button>
    </div>
  );

  const rows = items.map((item) => (
    <li
      key={item.id}
      className={
        isPanel
          ? 'group flex items-center gap-3 -mx-2 px-2 min-h-[48px] rounded-xl transition-colors duration-150 hover:bg-black/[0.035]'
          : 'flex items-center gap-3 p-3 sm:p-4 border rounded-xl bg-white shadow-sm min-h-[68px]'
      }
    >
      <div
        className={isPanel ? 'w-3 h-3 rounded-full shrink-0' : 'w-5 h-5 rounded-full shrink-0'}
        style={{ backgroundColor: item.color }}
      />

      {editingId === item.id ? (
        <div className="flex-1 h-10 flex items-center">
          <Input
            value={editingText}
            aria-label={`${item.text} 이름 수정`}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={() => saveEdit(item.id)}
            onKeyDown={(e) => handleInputKeyDown(e, item.id)}
            className={EDIT_INPUT_CLASS}
            style={EDIT_INPUT_STYLE}
            autoFocus
          />
        </div>
      ) : (
        <button
          type="button"
          className="flex-1 min-w-0 h-10 flex items-center text-left cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe9800]/40"
          onClick={() => startEditing(item)}
        >
          <span
            className={`block font-medium break-words leading-[22px] ${isPanel ? 'text-[15px] truncate' : 'text-[16px] rounded px-2 -mx-2'} ${
              isDefaultItem(item.id) ? 'text-gray-300' : isPanel ? 'text-[#1d1d1f]' : 'text-gray-900'
            }`}
          >
            {item.text}
          </span>
        </button>
      )}

      <button
        onClick={() => deleteItem(item.id)}
        aria-label={`${item.text} 삭제`}
        className={
          isPanel
            ? 'h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-[#6e6e73] transition-colors duration-150 hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:text-red-600 focus-visible:ring-2 focus-visible:ring-red-200'
            : 'text-red-500 h-10 w-10 p-0 rounded-lg shrink-0 flex items-center justify-center transition-none'
        }
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  ));

  if (isPanel) {
    return (
      <>
        <div className="px-5 pb-3 shrink-0">{addRow}</div>
        <div className="panel-scroll min-h-0 overflow-y-auto px-5 pb-2">
          {items.length > 0 ? (
            <ul className="space-y-0.5">{rows}</ul>
          ) : (
            <p className="py-10 text-center text-[14px] leading-5 text-[#6e6e73]">
              아직 메뉴가 없어요.
              <br />
              먹고 싶은 메뉴를 추가해 보세요.
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Add new item section with 12px padding */}
      <div className="pt-3 mb-4">{addRow}</div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        <ul className="space-y-3 pb-4">{rows}</ul>
      </div>

      {items.length === 0 && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-muted-foreground font-medium text-center">
              룰렛 항목을 추가해주세요
            </p>
          </div>
        </div>
      )}
    </>
  );
}
