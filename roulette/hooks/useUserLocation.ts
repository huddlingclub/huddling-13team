import { useCallback, useRef, useState } from 'react';
import { getUserLocation, type UserLocation } from '../lib/location';

// 위치 권한은 처음 돌리기를 누를 때 한 번만 묻는다. 3초 동안 돌아가는 사이에 위치를 받아 둔다.
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const requested = useRef(false);

  const requestLocation = useCallback(() => {
    if (requested.current) return;
    requested.current = true;
    getUserLocation().then(setLocation);
  }, []);

  return { location, requestLocation };
}
