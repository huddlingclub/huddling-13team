import {
  Beef,
  CookingPot,
  Fish,
  Flame,
  Ham,
  Leaf,
  Pizza,
  Salad,
  Sandwich,
  Shell,
  Soup,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

// 카테고리(룰렛 항목)마다 썸네일 파스텔과 아이콘. 파스텔 6색은 참고 디자인(Morning/Evening Circle)에서 뽑았고,
// 목록에서 이웃한 카테고리끼리 색이 겹치지 않게 나눴다.
// 3D 아이콘 파일을 assets/food/<slug>.png(또는 .webp, .svg)로 넣으면 그 파일을 쓰고,
// 없으면 lucide 선 아이콘을 쓴다. 파일 이름 목록은 assets/food/README.md에 있다.
export interface FoodStyle {
  slug: string;
  tint: string; // 썸네일 배경
  Icon: LucideIcon;
}

const PASTEL = {
  pink: '#F9CACD',
  yellow: '#FCEFC7',
  blue: '#C8EAF3',
  purple: '#E3C4F6',
  green: '#C7F3CF',
  gray: '#E0E0E0',
};

const STYLES: Record<string, FoodStyle> = {
  한식: { slug: 'korean', tint: PASTEL.pink, Icon: Soup },
  중식: { slug: 'chinese', tint: PASTEL.yellow, Icon: CookingPot },
  일식: { slug: 'japanese', tint: PASTEL.blue, Icon: Fish },
  양식: { slug: 'western', tint: PASTEL.purple, Icon: Pizza },
  분식: { slug: 'bunsik', tint: PASTEL.pink, Icon: Flame },
  아시안: { slug: 'asian', tint: PASTEL.green, Icon: Leaf },
  고기: { slug: 'meat', tint: PASTEL.yellow, Icon: Beef },
  해산물: { slug: 'seafood', tint: PASTEL.blue, Icon: Shell },
  패스트푸드: { slug: 'fastfood', tint: PASTEL.purple, Icon: Sandwich },
  샐러드: { slug: 'salad', tint: PASTEL.green, Icon: Salad },
  김치찌개: { slug: 'kimchi-stew', tint: PASTEL.pink, Icon: CookingPot },
  돈까스: { slug: 'cutlet', tint: PASTEL.yellow, Icon: Ham },
  국밥: { slug: 'gukbap', tint: PASTEL.gray, Icon: Soup },
  쌀국수: { slug: 'pho', tint: PASTEL.green, Icon: Soup },
};

const DEFAULT_STYLE: FoodStyle = { slug: 'default', tint: PASTEL.gray, Icon: UtensilsCrossed };

const FILES = import.meta.glob('../assets/food/*.{png,webp,svg,jpg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

export function foodStyle(menu: string): FoodStyle {
  return STYLES[menu.trim()] ?? DEFAULT_STYLE;
}

export function foodIconUrl(slug: string): string | null {
  const key = Object.keys(FILES).find((path) => path.replace(/^.*\//, '').replace(/\.[a-z]+$/, '') === slug);
  return key ? FILES[key] : null;
}
