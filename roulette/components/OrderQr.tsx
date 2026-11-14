import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

// "배민 주문" 버튼이 여는 QR. 어느 가게에서 눌러도 같은 주소로 보내므로 QR은 앱 전체에 하나만 그린다.
export const ORDER_QR_URL = 'https://www.huddling.club/';

const OpenQrContext = createContext<() => void>(() => {});

export function useOpenOrderQr() {
  return useContext(OpenQrContext);
}

export function OrderQrProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openQr = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    // 모바일 결과 모달 위에 열릴 수 있어서, ESC는 여기서 먼저 받아 이 창만 닫는다.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open, close]);

  return (
    <OpenQrContext.Provider value={openQr}>
      {children}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-qr-title"
              aria-describedby="order-qr-desc"
              className="result-enter relative w-full max-w-[320px] rounded-3xl bg-white p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
            >
              <div className="mx-auto w-fit rounded-2xl bg-[#F6F6F6] p-4">
                <QRCodeSVG value={ORDER_QR_URL} size={184} marginSize={2} fgColor="#000000" title="huddling.club으로 가는 QR" />
              </div>
              <h2 id="order-qr-title" className="mt-5 text-[18px] font-semibold leading-6 text-black">
                폰 카메라로 찍어 주세요
              </h2>
              <p id="order-qr-desc" className="mt-1 text-[14px] leading-5 text-[#737373]">
                huddling.club으로 연결돼요
              </p>
              <button
                type="button"
                autoFocus
                onClick={close}
                className="mt-5 h-11 w-full rounded-full bg-[#F6F6F6] text-[15px] font-semibold text-black transition-colors duration-150 hover:bg-[#EDEDED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                닫기
              </button>
            </div>
          </div>,
          document.body,
        )}
    </OpenQrContext.Provider>
  );
}
