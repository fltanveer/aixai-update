"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import IsoBox from "@/components/IsoBox";
import { f, iso, type Origin } from "@/lib/iso";

/** The extended stack: ten isometric slabs, L7 at the top to G2 at the bottom; select one to read it. */
export const LAYERS: [string, string, string][] = [
  ["L7", "Application", "Operational semantics. ONVIF for imaging, BACnet and Modbus for building and process equipment, OSDP for access control, MQTT and HTTP for telemetry and transactions."],
  ["L6", "Presentation", "Encoding and encryption — TLS, JSON, XML."],
  ["L5", "Session", "Session establishment and synchronisation — RTP and RTCP state for media, SOAP envelopes for web services."],
  ["L4", "Transport", "End-to-end delivery — TCP, UDP, QUIC."],
  ["L3", "Network", "Addressing and routing — IPv4, IPv6."],
  ["L2", "Data link", "Frame delivery on the link. Ethernet MAC per IEEE 802.3; PLCA at the Reconciliation Sublayer per IEEE 802.3cg Clause 148 on multidrop segments."],
  ["L1", "Physical", "Signalling on the medium — the IEEE 802.3 PHY. 10BASE-T1L and 10BASE-T1S per IEEE 802.3cg-2019; 10BASE-T1M and the mixing segment per IEEE 802.3da."],
  ["L0", "Media", "The transmission medium itself — balanced twisted-pair cabling, including installed two-conductor cabling qualified by field test rather than by category rating. ANSI/TIA-568 series; ANSI/TIA-568.5 and ANSI/TIA-5071 for single-pair cabling and its field qualification."],
  ["G1", "Pathways and Spaces", "Conduit, cable tray, raceway, riser and equipment space. Determines whether a new run is physically possible and at what cost. ANSI/TIA-569; ANSI/TIA-942 for the data center spaces themselves."],
  ["G2", "Power", "Power delivered over the data pair, classified per node and budgeted across the segment, through to fault-managed power and conventional mains at the top end. IEEE 802.3 power clauses — PoDL, PoE, MPoE — and UL 1400 for fault-managed power."],
];

const o: Origin = { cx: 420, cy: 392, s: 21 };
const GAP = 1.75;
const ot = (i: number) => i >= 7; // L0, G1, G2: what operational technology depends on

// slab tones: top, left face, right face
const NET = ["#FFFFFE", "#E9E7DF", "#F4F3EE"] as [string, string, string];
const NET_ON = ["#FFFFFE", "#DCD9CE", "#ECEAE2"] as [string, string, string];
const OT = ["#FFF6CC", "#EADB95", "#FBF1C4"] as [string, string, string];
const OT_ON = ["#FFE680", "#D9B931", "#F5DA63"] as [string, string, string];

const DWELL = 4000; // ms on each layer while it plays by itself
const RESUME = 10000; // ms after the last interaction before it plays again

export default function StackExplorer() {
  const [sel, setSel] = useState(7);
  const [hover, setHover] = useState<number | null>(null);
  // autoplay: steps through the layers on its own; any interaction takes over, and it resumes after a quiet spell
  const [auto, setAuto] = useState(true);
  const [held, setHeld] = useState(false); // pointer over the section, or focus inside it
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playing = auto && !held && inView;

  const takeOver = useCallback(() => {
    setAuto(false);
    clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setAuto(true), RESUME);
  }, []);
  const choose = useCallback((i: number) => { setSel(i); takeOver(); }, [takeOver]);
  const step = useCallback((d: number) => { setSel((s) => Math.min(LAYERS.length - 1, Math.max(0, s + d))); takeOver(); }, [takeOver]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setAuto(false); return; }
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(resumeRef.current); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setSel((s) => (s + 1) % LAYERS.length), DWELL);
    return () => clearTimeout(t);
  }, [playing, sel]);
  const order = LAYERS.map((_, i) => LAYERS.length - 1 - i); // draw bottom (G2) first
  const [code, name, body] = LAYERS[sel];

  /** Layers above the selected one rise to open a gap; the selected one lifts a little. */
  const lift = (i: number) => (i < sel ? -46 : i === sel ? -16 : 0) + (hover === i && i !== sel ? -5 : 0);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); step(1); }
  };

  return (
    <>
      <div
        ref={rootRef}
        className="mt-12 grid gap-4 lg:grid-cols-12"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
      >
        <div className="mod overflow-hidden p-4 lg:col-span-7">
          <svg className="block w-full" viewBox="0 -10 640 620" role="img" aria-label="Ten layers, L7 at the top to G2 at the bottom; select one to read it." onKeyDown={onKey}>
            {order.map((i) => {
              const z = (LAYERS.length - 1 - i) * GAP;
              const a = iso(o, 0, 9, z + 0.2);
              const on = sel === i;
              return (
                <g
                  key={i}
                  className="slab"
                  tabIndex={0}
                  role="button"
                  aria-label={LAYERS[i][0] + " " + LAYERS[i][1]}
                  aria-pressed={on}
                  onClick={() => choose(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), choose(i))}
                  style={{ opacity: on ? 1 : hover === i ? 0.9 : 0.62, transform: `translateY(${lift(i)}px)`, transition: "opacity .3s, transform .55s cubic-bezier(.16,1,.3,1)" }}
                >
                  <IsoBox o={o} at={[0, 0, z]} size={[9, 9, 0.45]} tones={ot(i) ? (on ? OT_ON : OT) : on ? NET_ON : NET} edge={on ? "#F2C200" : ot(i) ? "#C9A21A" : undefined} />
                  <line x1={f(a[0] - 4)} y1={f(a[1])} x2={f(a[0] - (on ? 44 : 34))} y2={f(a[1])} stroke={on ? "#17160F" : "#A3A094"} strokeWidth={1} style={{ transition: "all .3s" }} />
                  {on && <circle cx={f(a[0] - 48)} cy={f(a[1])} r={4} fill="#F2C200" stroke="#17160F" strokeWidth={1} />}
                  {/* phones: the code alone, large enough to read; the name is in the panel */}
                  <text x={f(a[0] - (on ? 58 : 40))} y={f(a[1] + 4)} textAnchor="end" className="svm hidden sm:block" style={{ fill: on ? "#17160F" : "#5D5B52", fontWeight: on ? 600 : 500, fontSize: on ? 13 : 12 }}>{LAYERS[i][0] + "  " + LAYERS[i][1]}</text>
                  <text x={f(a[0] - (on ? 58 : 40))} y={f(a[1] + 9)} textAnchor="end" className="svm sm:hidden" style={{ fontSize: 28, fill: on ? "#17160F" : "#5D5B52" }}>{LAYERS[i][0]}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mod flex flex-col p-6 md:p-8 lg:col-span-5" onKeyDown={onKey}>
          <div className="flex items-start justify-between gap-4">
            <p key={sel} className="stack-fade id flex items-center gap-3 text-5xl leading-none">
              <span className={"h-3 w-3 rounded-full " + (ot(sel) ? "bg-acc" : "border-2 border-ink")} aria-hidden="true" />
              {code}
            </p>
            <div className="flex gap-2">
              <button type="button" className="stack-arrow" aria-label={sel > 0 ? `${LAYERS[sel - 1][0]} ${LAYERS[sel - 1][1]}` : undefined} disabled={sel === 0} onClick={() => step(-1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="stack-arrow" aria-label={sel < LAYERS.length - 1 ? `${LAYERS[sel + 1][0]} ${LAYERS[sel + 1][1]}` : undefined} disabled={sel === LAYERS.length - 1} onClick={() => step(1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>

          <div key={sel} className="stack-fade mt-6" aria-live="polite">
            <h3 className="d text-3xl md:text-[34px]">{name}</h3>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">{body}</p>
          </div>

          <div className="mt-auto pt-10">
            <ol className="grid grid-cols-5 gap-1.5">
              {LAYERS.map((l, i) => (
                <li key={l[0]}>
                  <button
                    type="button"
                    aria-pressed={sel === i}
                    onClick={() => choose(i)}
                    className={
                      "id relative w-full overflow-hidden rounded-ctl border py-2 text-sm transition-colors duration-200 " +
                      (sel === i ? "border-acc bg-acc text-ink" : ot(i) ? "border-[#E6CF6A] bg-[#FFFBEA] hover:bg-[#FFF6CC]" : "border-line bg-surface hover:bg-s2")
                    }
                  >
                    {l[0]}
                    {sel === i && auto && (
                      <span key={sel} className="stack-progress" style={{ animationDuration: `${DWELL}ms`, animationPlayState: playing ? "running" : "paused" }} aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      {/* full text, always available */}
      <details className="mt-4 rounded-mod border border-line bg-surface px-6 py-4">
        <summary className="cursor-pointer font-medium">The extended stack</summary>
        <dl className="mt-4 divide-y divide-line text-[15px]">
          {LAYERS.map((l) => (
            <div key={l[0]} className="grid gap-1 py-3 md:grid-cols-[60px_200px_1fr]">
              <dt className="id">{l[0]}</dt>
              <dd className="font-medium">{l[1]}</dd>
              <dd className="text-muted">{l[2]}</dd>
            </div>
          ))}
        </dl>
      </details>
    </>
  );
}
