import { useState, useEffect } from 'react';
import { MenuFishing } from './components/MenuFishing';
import { RouletteManager } from './components/RouletteManager';
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
  const [editorOpen, setEditorOpen] = useState(false);
  const { location, requestLocation } = useUserLocation();

  // 항목 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }, [items]);

  return (
    // 점심메뉴 낚시 한 화면. 데스크톱(1024px 이상)에서는 흰 배경 가운데에 430px 폭으로 둔다.
    <div className="min-h-screen bg-white">
      <main
        className="relative mx-auto h-dvh w-full min-w-[320px] max-w-[768px] overflow-hidden bg-[#DCEBFA] lg:w-[430px] lg:shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
        data-name="점심메뉴 낚시"
      >
        <MenuFishing
          items={items}
          location={location}
          onRequestLocation={requestLocation}
          onEditMenus={() => setEditorOpen(true)}
        />

        {/* 메뉴 편집 바텀시트 */}
        <RouletteManager items={items} onItemsChange={setItems} isOpen={editorOpen} onOpenChange={setEditorOpen} />
      </main>
    </div>
  );
}
