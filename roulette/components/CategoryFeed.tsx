import { useEffect, useMemo, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import type { RouletteItem } from '../types';
import type { UserLocation } from '../lib/location';
import { findNearbyStores, measuredFromLabel, type NearbyStores } from '../lib/stores';
import { foodStyle } from '../lib/foodStyles';
import { RouletteItemEditor } from './RouletteItemEditor';
import { StoreList } from './StoreList';
import { FOCUS_RING } from './StoreRow';

interface CategoryFeedProps {
  items: RouletteItem[];
  onItemsChange: (items: RouletteItem[]) => void;
  winner: RouletteItem | null;
  isSpinning: boolean;
  // 새 결과가 나올 때마다 바뀌는 값. 같은 카테고리가 다시 뽑혀도 스크롤을 다시 한다.
  resultKey: number;
  location: UserLocation | null;
  editorOpen: boolean;
  onEditorOpenChange: (open: boolean) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

const COLLAPSED_COUNT = 3;

// 데스크톱 우측 목록. 참고 디자인(Morning/Evening Circle)처럼 회색 화면 위에
// 룰렛 항목(카테고리)마다 흰 카드 하나를 두고 가까운 가게를 보여 준다.
// 뽑힌 카테고리는 전부 펼치고 그 카드로 스크롤한다.
export function CategoryFeed({
  items,
  onItemsChange,
  winner,
  isSpinning,
  resultKey,
  location,
  editorOpen,
  onEditorOpenChange,
  inputRef,
}: CategoryFeedProps) {
  const sections = useMemo(
    () => items.map((item) => ({ item, nearby: findNearbyStores(item.text, location) })),
    [items, location],
  );
  const pickedId = !isSpinning && winner ? winner.id : null;
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pickedId) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRefs.current.get(pickedId)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [pickedId, resultKey]);

  // 편집 카드는 목록 맨 위에 열리므로, 아래로 내려가 있었으면 위로 올린다.
  useEffect(() => {
    if (editorOpen) scrollRef.current?.scrollTo({ top: 0 });
  }, [editorOpen]);

  const status = isSpinning ? '고르는 중…' : winner ? winner.text : '뭐 먹지?';
  const from = measuredFromLabel(sections[0]?.nearby.measuredFrom ?? 'base');

  return (
    <section
      ref={scrollRef}
      aria-label="카테고리별 근처 가게"
      className="panel-scroll h-screen w-[420px] shrink-0 overflow-y-auto bg-[#F6F6F6] px-5"
    >
      <header className="sticky top-0 z-10 bg-[#F6F6F6] pb-4 pt-8">
        <div className="flex items-start justify-between gap-4">
          <h2 aria-live="polite" className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-black">
            오늘 점심,{' '}
            <span key={status + resultKey} className={'text-[#7C7C80]' + (pickedId ? ' result-enter inline-block' : '')}>
              {status}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => onEditorOpenChange(!editorOpen)}
            aria-expanded={editorOpen}
            aria-label="룰렛 메뉴 편집"
            className={
              'grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-150 ' +
              FOCUS_RING +
              (editorOpen ? ' bg-black text-white' : ' bg-white text-black hover:bg-[#EDEDED]')
            }
          >
            <Pencil className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-[13px] leading-[18px] text-[#6B6B6B]">{from}에서 가까운 순 · 가게를 누르면 지도가 열려요</p>
      </header>

      {editorOpen && (
        <div className="mb-3 rounded-3xl bg-white pb-3 pt-5">
          <div className="mb-3 flex items-center justify-between px-5">
            <h3 className="text-[17px] font-semibold leading-6 text-black">
              룰렛 메뉴 <span className="text-[#737373] tabular-nums">{items.length}</span>
            </h3>
            <button
              type="button"
              onClick={() => onEditorOpenChange(false)}
              className={'h-9 rounded-full bg-[#F6F6F6] px-4 text-[14px] font-semibold text-black hover:bg-[#EDEDED] ' + FOCUS_RING}
            >
              완료
            </button>
          </div>
          <RouletteItemEditor variant="panel" items={items} onItemsChange={onItemsChange} inputRef={inputRef} />
        </div>
      )}

      <div className="space-y-3 pb-10">
        {sections.map(({ item, nearby }) => (
          <CategorySection
            key={item.id}
            item={item}
            nearby={nearby}
            picked={item.id === pickedId}
            sectionRef={(el) => {
              if (el) sectionRefs.current.set(item.id, el);
              else sectionRefs.current.delete(item.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}

interface CategorySectionProps {
  item: RouletteItem;
  nearby: NearbyStores;
  picked: boolean;
  sectionRef: (el: HTMLElement | null) => void;
}

function CategorySection({ item, nearby, picked, sectionRef }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { Icon } = foodStyle(item.text);
  const count = nearby.stores.length;
  const open = picked || expanded;
  const headingId = 'feed-' + item.id;

  return (
    <article
      ref={sectionRef}
      aria-labelledby={headingId}
      // 고정 제목(높이 100px) 바로 아래에 멈추고, 이전 카드 끝은 제목 뒤로 숨는다.
      className="scroll-mt-[106px] rounded-3xl bg-white p-5"
    >
      <header className="mb-5 flex items-center gap-2">
        <Icon className="size-[18px] shrink-0 text-black" strokeWidth={2} aria-hidden="true" />
        <h3 id={headingId} className="truncate text-[17px] font-semibold leading-6 text-black">
          {item.text}
        </h3>
        {picked && (
          <span className="shrink-0 rounded-full border border-[#F3C6D6] px-2.5 text-[12px] font-semibold leading-[22px] text-[#B8507A]">
            오늘의 점심
          </span>
        )}
        {count > 0 && <span className="ml-auto shrink-0 text-[13px] text-[#737373] tabular-nums">{count}곳</span>}
      </header>

      <StoreList
        menu={item.text}
        stores={nearby.stores}
        limit={open ? undefined : COLLAPSED_COUNT}
        firstNote={picked ? '가장 가까운 곳' : undefined}
      />

      {!picked && count > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className={
            'mt-5 h-10 w-full rounded-full bg-[#F6F6F6] text-[14px] font-semibold text-black transition-colors duration-150 hover:bg-[#EDEDED] ' +
            FOCUS_RING
          }
        >
          {expanded ? '접기' : count + '곳 모두 보기'}
        </button>
      )}
    </article>
  );
}
