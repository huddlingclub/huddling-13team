import storesData from '../data/stores.json';
import type { Store } from '../types';
import { BASE_LOCATION } from './location';

const STORES = storesData as Store[];

// distance는 서울스퀘어에서 잰 거리(미터)다. 위치가 서울스퀘어로 고정이라 데이터를 만들 때 잰 값을 그대로 쓴다.
export interface NearbyStore extends Store {
  distance: number | null;
}

// 같은 가게가 여러 메뉴에 들어 있어서(388줄 중 77곳) 가게 수는 이름과 주소가 같으면 한 곳으로 센다.
export function countStores(stores: Store[]): number {
  return new Set(stores.map((s) => s.name + '|' + s.address)).size;
}

export const STORE_TOTAL = countStores(STORES);

// 메뉴를 파는 가게를 서울스퀘어에서 가까운 순으로. 좌표가 없는 가게는 맨 뒤로 간다.
export function findNearbyStores(menu: string): NearbyStore[] {
  return STORES.filter((s) => s.menu === menu.trim())
    .map((s) => ({ ...s, distance: s.distanceFromBase }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
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

// "한식 > 찌개,전골" 처럼 저장된 분류에서 마지막 단계만 "찌개, 전골"로 보여 준다.
export function shortCategory(category: string): string {
  return (category.split(' > ').pop() ?? '').replace(/,\s*/g, ', ');
}

// 확인한 가게가 없을 때 네이버 지도에서 기준 지역 + 메뉴로 검색한다.
export function naverSearchUrl(menu: string): string {
  return 'https://map.naver.com/p/search/' + encodeURIComponent(BASE_LOCATION.searchArea + ' ' + menu.trim());
}

// 네이버 이미지 프록시로 160px 정사각 썸네일(64px 칸의 2.5배)을 받는다. 사장님 사진(ldb-phinf)뿐 아니라
// 리뷰·블로그 사진(pup-review-phinf, blogfiles)도 이 프록시로만 줄여서 받을 수 있다.
export function storeThumbUrl(url: string): string {
  return 'https://search.pstatic.net/common/?src=' + encodeURIComponent(url) + '&type=f160_160';
}
