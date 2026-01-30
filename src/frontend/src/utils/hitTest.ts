export type RectLike = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type PointLike = {
  x: number;
  y: number;
};

export function hitTestRects(point: PointLike, rects: RectLike[]): number | null {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r) continue;
    if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
      return i;
    }
  }
  return null;
}

