import { useState, useEffect, useCallback } from 'react';
import { RouletteWheel } from './components/RouletteWheel';
import { RouletteManager } from './components/RouletteManager';
import { SimpleModal } from './components/SimpleModal';
import svgPaths from './assets/svgPaths';

interface RouletteItem {
  id: string;
  text: string;
  color: string;
}

const ITEMS_KEY = 'rouletteItems';
const VERSION_KEY = 'rouletteVersion';
const CURRENT_VERSION = '7.0'; // 로컬 스토리지 초기화 버전

const DEFAULT_ITEMS: RouletteItem[] = [
  { id: '1', text: '항목 1', color: '#D1D5DB' },
  { id: '2', text: '항목 2', color: '#E5E7EB' },
  { id: '3', text: '항목 3', color: '#F3F4F6' },
  { id: '4', text: '항목 4', color: '#E5E7EB' },
  { id: '5', text: '항목 5', color: '#D1D5DB' }
];

// 첫 렌더링 전에 로컬 스토리지에서 항목을 읽는다.
// effect에서 읽으면 StrictMode의 이중 실행 때 빈 배열이 먼저 저장되어 항목이 초기화된다.
function loadItems(): RouletteItem[] {
  if (localStorage.getItem(VERSION_KEY) === CURRENT_VERSION) {
    try {
      const saved = JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
      console.error('Failed to load items from localStorage:', e);
    }
  }
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  return DEFAULT_ITEMS;
}

function PageHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="Page header">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-3 items-center justify-start px-3 py-1 relative w-full">
          {/* Return Button */}
          <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-[12px] relative rounded-[20px] shrink-0 size-10" data-name="return_button">
            <div className="h-6 relative shrink-0 w-[24px]" data-name="ic/left">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path
                  clipRule="evenodd"
                  d={svgPaths.p9f4a980}
                  fill="#555555"
                  fillRule="evenodd"
                />
              </svg>
            </div>
          </div>
          
          {/* Padding Frame */}
          <div className="basis-0 box-border content-stretch flex flex-row gap-2.5 grow items-center justify-center min-h-px min-w-px p-0 shrink-0" data-name="padding frame" />
          
          {/* Edit Button (placeholder) */}
          <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-[12px] relative rounded-[20px] shrink-0 size-10" data-name="edit_button">
            <div className="relative shrink-0 size-6" data-name="ic/dummy icon">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <g id="ic/dummy icon">
                  <g id="Vector"></g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemButton({ item, isSelected }: { item: RouletteItem; isSelected?: boolean }) {
  return (
    <div 
      className={`bg-[#fffdfa] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-5 py-[11px] relative rounded-[22px] shrink-0 ${isSelected ? 'shadow-[0px_0px_12px_0px_rgba(0,0,0,0.25)]' : ''}`}
      data-name="Event_select_button"
    >
      {!isSelected && (
        <div
          aria-hidden="true"
          className="absolute border border-[#fff6e9] border-solid inset-0 pointer-events-none rounded-[22px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.25)]"
        />
      )}
      <div className={`leading-[0] not-italic relative shrink-0 ${isSelected ? 'text-[#555555]' : 'text-[#918c85]'} text-[16px] text-left text-nowrap font-semibold`}>
        <p className="block leading-[22px] whitespace-pre">{item.text}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState<RouletteItem[]>(loadItems);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  // 화면 높이 감지
  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', updateScreenHeight);
    window.addEventListener('orientationchange', updateScreenHeight);
    
    return () => {
      window.removeEventListener('resize', updateScreenHeight);
      window.removeEventListener('orientationchange', updateScreenHeight);
    };
  }, []);

  // 항목 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }, [items]);

  const handleSpin = useCallback(() => {
    if (items.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
  }, [items.length, isSpinning]);

  const handleSpinComplete = useCallback((winnerItem: RouletteItem) => {
    // 스핀 완료 처리를 약간 지연시켜 애니메이션 완료 보장
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(winnerItem);
      setShowResult(true);
    }, 100);
  }, []);

  // 모바일~태블릿 전용 반응형 스타일 계산
  const getResponsiveStyles = () => {
    const isSmallMobile = screenHeight < 600;  // 작은 모바일 (iPhone SE 등)
    const isMobile = screenHeight >= 600 && screenHeight < 800;  // 일반 모바일
    const isTablet = screenHeight >= 800;  // 태블릿

    return {
      // 룰렛 크기 (모바일 중심으로 조정)
      rouletteSize: isSmallMobile ? 180 : isMobile ? 240 : 280,
      // 메인 컨테이너 간격
      mainGap: isSmallMobile ? 'gap-3' : isMobile ? 'gap-4' : 'gap-6',
      // 룰렛 섹션 간격  
      rouletteGap: isSmallMobile ? 'gap-2' : isMobile ? 'gap-3' : 'gap-4',
      // 패딩
      containerPadding: 'px-4 py-2',
      // 하단 버튼 패딩 
      bottomPadding: isSmallMobile ? 'pb-6 pt-4' : 'pb-8 pt-6',
      // 제목 크기
      titleSize: isSmallMobile ? 'text-lg' : isMobile ? 'text-xl' : 'text-2xl',
      titleLineHeight: isSmallMobile ? 'leading-6' : isMobile ? 'leading-7' : 'leading-8',
      // 버튼 높이
      buttonHeight: isSmallMobile ? 'h-12' : 'h-14',
      // 항상 스크롤 레이아웃 사용 (모바일 우선)
      useScroll: true
    };
  };

  const styles = getResponsiveStyles();

  return (
    <div 
      className="bg-white relative w-full min-w-[320px] max-w-[768px] mx-auto h-screen overflow-hidden" 
      data-name="룰렛"
    >
      {/* Background Gradient */}
      <div 
        className="absolute w-[801px] h-[801px] left-1/2 top-[389px] -translate-x-1/2"
        style={{
          background: 'radial-gradient(ellipse 54.84% 54.84% at 50.11% 54.84%, rgba(255, 240, 217, 0.50) 0%, rgba(255, 240, 217, 0) 100%)',
          borderRadius: '9999px'
        }}
      />

      {/* Header Container */}
      <div 
        className="absolute w-full left-0 top-0 bg-[rgba(247,248,250,0.1)] backdrop-blur-[2px] flex flex-col"
        data-name="Header Container"
      >
        <PageHeader />
      </div>

      {/* Main Content */}
      <div 
        className="absolute w-full px-4 left-0 top-[160px] flex flex-col items-center gap-12"
      >
        {/* Roulette Section */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Title */}
          <div className="text-[#915700] text-2xl font-bold text-center leading-[30px]">
            돌려돌려 돌림판
          </div>
          
          {/* Roulette Wheel */}
          <div 
            className="relative w-full aspect-square"
            style={{ maxWidth: `${styles.rouletteSize}px` }}
          >
            <RouletteWheel 
              items={items} 
              isSpinning={isSpinning} 
              onSpinComplete={handleSpinComplete} 
            />
          </div>
        </div>
        
        {/* Add Item Button */}
        <button
          onClick={() => setShowAddItem(true)}
          className="bg-[#fff0d9] flex items-center justify-center px-6 py-3.5 rounded-[25px]"
        >
          <span className="text-[#fe9800] text-base font-bold">항목 추가하기</span>
        </button>
      </div>

      {/* Bottom Button */}
      <div className="absolute w-full left-0 bottom-0 rounded-tl-[24px] rounded-tr-[24px]">
        <div className="flex flex-col items-center pt-5 pb-10 px-4">
          <button
            onClick={handleSpin}
            disabled={items.length === 0 || isSpinning}
            className="bg-[#fe9800] flex items-center justify-center h-[52px] rounded-lg w-full max-w-[343px] disabled:opacity-50 transition-all duration-200"
          >
            {isSpinning ? (
              <svg 
                className="w-8 h-8" 
                fill="white" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4" cy="12" r="3">
                  <animate 
                    id="spinner_jObz" 
                    begin="0;spinner_vwSQ.end-0.25s" 
                    attributeName="r" 
                    dur="0.75s" 
                    values="3;.2;3"
                  />
                </circle>
                <circle cx="12" cy="12" r="3">
                  <animate 
                    begin="spinner_jObz.end-0.6s" 
                    attributeName="r" 
                    dur="0.75s" 
                    values="3;.2;3"
                  />
                </circle>
                <circle cx="20" cy="12" r="3">
                  <animate 
                    id="spinner_vwSQ" 
                    begin="spinner_jObz.end-0.45s" 
                    attributeName="r" 
                    dur="0.75s" 
                    values="3;.2;3"
                  />
                </circle>
              </svg>
            ) : (
              <span className="text-white text-base font-semibold">돌리기</span>
            )}
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      <RouletteManager 
        items={items} 
        onItemsChange={setItems}
        isOpen={showAddItem}
        onOpenChange={setShowAddItem}
      />

      {/* Result Modal */}
      <SimpleModal isOpen={showResult} onClose={() => setShowResult(false)} className="w-[90vw] max-w-[400px]">
        <div className="p-6 text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-white shadow-lg" 
            style={{ backgroundColor: winner?.color || '#E5E5E5' }}
          />
          <p className="text-2xl font-bold mb-2 text-gray-900">{winner?.text || '항목 없음'}</p>
          <p className="text-muted-foreground mb-6">축하합니다!</p>
          <button 
            onClick={() => setShowResult(false)} 
            className="w-full h-12 bg-[#fe9800] text-white font-semibold rounded-lg transition-none"
          >
            확인
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
