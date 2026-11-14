import base from '../data/base.json';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface UserLocation extends LatLng {
  // false면 기기 위치를 못 받아 기준 위치(서울스퀘어)를 쓴 것이다.
  fromDevice: boolean;
}

// searchArea: 확인한 가게가 없을 때 네이버 지도 검색어 앞에 붙이는 지역 이름
export const BASE_LOCATION: LatLng & { name: string; searchArea: string } = base;

// 오차가 이보다 크면 근처 가게를 고르기에 부정확하므로 기준 위치를 쓴다.
const MAX_ACCURACY_M = 1000;

// 기기 위치를 받는다. 운영체제가 GPS, 와이파이, 기지국을 합쳐 계산한다.
// HTTPS 페이지나 localhost에서만 동작하고, 거부·시간 초과·큰 오차면 기준 위치를 돌려준다.
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    const fallback = () => resolve({ lat: BASE_LOCATION.lat, lng: BASE_LOCATION.lng, fromDevice: false });
    if (!('geolocation' in navigator)) return fallback();

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        coords.accuracy > MAX_ACCURACY_M
          ? fallback()
          : resolve({ lat: coords.latitude, lng: coords.longitude, fromDevice: true }),
      fallback,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

// 두 좌표 사이의 직선거리(미터). 가게를 사용자 위치 기준으로 다시 정렬할 때 쓴다.
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
