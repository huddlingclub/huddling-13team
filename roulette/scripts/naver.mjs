// 네이버 모바일 장소 페이지(m.place.naver.com) 읽기. match-naver와 fetch-images가 함께 쓴다.
// 비공식 방법이라 네이버가 페이지 구조를 바꾸면 멈출 수 있다.
export const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
export const DELAY_MS = 700; // 너무 빠르면 네이버가 429로 막는다
const RETRY_WAITS_MS = [30_000, 60_000, 120_000];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 페이지에 들어 있는 Apollo 상태(JSON)를 꺼낸다. 429면 기다렸다가 다시 시도한다.
export async function apolloState(url) {
  let res = await fetch(url, { headers: { 'User-Agent': UA } });
  for (const wait of RETRY_WAITS_MS) {
    if (res.status !== 429) break;
    console.log('  네이버가 잠시 막았어요(429). ' + wait / 1000 + '초 뒤 다시 시도해요.');
    await sleep(wait);
    res = await fetch(url, { headers: { 'User-Agent': UA } });
  }
  if (!res.ok) throw new Error('네이버 ' + res.status + ': ' + url);
  const html = await res.text();
  const m = html.match(/window.__APOLLO_STATE__\s*=\s*(\{.*?\});\s*window\./s);
  if (!m) throw new Error('네이버 페이지 구조가 바뀌었거나 접근이 막혔어요: ' + url);
  return JSON.parse(m[1]);
}

export function placeIdFromUrl(url) {
  return url.match(/place\/(\d+)/)?.[1] ?? null;
}
