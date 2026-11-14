import { useState } from 'react';
import { Input } from './ui/input';
import { BottomSheet } from './BottomSheet';
import { Trash2, Plus } from 'lucide-react';

interface RouletteItem {
  id: string;
  text: string;
  color: string;
}

interface RouletteManagerProps {
  items: RouletteItem[];
  onItemsChange: (items: RouletteItem[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
];

export function RouletteManager({ items, onItemsChange, isOpen, onOpenChange }: RouletteManagerProps) {
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

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

  const handleInputBlur = (id: string) => {
    // 포커스를 잃으면 자동으로 저장
    saveEdit(id);
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

  return (
    <BottomSheet isOpen={isOpen} onClose={() => onOpenChange(false)} className="h-[80vh] max-h-[600px] min-h-[400px]">
      {/* Drag Handle */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
      </div>
      
      <div className="flex flex-col h-full px-4 sm:px-6 pb-4 pt-9">
        {/* Add new item section with 12px padding */}
        <div className="pt-3 mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="새 항목 입력"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              className="flex-1 h-12 text-[16px] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-input focus:shadow-none"
            />
            <button 
              onClick={addItem}
              disabled={!newItemText.trim()}
              className="h-12 px-4 bg-[#fe9800] rounded-md font-semibold shrink-0 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-none"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        
        {/* Items list */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          <div className="space-y-3 pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 sm:p-4 border rounded-xl bg-white shadow-sm min-h-[68px]">
                <div 
                  className="w-5 h-5 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                
                {editingId === item.id ? (
                  <>
                    <div className="flex-1 h-10 flex items-center">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleInputBlur(item.id)}
                        onKeyDown={(e) => handleInputKeyDown(e, item.id)}
                        className="w-full h-10 text-[16px] !bg-transparent !border-0 !border-none !outline-none !ring-0 !ring-transparent !ring-offset-0 focus:!border-0 focus:!border-none focus:!outline-none focus:!ring-0 focus:!ring-transparent focus:!shadow-none focus-visible:!border-0 focus-visible:!border-none focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!ring-offset-0 focus-visible:!shadow-none"
                        style={{
                          border: '0 !important',
                          borderWidth: '0 !important',
                          borderColor: 'transparent !important',
                          outline: 'none !important',
                          boxShadow: 'none !important',
                          backgroundColor: 'transparent !important',
                          '--tw-ring-width': '0px !important',
                          '--tw-ring-color': 'transparent !important',
                          '--tw-ring-offset-width': '0px !important'
                        } as React.CSSProperties}
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 h-10 w-10 p-0 rounded-lg shrink-0 flex items-center justify-center transition-none"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer h-10 flex items-center"
                      onClick={() => startEditing(item)}
                    >
                      <span 
                        className={`block font-medium text-[16px] break-words rounded px-2 -mx-2 leading-[22px] ${
                          isDefaultItem(item.id) 
                            ? 'text-gray-300' 
                            : 'text-gray-900'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 h-10 w-10 p-0 rounded-lg shrink-0 flex items-center justify-center transition-none"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
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
      </div>
    </BottomSheet>
  );
}