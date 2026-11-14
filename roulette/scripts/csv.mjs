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
  'road_address',
  'phone',
  'kakao_url',
  'lat',
  'lng',
  'kakao_id',
];

// 배민 공유 링크를 받기 전까지 넣어 두는 자리표시자. 누르면 배민 첫 화면이 열린다.
// stores:build가 이 링크가 남은 가게 수를 알려 준다.
export const DUMMY_BAEMIN_URL = 'https://baemin.com/';

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
