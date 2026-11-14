import { distanceLine, formatDistance, naverSearchUrl, shortCategory, type NearbyStore } from '../lib/stores';
import { FoodThumb } from './FoodThumb';
import { useOpenOrderQr } from './OrderQr';

interface StoreRowProps {
  store: NearbyStore;
  menu: string;
  // 있으면 이 줄을 강조한다(분홍 글자와 테두리 버튼). 예: 뽑힌 카테고리의 가장 가까운 곳
  note?: string;
}

export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30';

// 가게 한 줄. 줄을 누르면 지도(네이버, 없으면 카카오)가 열리고,
// 오른쪽 "배민 주문" 버튼은 앱 전체에 하나뿐인 QR 창(huddling.club)을 연다.
export function StoreRow({ store, menu, note }: StoreRowProps) {
  const openQr = useOpenOrderQr();
  const accent = Boolean(note);
  const placeUrl = store.naverUrl ?? store.kakaoUrl ?? naverSearchUrl(store.name);
  const sub = shortCategory(store.category);
  const meta = accent ? [note, formatDistance(store.distance)].filter(Boolean).join(' · ') : distanceLine(store.distance);
  const pill =
    'h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold leading-10 transition-colors duration-150 ' +
    FOCUS_RING +
    (accent
      ? ' border border-[#F3C6D6] bg-white leading-[38px] text-[#B8507A] hover:bg-[#FFF5F8]'
      : ' bg-[#F6F6F6] text-black hover:bg-[#EDEDED]');

  return (
    <li className="flex items-center gap-3">
      <a
        href={placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={'-m-2 flex min-w-0 flex-1 items-center gap-4 rounded-2xl p-2 transition-colors duration-150 hover:bg-black/[0.03] ' + FOCUS_RING}
      >
        <FoodThumb menu={menu} />
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-semibold leading-[22px] text-black">{store.name}</span>
          {sub && <span className="mt-0.5 block truncate text-[14px] leading-5 text-[#737373]">{sub}</span>}
          {meta && (
            <span
              className={
                'mt-0.5 block text-[13px] leading-[18px] tabular-nums ' +
                // 강조 줄은 좁은 화면에서 잘리지 않고 다음 줄로 넘어간다.
                (accent ? 'break-keep font-medium text-[#B8507A]' : 'truncate text-[#737373]')
              }
            >
              {meta}
            </span>
          )}
        </span>
      </a>

      <button type="button" aria-haspopup="dialog" onClick={openQr} className={pill}>
        배민 주문
      </button>
    </li>
  );
}
