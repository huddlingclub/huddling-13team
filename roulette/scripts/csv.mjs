// 후보 가게 CSV를 읽고 쓴다. 팀원이 구글 시트나 엑셀에서 링크를 채우므로
// 직접 고치는 열(naver_url, baemin_url, note)을 앞쪽에 둔다.
export const CANDIDATE_COLUMNS = [
  'menu',
  'name',
  'distance_m',
  'menu_check',
  'naver_url',
  'baemin_url',
  'note',
  'category',
  'naver_name',
  'naver_category',
  'image_url',
  'road_address',
  'phone',
  'kakao_url',
  'lat',
  'lng',
  'kakao_id',
];

// 배민 공유 링크를 받기 전까지 stores:build --dummy-baemin이 stores.json에 넣는 자리표시자.
// 누르면 배민 첫 화면이 열린다. CSV에는 넣지 않는다.
export const DUMMY_BAEMIN_URL = 'https://baemin.com/';

// 앱에 보여 줄 가게: 네이버나 배민 링크가 있고, 그 메뉴를 판다고 확인됐거나(menu_check가 menu, name, category)
// 팀원이 배민 실제 링크를 붙인 가게. menu_check가 빈 행은 아직 확인 전이라 링크만 있으면 넣는다.
const SHOWN_CHECKS = new Set(['menu', 'name', 'category']);
export const hasRealBaemin = (r) => r.baemin_url !== '' && r.baemin_url !== DUMMY_BAEMIN_URL;
export const isShownRow = (r) =>
  Boolean(r.naver_url || r.baemin_url) && (!r.menu_check || SHOWN_CHECKS.has(r.menu_check) || hasRealBaemin(r));

export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((r) => r.some((v) => v.trim() !== ''));
  if (!header) return [];
  const keys = header.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

export function toCsv(rows, columns = CANDIDATE_COLUMNS) {
  const escape = (value) => {
    const s = String(value ?? '');
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [columns.join(','), ...rows.map((r) => columns.map((c) => escape(r[c])).join(','))];
  // BOM이 있어야 엑셀에서 한글이 깨지지 않는다.
  return '\uFEFF' + lines.join('\n') + '\n';
}
