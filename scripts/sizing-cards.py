#!/usr/bin/env python3
"""Draws the four "What the sizing produced" card graphics (compute, utilization, floor area, deployment)
as animated SVG and writes them into design/aixaiot-v5-studio.html. SMIL only, so they render on the server.
Run from web/:  python3 scripts/sizing-cards.py && npm run convert
"""
import math
import pathlib
import re

INK, MUTE, LINE, ACC, ACC2, PULSE, OK = "#17160F", "#A3A094", "#E3E1D8", "#F2C200", "#FFF6CC", "#C99A00", "#4CC27E"
f = lambda n: f"{n:.1f}"


def anim(attr, values, dur, kt=None, begin=None, extra=""):
    k = f' keyTimes="{kt}"' if kt else ""
    b = f' begin="{begin}"' if begin else ""
    return f'<animate attributeName="{attr}" values="{values}"{k} dur="{dur}"{b} repeatCount="indefinite"{extra}/>'


def spin(cx, cy, dur):
    return f'<animateTransform attributeName="transform" type="rotate" from="0 {f(cx)} {f(cy)}" to="360 {f(cx)} {f(cy)}" dur="{dur}" repeatCount="indefinite"/>'


def fan(cx, cy, r, live):
    blades = "".join(
        f'<path d="M{f(cx)} {f(cy)} Q {f(cx + r * .9 * math.cos(a + .9))} {f(cy + r * .9 * math.sin(a + .9))} {f(cx + r * .82 * math.cos(a + .35))} {f(cy + r * .82 * math.sin(a + .35))} Z" fill="{"#8A877D" if live else "none"}" stroke="{"none" if live else INK}" stroke-width="1"/>'
        for a in (i * 2 * math.pi / 5 for i in range(5)))
    dash = "" if live else ' stroke-dasharray="3 3"'
    ring = f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{r}" fill="{"#2A2820" if live else "none"}" stroke="{"#3A372D" if live else INK}" stroke-width="1.2"{dash}/>'
    hub = f'<circle cx="{f(cx)}" cy="{f(cy)}" r="3.4" fill="{ACC if live else "#FFFFFE"}" stroke="{INK if not live else "none"}" stroke-width="1"/>'
    g = f'<g>{blades}{spin(cx, cy, ".8s")}</g>' if live else f"<g>{blades}</g>"
    return ring + g + hub


def compute():
    s = '<svg id="sz-compute" viewBox="0 0 280 96" class="smil-hover mt-4 w-full" aria-hidden="true">'
    # the working accelerator
    s += f'<rect x="6" y="10" width="124" height="66" rx="9" fill="{INK}"/>'
    s += fan(43, 43, 21, True) + fan(98, 43, 21, True)
    s += "".join(f'<rect x="{18 + i * 12}" y="76" width="8" height="8" rx="1.5" fill="{ACC}"/>' for i in range(8))
    s += f'<circle cx="121" cy="18" r="2.6" fill="{OK}">{anim("opacity", "1;.25;1;1;.3;1", ".9s")}</circle>'
    # the spare: specified for redundancy and headroom
    s += f'<rect x="150" y="10" width="124" height="66" rx="9" fill="#FFFFFE" stroke="{INK}" stroke-width="1.2" stroke-dasharray="4 4"/>'
    s += fan(187, 43, 21, False) + fan(242, 43, 21, False)
    s += "".join(f'<rect x="{162 + i * 12}" y="76" width="8" height="8" rx="1.5" fill="none" stroke="{INK}" stroke-width="1"/>' for i in range(8))
    s += f'<circle cx="265" cy="18" r="2.6" fill="{OK}">{anim("opacity", ".25;1;.25", "2.4s")}</circle>'
    return s + "</svg>"


def utilization():
    s = '<svg id="sz-util" viewBox="0 0 280 96" class="smil-hover mt-4 w-full" aria-hidden="true">'
    # full capacity is the frame; a day of hourly load sits low inside it
    s += f'<rect x="4" y="6" width="272" height="76" rx="8" fill="#FBFBF8" stroke="{LINE}" stroke-width="1"/>'
    s += f'<path d="M12 14 H268" stroke="{MUTE}" stroke-width="1" stroke-dasharray="3 4"/>'
    load = [2, 2, 1.5, 1.5, 2, 3, 5, 7, 8, 9, 9.5, 10, 9, 10.5, 11.5, 13, 12, 10, 8, 6, 5, 4, 3, 2.5]
    base = 76
    for i, h in enumerate(load):
        x = 12 + i * 10.6
        peak = h == max(load)
        h2 = h * 1.35
        fill = ACC if peak else "#D6D3C7"
        s += (f'<rect x="{f(x)}" y="{f(base - h)}" width="7.4" height="{f(h)}" rx="1.5" fill="{fill}">'
              + anim("height", f"{f(h)};{f(h2)};{f(h)}", "3.2s", begin=f"-{(i * .13):.2f}s", extra=' calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"')
              + anim("y", f"{f(base - h)};{f(base - h2)};{f(base - h)}", "3.2s", begin=f"-{(i * .13):.2f}s", extra=' calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"')
              + "</rect>")
    s += f'<path d="M12 {base + .5} H268" stroke="{INK}" stroke-width="1"/>'
    # a playhead walks the day
    s += (f'<g><path d="M0 14 V{base}" stroke="{INK}" stroke-width="1" opacity=".35"/><circle cx="0" cy="{base}" r="2.6" fill="{INK}"/>'
          f'<animateTransform attributeName="transform" type="translate" values="12 0;266 0" dur="7s" repeatCount="indefinite"/></g>')
    return s + "</svg>"


def floor():
    C, S = math.cos(math.pi / 6), math.sin(math.pi / 6)
    # fitted to the 280 × 96 box: cabinet top at y≈7, floor front corner at y≈90, centred on x=140
    o = dict(cx=128, cy=35, s=11.5)
    P = lambda x, y, z=0: (o["cx"] + (x - y) * C * o["s"], o["cy"] + (x + y) * S * o["s"] - z * o["s"])
    pts = lambda arr: " ".join(f"{f(a)},{f(b)}" for a, b in (P(*q) for q in arr))
    s = '<svg id="sz-floor" viewBox="0 0 280 96" class="smil-hover mt-4 w-full" aria-hidden="true">'
    W, D, H = 6, 3.6, 1.4
    s += f'<polygon points="{pts([(0, 0), (W, 0), (W, D), (0, D)])}" fill="#FFFFFE" stroke="{INK}" stroke-width="1" stroke-linejoin="round"/>'
    s += f'<polygon points="{pts([(0, 0, 0), (W, 0, 0), (W, 0, H), (0, 0, H)])}" fill="#F2F1EC" stroke="{INK}" stroke-width="1" stroke-linejoin="round"/>'
    s += f'<polygon points="{pts([(0, 0, 0), (0, D, 0), (0, D, H), (0, 0, H)])}" fill="#E9E7DF" stroke="{INK}" stroke-width="1" stroke-linejoin="round"/>'
    # the closet's spare floor, its boundary marching
    s += (f'<polygon points="{pts([(0.3, 0.3), (3.0, 0.3), (3.0, 2.7), (0.3, 2.7)])}" fill="{ACC2}" stroke="{INK}" stroke-width="1" stroke-dasharray="3 3">'
          + anim("stroke-dashoffset", "0;-12", "1.2s") + "</polygon>")
    # the cabinet's footprint, about five square feet
    s += (f'<polygon points="{pts([(0.6, 0.6), (1.9, 0.6), (1.9, 1.9), (0.6, 1.9)])}" fill="{ACC}" opacity=".5">'
          + anim("opacity", ".25;.75;.25", "2.4s") + "</polygon>")
    x, y, w, d, h = 0.6, 0.6, 1.3, 1.3, 3.0
    s += f'<polygon points="{pts([(x, y + d, 0), (x + w, y + d, 0), (x + w, y + d, h), (x, y + d, h)])}" fill="#3A5A9C" stroke="{INK}" stroke-width=".9" stroke-linejoin="round"/>'
    s += f'<polygon points="{pts([(x + w, y, 0), (x + w, y + d, 0), (x + w, y + d, h), (x + w, y, h)])}" fill="#6A8BCB" stroke="{INK}" stroke-width=".9" stroke-linejoin="round"/>'
    s += f'<polygon points="{pts([(x, y, h), (x + w, y, h), (x + w, y + d, h), (x, y + d, h)])}" fill="#5577BC" stroke="{INK}" stroke-width=".9" stroke-linejoin="round"/>'
    a, b = P(x, y + d, h), P(x + w, y + d, h)
    s += f'<line x1="{f(a[0])}" y1="{f(a[1])}" x2="{f(b[0])}" y2="{f(b[1])}" stroke="{ACC}" stroke-width="2.4" stroke-linecap="round"/>'
    led = P(x + 0.3, y + d, h - 0.5)
    s += f'<circle cx="{f(led[0])}" cy="{f(led[1])}" r="1.7" fill="{OK}">{anim("opacity", "1;.2;1", "1.4s")}</circle>'
    lock = P(x + w - 0.25, y + d, h * 0.5)
    s += f'<rect x="{f(lock[0] - 1.6)}" y="{f(lock[1] - 3)}" width="3.2" height="6" rx="1" fill="{ACC}" stroke="{INK}" stroke-width=".7"/>'
    return s + "</svg>"


def deployment():
    s = '<svg id="sz-deploy" viewBox="0 0 280 96" class="smil-hover mt-4 w-full" aria-hidden="true">'
    xs = [36, 105, 175, 244]
    for k, x in enumerate(xs):
        d = f"M140 30 V48 H{x} V62"
        s += f'<path d="{d}" fill="none" stroke="{ACC}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
    # the node
    s += f'<rect x="118" y="6" width="44" height="24" rx="5" fill="{INK}"/><path d="M121 7.5 H159" stroke="{ACC}" stroke-width="2.4" stroke-linecap="round"/>'
    s += f'<circle cx="153" cy="18" r="2" fill="{OK}">{anim("opacity", "1;.3;1", "1s")}</circle>'
    s += "".join(f'<rect x="{124 + i * 6}" y="15" width="3" height="7" rx="1" fill="#5D5B52"/>' for i in range(4))
    # each office gets its turn: a pulse goes down the branch and its windows light
    dur = 3.2
    for k, x in enumerate(xs):
        begin = f"{k * 0.8}s"
        d = f"M140 30 V48 H{x} V62"
        s += (f'<circle r="3.2" fill="{PULSE}" opacity="0"><animateMotion path="{d}" dur="{dur}s" begin="{begin}" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.32;1" calcMode="linear"/>'
              + anim("opacity", "1;1;0;0", f"{dur}s", "0;.32;.33;1", begin) + "</circle>")
        s += f'<path d="M{x - 17} 70 L{x} 60 L{x + 17} 70 V90 H{x - 17} Z" fill="#FFFFFE" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/>'
        for dx, dy in ((-9, 74), (3, 74), (-9, 82), (3, 82)):
            s += (f'<rect x="{x + dx}" y="{dy}" width="6" height="5" rx="1" fill="#F2F1EC" stroke="{INK}" stroke-width=".8">'
                  + anim("fill", f"#F2F1EC;#F2F1EC;{ACC};{ACC};#F2F1EC", f"{dur}s", "0;.32;.36;.6;.75", begin) + "</rect>")
    return s + "</svg>"


def main():
    src = pathlib.Path(__file__).resolve().parents[1] / "design" / "aixaiot-v5-studio.html"
    html = src.read_text()
    swaps = [
        (r'<div class="mt-4 flex gap-2" aria-hidden="true"><span class="h-12 w-8 rounded-\[6px\] bg-ink"></span><span class="h-12 w-8 rounded-\[6px\] border border-dashed border-ink"></span></div>|<svg id="sz-compute".*?</svg>', compute()),
        (r'<div class="mt-4 h-2 overflow-hidden rounded-full bg-s2" aria-hidden="true"><span class="util[^"]*"></span></div>|<svg id="sz-util".*?</svg>', utilization()),
        (r'<svg viewBox="0 0 120 56" class="mt-4 h-14" aria-hidden="true">.*?</svg>|<svg id="sz-floor".*?</svg>', floor()),
        (r'<svg viewBox="0 0 160 56" class="mt-4 h-14" aria-hidden="true">.*?</svg>|<svg id="sz-deploy".*?</svg>', deployment()),
    ]
    for pat, new in swaps:
        html, n = re.subn(pat, lambda m: new, html, count=1, flags=re.S)
        assert n == 1, pat[:40]
    src.write_text(html)
    print("sizing card graphics written into", src.name)


if __name__ == "__main__":
    main()
