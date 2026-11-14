import storesData from '../data/stores.json';
import type { Store } from '../types';
import { BASE_LOCATION, distanceMeters, type UserLocation } from './location';

const STORES = storesData as Store[];

// 가게 데이터는 서울스퀘어 근처뿐이다. 사용자가 이보다 멀리 있으면 기기 위치 거리는 의미가 없어서
// 서울스퀘어 기준 거리를 보여 준다.
const NEAR_BASE_M = 3000;

export interface NearbyStore extends Store {
  distance: number | null;
}

export interface NearbyStores {
  stores: NearbyStore[];
  // device: 기기 위치에서 잰 거리, base: 서울스퀘어에서 잰 거리
  measuredFrom: 'device' | 'base';
}

export function findNearbyStores(menu: string, location: UserLocation | null): NearbyStores {
  const useDevice =
    location?.fromDevice === true && distanceMeters(location, BASE_LOCATION) <= NEAR_BASE_M;

  const stores = STORES.filter((s) => s.menu === menu.trim())
    .map((s) => ({
      ...s,
      distance:
        useDevice && location && s.lat !== null && s.lng !== null
          ? distanceMeters(location, { lat: s.lat, lng: s.lng })
          : s.distanceFromBase,
    }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  return { stores, measuredFrom: useDevice ? 'device' : 'base' };
}

export function formatDistance(meters: number | null): string {
  if (meters === null) return '';
  if (meters < 10) return '10m 이내';
  return meters < 1000 ? meters + 'm' : (meters / 1000).toFixed(1) + 'km';
}

// 직선거리에 길 돌아가는 몫(1.3배)을 더해 분당 67m(시속 4km)로 나눈 대략의 도보 시간.
export function distanceLine(meters: number | null): string {
  if (meters === null) return '';
  const minutes = Math.max(1, Math.round((meters * 1.3) / 67));
  return formatDistance(meters) + ' · 도보 약 ' + minutes + '분';
}

export function measuredFromLabel(measuredFrom: NearbyStores['measuredFrom']): string {
  return measuredFrom === 'device' ? '내 위치' : BASE_LOCATION.name;
}

export function nearbySummary(nearby: NearbyStores): string {
  return nearby.stores.length > 0
    ? measuredFromLabel(nearby.measuredFrom) + '에서 가까운 순 · ' + nearby.stores.length + '곳'
    : BASE_LOCATION.name + ' 근처';
}

// "한식 > 찌개,전골" 처럼 저장된 분류에서 마지막 단계만 "찌개, 전골"로 보여 준다.
export function shortCategory(category: string): string {
  return (category.split(' > ').pop() ?? '').replace(/,\s*/g, ', ');
}

// 확인한 가게가 없을 때 네이버 지도에서 기준 지역 + 메뉴로 검색한다.
export function naverSearchUrl(menu: string): string {
  return 'https://map.naver.com/p/search/' + encodeURIComponent(BASE_LOCATION.searchArea + ' ' + menu.trim());
}
