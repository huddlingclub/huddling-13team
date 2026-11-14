import { foodIconUrl, foodStyle } from '../lib/foodStyles';

// 참고 디자인의 정사각 썸네일. 카테고리 파스텔 위에 3D 아이콘(없으면 선 아이콘)을 얹는다.
export function FoodThumb({ menu }: { menu: string }) {
  const style = foodStyle(menu);
  const src = foodIconUrl(style.slug);
  return (
    <span
      aria-hidden="true"
      className="grid size-16 shrink-0 place-items-center rounded-2xl"
      style={{ backgroundColor: style.tint }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} className="size-[76%] object-contain" />
      ) : (
        <style.Icon className="size-7 text-[#3A3A3C]" strokeWidth={1.75} />
      )}
    </span>
  );
}
