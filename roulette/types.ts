export interface RouletteItem {
  id: string;
  text: string;
  color: string;
}

// data/stores.json 한 줄. scripts/build-stores.mjs가 만든다.
export interface Store {
  id: string;
  menu: string;
  name: string;
  category: string;
  address: string;
  lat: number | null;
  lng: number | null;
  distanceFromBase: number | null; // 기준 위치(서울스퀘어)에서의 거리(미터)
  naverUrl: string | null;
  baeminUrl: string | null;
  kakaoUrl: string | null;
  imageUrl: string | null; // 네이버 대표 사진 원본 주소. 앱은 storeThumbUrl로 160px 썸네일을 받는다.
}
