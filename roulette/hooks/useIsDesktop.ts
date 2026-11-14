import { useEffect, useState } from 'react';

// 우측 메뉴 목록 패널을 보여 주는 데스크톱 기준 (Tailwind lg와 같은 1024px)
const DESKTOP_QUERY = '(min-width: 1024px)';

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}
