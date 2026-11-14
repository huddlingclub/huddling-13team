import { ExternalLink } from 'lucide-react';
import { naverSearchUrl, type NearbyStore } from '../lib/stores';
import { FOCUS_RING, StoreRow } from './StoreRow';

interface StoreListProps {
  menu: string;
  stores: NearbyStore[];
  // 앞에서부터 몇 곳만 보일지. 없으면 전부.
  limit?: number;
  // 첫 줄(가장 가까운 곳)에 붙이는 강조 문구
  firstNote?: string;
}

export function StoreList({ menu, stores, limit, firstNote }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-[14px] leading-5 text-[#737373]">{menu} 가게는 아직 확인하지 못했어요.</p>
        <a
          href={naverSearchUrl(menu)}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#F6F6F6] px-4 text-[14px] font-semibold text-black transition-colors duration-150 hover:bg-[#EDEDED] ' +
            FOCUS_RING
          }
        >
          네이버 지도에서 찾기
          <ExternalLink className="size-4 text-[#737373]" aria-hidden="true" />
        </a>
      </div>
    );
  }

  const shown = limit ? stores.slice(0, limit) : stores;
  return (
    <ul className="space-y-5">
      {shown.map((store, i) => (
        <StoreRow key={store.id} store={store} menu={menu} note={i === 0 ? firstNote : undefined} />
      ))}
    </ul>
  );
}
