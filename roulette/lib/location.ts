import base from '../data/base.json';

export interface LatLng {
  lat: number;
  lng: number;
}

// 쇼케이스라 위치는 서울스퀘어로 고정한다. 기기 위치는 묻지 않고, 가게 거리와 낚시터 반경은 모두 여기서 잰다.
// searchArea: 확인한 가게가 없을 때 네이버 지도 검색어 앞에 붙이는 지역 이름
export const BASE_LOCATION: LatLng & { name: string; searchArea: string } = base;
