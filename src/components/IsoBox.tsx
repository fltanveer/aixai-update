import { boxFaces, f, INK, type Origin } from "@/lib/iso";

type Props = {
  o: Origin;
  at: [number, number, number];
  size: [number, number, number];
  tones?: [string, string, string]; // top, left, right
  edge?: string;
};

/** A shaded isometric box: left (+y) face, right (+x) face, top, and an optional lit top edge. */
export default function IsoBox({ o, at, size, tones = ["#F2F1EC", "#E3E1D8", "#FFFFFE"], edge }: Props) {
  const b = boxFaces(o, ...at, ...size, !!edge);
  const face = { stroke: INK, strokeWidth: 0.8, strokeLinejoin: "round" as const };
  return (
    <>
      <polygon points={b.left} fill={tones[1]} {...face} />
      <polygon points={b.right} fill={tones[2]} {...face} />
      <polygon points={b.top} fill={tones[0]} {...face} />
      {edge && b.edge && (
        <line x1={f(b.edge[0])} y1={f(b.edge[1])} x2={f(b.edge[2])} y2={f(b.edge[3])} stroke={edge} strokeWidth={3} strokeLinecap="round" />
      )}
    </>
  );
}
