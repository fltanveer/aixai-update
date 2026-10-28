"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import IsoBox from "@/components/IsoBox";
import { arc, f, INK, iso, pts, type Origin, type Pt3 } from "@/lib/iso";

/*
 * Signature figure: an isometric premises with one locked cabinet in a back-of-house IT closet,
 * devices on the walls and floor, and single-pair runs back to the cabinet. The geometry renders
 * on the server; on the client the runs draw in, pulses keep travelling them, and the legend filters.
 */

const W = 16, D = 12, H = 3, T = 0.22, s = 22, R = 1, BT = 0.45;
const o: Origin = { cx: 433, cy: 40 + H * s, s };

type Kind = "room" | "power" | "cool" | "cam" | "access" | "fire" | "mach";
type Glyph = "disc" | "box" | "plate" | "tri" | "door" | "reader" | "hex" | "meter";
type Dev = { k: Kind; x: number; y: number; z: number; g: Glyph; sz?: [number, number, number] };

const DEVICES: Dev[] = (
  [
    ["room", 6, 0, 1.8, "disc"], ["room", 12.5, 0, 1.8, "disc"], ["room", 0, 6.8, 1.8, "disc"], ["room", 0, 9.6, 1.2, "disc"],
    ["power", 2.9, 1.0, 0, "box", [0.8, 0.6, 1.0]], ["power", 0, 5.2, 1.0, "plate"],
    ["cool", 13.6, 1.0, 0, "box", [1.6, 1.0, 1.3]], ["cool", 3.3, 0, 2.2, "plate"],
    ["cam", 9.8, 0, 2.6, "tri"], ["cam", 0, 10.1, 2.6, "tri"], ["cam", 14.1, 0, 2.6, "tri"],
    ["access", 7.6, 0, 1.1, "door"], ["access", 7.05, 0, 1.2, "reader"],
    ["fire", 11.2, 0, 2.5, "hex"], ["fire", 0, 2.2, 2.5, "hex"], ["fire", 0, 8.3, 0.9, "meter"],
    ["mach", 9.6, 6.8, 0, "box", [2.2, 1.4, 1.1]], ["mach", 12.6, 8.8, 0, "box", [1.2, 1.2, 0.9]],
  ] as [Kind, number, number, number, Glyph, [number, number, number]?][]
)
  .map(([k, x, y, z, g, sz]) => ({ k, x, y, z, g, sz }))
  .sort((p, q) => p.x + p.y - (q.x + q.y)); // far to near, so nearer devices cover farther ones

/** Single-pair runs share two trunks: one along the back wall, one along the left wall. */
function wireOf({ x, y, z, g, sz }: Dev): Pt3[] | null {
  if (g === "door") return null;
  if (g === "box" && sz) {
    if (x < 4.2 && y < 3.6) return [[2.5, 1.3, 0], [x, 1.3, 0]];
    const cx = x + sz[0] / 2;
    return [[2.6, 1.5, 0], [2.6, BT, 0], [cx, BT, 0], [cx, y, 0]];
  }
  if (y === 0) return [[2.6, 1.5, 0], [2.6, BT, 0], [x, BT, 0], [x, 0, 0], [x, 0, Math.max(z - 0.3, 0)]];
  return [[1.2, 1.6, 0], [BT, 1.6, 0], [BT, y, 0], [0, y, 0], [0, y, Math.max(z - 0.3, 0)]];
}

const ITEMS = DEVICES.map((d) => {
  const w = wireOf(d);
  const path = w ? "M" + w.map((q) => iso(o, q[0], q[1], q[2] ?? 0).map(f).join(" ")).join("L") : "";
  const dist = w ? w.reduce((a, q, i) => (i ? a + Math.abs(q[0] - w[i - 1][0]) + Math.abs(q[1] - w[i - 1][1]) : 0), 0) : 0;
  return { ...d, path, dist };
});

// rounded plan: a quarter circle of radius R at each corner of the floor, and where the two walls meet
const at = (ring: [number, number][], z: number): Pt3[] => ring.map((q) => [q[0], q[1], z]);
const FLOOR = [...arc(W - R, R, R, -90, 0), ...arc(W - R, D - R, R, 0, 90), ...arc(R, D - R, R, 90, 180), ...arc(R, R, R, 180, 270)];
const CORNER = arc(R, R, R, 180, 270);
const WALL_RUN: [number, number][] = [[0, D - R], ...CORNER, [W - R, 0]];
const mix = (t: number) =>
  "#" + [[0xe9, 0xf2], [0xe7, 0xf1], [0xdf, 0xec]].map(([u, v]) => Math.round(u + (v - u) * t).toString(16).padStart(2, "0")).join("");
const gridLine = (p: [number, number], q: [number, number]) => {
  const m = iso(o, p[0], p[1]), n = iso(o, q[0], q[1]);
  return { x1: f(m[0]), y1: f(m[1]), x2: f(n[0]), y2: f(n[1]) };
};
const edge = { stroke: INK, strokeWidth: 1, strokeLinejoin: "round" as const };

function Glyph({ d }: { d: Dev }) {
  const p = iso(o, d.x, d.y, d.z);
  const line = { fill: "#FFFFFE", stroke: INK, strokeWidth: 1.25 };
  switch (d.g) {
    case "box":
      return <IsoBox o={o} at={[d.x, d.y, d.z]} size={d.sz!} />;
    case "disc":
      return <circle cx={f(p[0])} cy={f(p[1])} r={6} {...line} />;
    case "tri":
      return <path d={`M${f(p[0] - 7)} ${f(p[1] - 4)}h14l-7 10z`} strokeLinejoin="round" {...line} />;
    case "hex": {
      const r = 6.5;
      const dd = "M" + [0, 1, 2, 3, 4, 5].map((i) => f(p[0] + r * Math.cos((Math.PI / 3) * i + Math.PI / 6)) + " " + f(p[1] + r * Math.sin((Math.PI / 3) * i + Math.PI / 6))).join("L") + "Z";
      return <path d={dd} {...line} />;
    }
    case "door":
      return <polygon points={pts(o, [[d.x, 0, 0], [d.x + 1.3, 0, 0], [d.x + 1.3, 0, 2.2], [d.x, 0, 2.2]])} strokeLinejoin="round" {...line} />;
    default:
      return <rect x={f(p[0] - 6)} y={f(p[1] - 8)} width={12} height={16} rx={2} {...line} />;
  }
}

const LEGEND: { k: Kind | ""; label: string; icon: React.ReactNode }[] = [
  { k: "", label: "AI OT", icon: <><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" className="sv" /><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" className="sv" /><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" className="sv" /><rect x="9" y="9" width="4.5" height="4.5" rx="1" className="sv" /></> },
  { k: "room", label: "Room sensors", icon: <circle cx="8" cy="8" r="5" className="sv" /> },
  { k: "power", label: "Power", icon: <rect x="3" y="4" width="10" height="8" rx="1" className="sv" /> },
  { k: "cool", label: "Cooling", icon: <><circle cx="8" cy="8" r="5.5" className="sv" /><path d="M8 3v10M3 8h10" className="sv" /></> },
  { k: "cam", label: "Cameras", icon: <path d="M3 4h10L8 12z" className="sv" /> },
  { k: "access", label: "Access control", icon: <><rect x="4" y="2" width="8" height="12" className="sv" /><circle cx="10" cy="8" r="1" fill="#17160F" /></> },
  { k: "fire", label: "Fire and energy", icon: <path d="M8 2.5l5 2.9v5.2l-5 2.9-5-2.9V5.4z" className="sv" /> },
  { k: "mach", label: "Machines", icon: <path d="M8 2l5.5 3v6L8 14l-5.5-3V5z M8 8l5.5-3M8 8v6M8 8L2.5 5" className="sv" /> },
];

// the cabinet's name: a bordered pill on a short leader
const AN = iso(o, 2.5, 0.9, 2.7), LX = AN[0] + 16, LY = AN[1] - 17;
const CAB_LABEL = "Locked cabinet · 12U";

export default function PremisesFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [filter, setFilter] = useState<Kind | null>(null);
  const pick = useCallback((k: Kind | "" | null) => setFilter((cur) => (!k || cur === k ? null : k)), []);

  // one orchestrated moment, then always moving: runs draw out from the cabinet, pulses keep travelling them
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const runs = [...svg.querySelectorAll<SVGPathElement>("path.run:not(.pulse)")];
    const pulses = [...svg.querySelectorAll<SVGPathElement>("path.run.pulse")];
    const devs = [...svg.querySelectorAll<SVGGElement>("g.dev")];
    const anims: Animation[] = [];
    const loops: Animation[] = [];
    ITEMS.forEach((it, i) => {
      const rp = runs[i], gd = devs[i], pp = pulses[i];
      const delay = 300 + it.dist * 70;
      if (!reduce && rp) {
        const L = rp.getTotalLength();
        rp.style.strokeDasharray = `${L}`;
        rp.style.strokeDashoffset = `${L}`;
        anims.push(rp.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 650, delay, easing: "cubic-bezier(.2,0,0,1)", fill: "forwards" }));
        gd.style.opacity = "0";
        const fade = gd.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: delay + 560, fill: "forwards" });
        // once shown, hand opacity back to the stylesheet so the legend filter can dim it
        fade.onfinish = () => { gd.style.opacity = ""; fade.cancel(); };
        anims.push(fade);
      }
      const L = pp?.getTotalLength() ?? 0;
      if (!pp || !L) return;
      const seg = 10;
      pp.style.strokeDasharray = `${seg} ${L + seg}`;
      pp.style.strokeDashoffset = `${seg}`;
      if (reduce) { pp.style.display = "none"; return; }
      loops.push(pp.animate([{ strokeDashoffset: seg }, { strokeDashoffset: -L }], {
        duration: 700 + L * 9, delay: delay + 650 + (i % 5) * 380, endDelay: 900 + ((i * 617) % 1600),
        iterations: Infinity, easing: "cubic-bezier(.4,0,.6,1)",
      }));
    });
    const io = new IntersectionObserver(([e]) => loops.forEach((a) => (e.isIntersecting ? a.play() : a.pause())));
    io.observe(svg);
    return () => { io.disconnect(); [...anims, ...loops].forEach((a) => a.cancel()); };
  }, []);

  // Esc brings the whole room back
  useEffect(() => {
    if (!filter) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFilter(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filter]);

  const hit = (k: Kind) => (filter === k ? " hit" : "");

  return (
    <figure className="relative lg:col-span-7" aria-labelledby="iso-cap">
      <div className="mod relative overflow-hidden">
        {/* below xl the legend sits under the drawing, so the frame crops to the room; CSS only, no layout shift */}
        <div className="relative aspect-[584/418] overflow-hidden xl:aspect-[760/540]">
          <svg
            ref={svgRef}
            id="premises"
            className={"absolute left-[-30.137%] top-[-3.349%] block w-[130.137%] xl:left-0 xl:top-0 xl:w-full" + (filter ? " dim" : "")}
            viewBox="0 0 760 540"
            role="img"
            aria-labelledby="iso-t"
            onClick={() => filter && setFilter(null)}
          >
            <title id="iso-t">Isometric premises: one locked cabinet in a back-of-house IT closet, with room sensors, power, cooling, cameras, access control, fire and energy devices and machines distributed through the building and wired back to it.</title>
            <g>
              {/* floor, the IT closet's zone, and a faint module grid */}
              <polygon points={pts(o, FLOOR)} fill="#FFFFFE" {...edge} />
              <polygon points={pts(o, [[4.2, 0], [4.2, 3.6], [0, 3.6], ...CORNER])} fill="#FFFBEA" stroke="none" />
              {Array.from({ length: W / 2 - 1 }, (_, n) => (n + 1) * 2).map((i) => <line key={"x" + i} {...gridLine([i, 0], [i, D])} stroke="#ECEAE2" />)}
              {Array.from({ length: D / 2 - 1 }, (_, n) => (n + 1) * 2).map((j) => <line key={"y" + j} {...gridLine([0, j], [W, j])} stroke="#ECEAE2" />)}
              <polyline points={pts(o, [[0, 3.6], [4.2, 3.6], [4.2, 0]])} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="4 4" />
              {/* cutaway walls: left and back faces joined by a curved corner, shaded between the two, then one outline */}
              <polygon points={pts(o, [...at([[0, R], [0, D - R]], 0), ...at([[0, D - R], [0, R]], H)])} fill="#E9E7DF" stroke="none" />
              <polygon points={pts(o, [...at([[R, 0], [W - R, 0]], 0), ...at([[W - R, 0], [R, 0]], H)])} fill="#F2F1EC" stroke="none" />
              {CORNER.slice(0, -1).map((c, i) => {
                const n = CORNER[i + 1], tone = mix((i + 0.5) / (CORNER.length - 1));
                return <polygon key={i} points={pts(o, [[c[0], c[1], 0], [n[0], n[1], 0], [n[0], n[1], H], [c[0], c[1], H]])} fill={tone} stroke={tone} strokeWidth={0.6} strokeLinejoin="round" />;
              })}
              <polygon points={pts(o, [...at(WALL_RUN, 0), ...at([...WALL_RUN].reverse(), H)])} fill="none" {...edge} />
              {/* thickness: the two cut ends, then the cap following the curve */}
              <polygon points={pts(o, [[W - R, -T, 0], [W - R, 0, 0], [W - R, 0, H], [W - R, -T, H]])} fill="#FFFFFE" {...edge} />
              <polygon points={pts(o, [[-T, D - R, 0], [0, D - R, 0], [0, D - R, H], [-T, D - R, H]])} fill="#FFFFFE" {...edge} />
              <polygon points={pts(o, [...at(WALL_RUN, H), ...at([[W - R, -T], ...arc(R, R, R + T, 270, 180), [-T, D - R]], H)])} fill="#FFFFFE" {...edge} />
            </g>
            <g>{ITEMS.map((it, i) => <path key={i} d={it.path} className={"run" + hit(it.k)} data-k={it.k} />)}</g>
            <g>{ITEMS.map((it, i) => <path key={i} d={it.path} className={"run pulse" + hit(it.k)} data-k={it.k} />)}</g>
            <g>
              <g><IsoBox o={o} at={[1.2, 0.9, 0]} size={[1.3, 1.3, 2.7]} tones={["#5577BC", "#3A5A9C", "#6A8BCB"]} edge="#F2C200" /></g>
              {ITEMS.map((it, i) => (
                <g key={i} className={"dev" + hit(it.k)} data-k={it.k}><Glyph d={it} /></g>
              ))}
            </g>
            <g className="cab-tag">
              <path d={`M${f(AN[0] + 2)} ${f(AN[1])}L${f(LX - 4)} ${f(LY)}H${f(LX)}`} fill="none" stroke={INK} strokeWidth={1} />
              <circle cx={f(AN[0] + 2)} cy={f(AN[1])} r={2.2} fill={INK} />
              <rect x={f(LX)} y={f(LY - 14)} width={f(CAB_LABEL.length * 7.1 + 40)} height={28} rx={14} fill="#FFFFFE" stroke={INK} strokeWidth={1} />
              <circle cx={f(LX + 15)} cy={f(LY)} r={3.5} fill="#F2C200" />
              <text x={f(LX + 26)} y={f(LY + 4.5)} className="svb">{CAB_LABEL}</text>
            </g>
          </svg>
        </div>
        {/* legend = AI OT column, doubles as a filter; AI OT shows the whole room */}
        <div className="float m-3 rounded-in border border-line bg-surface p-1.5 xl:absolute xl:bottom-4 xl:left-4 xl:m-0 xl:w-[316px]">
          <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted">AI OT — runs the infrastructure</p>
          <div className="grid grid-cols-2 gap-0.5" role="group" aria-label="AI OT">
            {LEGEND.map((l) => (
              <button key={l.k || "all"} type="button" className="lg" aria-pressed={(filter ?? "") === l.k} onClick={() => pick(l.k)}>
                <svg width="16" height="16" aria-hidden="true">{l.icon}</svg>
                <span><b className="font-medium">{l.label}</b></span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <figcaption id="iso-cap" className="mt-3 max-w-xl text-sm text-muted">
        The operational layer spans both, because the sensors and actuators the AI acts on are distributed through the premises, not confined to the cabinet.
      </figcaption>
    </figure>
  );
}
