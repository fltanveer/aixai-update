// Isometric helpers shared by the premises figure and the stack explorer.
export type Pt3 = [number, number, number?];
export type Origin = { cx: number; cy: number; s: number };

export const INK = "#17160F";
const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

export const f = (n: number) => n.toFixed(1);

export const iso = (o: Origin, x: number, y: number, z = 0): [number, number] => [
  o.cx + (x - y) * C * o.s,
  o.cy + (x + y) * S * o.s - z * o.s,
];

export const pts = (o: Origin, arr: Pt3[]) => arr.map((p) => iso(o, p[0], p[1], p[2] ?? 0).map(f).join(",")).join(" ");

export type BoxFaces = { left: string; right: string; top: string; edge?: [number, number, number, number] };

/** A shaded box: left (+y face), right (+x face) and top, as polygon point strings, plus the lit top-front edge. */
export function boxFaces(o: Origin, x: number, y: number, z: number, w: number, d: number, h: number, edge = false): BoxFaces {
  const faces: BoxFaces = {
    left: pts(o, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]),
    right: pts(o, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]),
    top: pts(o, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]),
  };
  if (edge) {
    const a = iso(o, x, y + d, z + h), b = iso(o, x + w, y + d, z + h);
    faces.edge = [a[0], a[1], b[0], b[1]];
  }
  return faces;
}

/** Points on a circular arc in plan, from a0 to a1 degrees. */
export const arc = (x: number, y: number, r: number, a0: number, a1: number, n = 8): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [x + r * Math.cos(t), y + r * Math.sin(t)];
  });
