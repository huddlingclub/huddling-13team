import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';
import {
  formatDistance,
  isMobileDevice,
  naverSearchUrl,
  shortCategory,
  type NearbyStore,
} from '../lib/stores';

interface StoreListProps {
  menu: string;
  stores: NearbyStore[];
}

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe9800]/40';
const BAEMIN_BUTTON =
  'h-9 shrink-0 rounded-lg bg-[#e3f6f5] px-3 text-[13px] font-semibold leading-9 text-[#0a6560] transition-colors duration-150 hover:bg-[#d0f0ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ac1bc]/50';

// 뽑힌 메뉴를 파는 근처 가게 목록. 가게를 누르면 지도(네이버, 없으면 카카오)가 열리고,
// 배민 링크가 있는 가게는 "배민 주문" 버튼이 붙는다. PC에서는 배민 앱이 없으니 QR로 폰에 넘긴다.
export function StoreList({ menu, stores }: StoreListProps) {
  const [qrStoreId, setQrStoreId] = useState<string | null>(null);
  const mobile = isMobileDevice();

  if (stores.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-[14px] leading-5 text-[#7a6f60]">{menu} 가게는 아직 확인하지 못했어요.</p>
        <a
          href={naverSearchUrl(menu)}
          target="_blank"
          rel="noopener noreferrer"
          className={'mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#faf5ee] px-4 text-[14px] font-semibold text-[#2a1f12] transition-colors duration-150 hover:bg-[#f4ebdd] ' + FOCUS_RING}
        >
          네이버 지도에서 찾기
          <ExternalLink className="size-4 text-[#7a6f60]" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <>
    <ul className="divide-y divide-[#f2ebe1]">
      {stores.map((store) => {
        const placeUrl = store.naverUrl ?? store.kakaoUrl ?? naverSearchUrl(store.name);
        const meta = [shortCategory(store.category), formatDistance(store.distance)].filter(Boolean).join(' · ');
        const qrOpen = qrStoreId === store.id;

        return (
          <li key={store.id} className="py-1">
            <div className="flex items-center gap-2">
              <a
                href={placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={'-mx-2 min-w-0 flex-1 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-[#fff8ee] ' + FOCUS_RING}
              >
                <span className="block truncate text-[15px] font-semibold leading-[22px] text-[#2a1f12]">{store.name}</span>
                {meta && <span className="block truncate text-[13px] leading-5 text-[#7a6f60] tabular-nums">{meta}</span>}
              </a>

              {store.baeminUrl &&
                (mobile ? (
                  <a href={store.baeminUrl} target="_blank" rel="noopener noreferrer" className={BAEMIN_BUTTON}>
                    배민 주문
                  </a>
                ) : (
                  <button
                    type="button"
                    aria-expanded={qrOpen}
                    aria-controls={'qr-' + store.id}
                    onClick={() => setQrStoreId(qrOpen ? null : store.id)}
                    className={BAEMIN_BUTTON}
                  >
                    배민 주문
                  </button>
                ))}
            </div>

            {qrOpen && store.baeminUrl && (
              <div id={'qr-' + store.id} className="mb-2 mt-1 flex items-center gap-4 rounded-xl bg-[#faf5ee] p-3">
                <div className="shrink-0 rounded-lg bg-white p-1.5">
                  <QRCodeSVG value={store.baeminUrl} size={88} marginSize={1} fgColor="#2a1f12" title={store.name + ' 배민 링크 QR'} />
                </div>
                <p className="text-[13px] leading-5 text-[#5c5243]">
                  폰 카메라로 찍으면
                  <br />
                  배민 앱에서 이 가게가 열려요.
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
    <p className="pb-1 pt-2 text-[12px] leading-[18px] text-[#7a6f60]">가게를 누르면 지도가 열려요</p>
    </>
  );
}
