import { useState, useEffect, useCallback, useRef } from 'react';
import { MenuFishing } from './components/MenuFishing';
import { RouletteManager } from './components/RouletteManager';
import { CategoryFeed } from './components/CategoryFeed';
import { useIsDesktop } from './hooks/useIsDesktop';
import { useUserLocation } from './hooks/useUserLocation';
import { COLORS } from './components/RouletteItemEditor';
import categories from './data/categories.json';
import type { RouletteItem } from './types';

const ITEMS_KEY = 'rouletteItems';
const VERSION_KEY = 'rouletteVersion';
const CURRENT_VERSION = '9.0'; // 로컬 스토리지 초기화 버전. 기본 항목을 바꾸면 올린다.

// 기본 항목은 근처 가게를 나눈 카테고리 10개(data/categories.json). 색은 COLORS 순서대로 하나씩.
const DEFAULT_ITEMS: RouletteItem[] = categories.map((c, i) => ({
  id: String(i + 1),
  text: c.name,
  color: COLORS[i % COLORS.length],
}));

// 첫 렌더링 전에 로컬 스토리지에서 항목을 읽는다.
// effect에서 읽으면 StrictMode의 이중 실행 때 빈 배열이 먼저 저장되어 항목이 초기화된다.
// StrictMode가 이 함수를 두 번 부르므로 여기서는 읽기만 하고, 저장은 아래 effect에서 한다.
function loadItems(): RouletteItem[] {
  if (localStorage.getItem(VERSION_KEY) === CURRENT_VERSION) {
    try {
      const saved = JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
      console.error('Failed to load items from localStorage:', e);
    }
  }
  return DEFAULT_ITEMS;
}

export default function App() {
  const [items, setItems] = useState<RouletteItem[]>(loadItems);
  const [isFishing, setIsFishing] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const panelInputRef = useRef<HTMLInputElement>(null);
  const { location, requestLocation } = useUserLocation();

  // 항목 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }, [items]);

  const handleCastStart = useCallback(() => {
    setIsFishing(true);
    setWinner(null);
  }, []);

  // 낚아 올린 메뉴. 데스크톱 우측 목록이 그 카테고리로 스크롤하고 강조한다.
  const handleCatch = useCallback((item: RouletteItem) => {
    setIsFishing(false);
    setWinner(item);
    setResultKey((k) => k + 1);
  }, []);

  // 데스크톱에서는 우측 목록 위에 편집 카드를 열고 입력창으로, 모바일에서는 바텀시트로 메뉴를 고친다.
  const handleEditMenus = () => {
    if (isDesktop) {
      setEditorOpen(true);
      requestAnimationFrame(() => panelInputRef.current?.focus());
    } else {
      setShowAddItem(true);
    }
  };

  return (
    // 데스크톱(1024px 이상): 흰 배경 위에 좌측 점심메뉴 낚시 앱 + 우측 카테고리별 가게 목록
    <div className="min-h-screen bg-white lg:flex lg:justify-center lg:gap-10">
      <main
        className="relative mx-auto h-dvh w-full min-w-[320px] max-w-[768px] overflow-hidden bg-[#DCEBFA] lg:mx-0 lg:w-[430px] lg:shrink-0 lg:shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
        data-name="점심메뉴 낚시"
      >
        <MenuFishing
          items={items}
          location={location}
          onRequestLocation={requestLocation}
          onCastStart={handleCastStart}
          onCatch={handleCatch}
          onEditMenus={handleEditMenus}
        />

        {/* 메뉴 편집 바텀시트 (모바일) */}
        {!isDesktop && (
          <RouletteManager items={items} onItemsChange={setItems} isOpen={showAddItem} onOpenChange={setShowAddItem} />
        )}
      </main>

      {isDesktop && (
        <CategoryFeed
          items={items}
          onItemsChange={setItems}
          winner={winner}
          isSpinning={isFishing}
          resultKey={resultKey}
          location={location}
          editorOpen={editorOpen}
          onEditorOpenChange={setEditorOpen}
          inputRef={panelInputRef}
        />
      )}
    </div>
  );
}
