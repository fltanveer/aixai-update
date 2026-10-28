#!/usr/bin/env python3
"""Draws the two "Get off their cloud" scenes (subscribed / owned) in the hero's isometric style and writes them
into design/aixaiot-v5-studio.html (the source the converter reads). SMIL animation on a shared clock: 4 s per cloud
round trip, 1 s per on-site loop. Run from web/:  python3 scripts/roundtrip-scenes.py && npm run convert
"""
import math
import pathlib
import re

INK, MUTE, MUTE_T, ACC, PULSE = "#17160F", "#A3A094", "#5D5B52", "#F2C200", "#C99A00"
C, S = math.cos(math.pi / 6), math.sin(math.pi / 6)
W, D, H, R, T, TH = 8, 4, 1.1, 0.6, 0.12, 0.3  # room plan, wall height, corner radius, wall thickness, slab thickness
O = dict(cx=118, cy=74, s=24)  # centred: the floor spans D·C·s left of cx and W·C·s right of it
VB = "0 0 320 232"


def P(x, y, z=0):
    return (O["cx"] + (x - y) * C * O["s"], O["cy"] + (x + y) * S * O["s"] - z * O["s"])


def f(n):
    return f"{n:.1f}"


def pts(arr):
    return " ".join(f"{f(a)},{f(b)}" for a, b in (P(*q) for q in arr))


def arc(x, y, r, a0, a1, n=6):
    return [(x + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), y + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def at(ring, z):
    return [(q[0], q[1], z) for q in ring]


def poly(arr, fill, stroke=INK, sw=1, extra=""):
    return f'<polygon points="{pts(arr)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"{extra}/>'


def box(x, y, z, w, d, h, tones=("#F2F1EC", "#E3E1D8", "#FFFFFE"), stroke=INK, sw=0.9):
    t, l, r = tones
    return (poly([(x, y + d, z), (x + w, y + d, z), (x + w, y + d, z + h), (x, y + d, z + h)], l, stroke, sw)
            + poly([(x + w, y, z), (x + w, y + d, z), (x + w, y + d, z + h), (x + w, y, z + h)], r, stroke, sw)
            + poly([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)], t, stroke, sw))


def anim(attr, values, kt, dur, extra=""):
    return f'<animate attributeName="{attr}" values="{values}" keyTimes="{kt}" dur="{dur}" repeatCount="indefinite"{extra}/>'


def ping(x, y, z, dur, t0, color):
    cx, cy = P(x, y, z)
    kt = f"0;{t0};{min(t0 + 0.12, 0.999):.3f};1"
    return (f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="0" ry="0" fill="none" stroke="{color}" stroke-width="1.3" opacity="0">'
            + anim("rx", "0;0;18;18", kt, dur) + anim("ry", "0;0;9;9", kt, dur) + anim("opacity", "0;.9;0;0", kt, dur) + "</ellipse>")


def room():
    floor = arc(W - R, R, R, -90, 0) + arc(W - R, D - R, R, 0, 90) + arc(R, D - R, R, 90, 180) + arc(R, R, R, 180, 270)
    lo = [P(x, y, -TH) for x, y in floor]
    hi = [P(x, y, 0) for x, y in floor]
    il, ir = min(range(len(hi)), key=lambda i: hi[i][0]), max(range(len(hi)), key=lambda i: hi[i][0])
    s = poly(at(floor, -TH), "#E9E7DF")
    s += f'<line x1="{f(hi[il][0])}" y1="{f(hi[il][1])}" x2="{f(lo[il][0])}" y2="{f(lo[il][1])}" stroke="{INK}" stroke-width="1"/>'
    s += f'<line x1="{f(hi[ir][0])}" y1="{f(hi[ir][1])}" x2="{f(lo[ir][0])}" y2="{f(lo[ir][1])}" stroke="{INK}" stroke-width="1"/>'
    s += poly(at(floor, 0), "#FFFFFE")
    for i in range(1, W):
        a, b = P(i, 0), P(i, D)
        s += f'<line x1="{f(a[0])}" y1="{f(a[1])}" x2="{f(b[0])}" y2="{f(b[1])}" stroke="#ECEAE2" stroke-width="1"/>'
    for j in range(1, D):
        a, b = P(0, j), P(W, j)
        s += f'<line x1="{f(a[0])}" y1="{f(a[1])}" x2="{f(b[0])}" y2="{f(b[1])}" stroke="#ECEAE2" stroke-width="1"/>'
    # low cutaway walls, joined by a curved corner, with a cap
    corner = arc(R, R, R, 180, 270)
    run = [(0, D - R)] + corner + [(W - R, 0)]
    s += poly(at([(0, R), (0, D - R)], 0) + at([(0, D - R), (0, R)], H), "#E9E7DF", "none")
    s += poly(at([(R, 0), (W - R, 0)], 0) + at([(W - R, 0), (R, 0)], H), "#F2F1EC", "none")
    for i in range(len(corner) - 1):
        a, b = corner[i], corner[i + 1]
        tone = "#EEECE6"
        s += poly([(a[0], a[1], 0), (b[0], b[1], 0), (b[0], b[1], H), (a[0], a[1], H)], tone, tone, 0.6)
    s += poly(at(run, 0) + at(run[::-1], H), "none")
    s += poly([(W - R, -T, 0), (W - R, 0, 0), (W - R, 0, H), (W - R, -T, H)], "#FFFFFE")
    s += poly([(-T, D - R, 0), (0, D - R, 0), (0, D - R, H), (-T, D - R, H)], "#FFFFFE")
    s += poly(at(run, H) + at([(W - R, -T)] + arc(R, R, R + T, 270, 180) + [(-T, D - R)], H), "#FFFFFE")
    return s


SENSOR = (0, 2.9, 0.62)   # a room sensor on the left wall
MACH = (5.4, 2.0, 0, 1.2, 1.0, 0.85)  # a machine on the floor


def sensor():
    x, y, z = SENSOR
    cx, cy = P(x, y, z)
    return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="6" fill="#FFFFFE" stroke="{INK}" stroke-width="1.25"/>'


def machine(flash, dur, t0):
    x, y, z, w, d, h = MACH
    s = box(x, y, z, w, d, h)
    kt = f"0;{t0};{min(t0 + 0.04, 0.999):.3f};{min(t0 + 0.14, 0.999):.3f};1"
    s += (poly([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)], flash, INK, 0.9, ' opacity="0"')[:-2]
          + ">" + anim("opacity", "0;0;1;0;0", kt, dur) + "</polygon>")
    return s


def pill(cx, cy, text, w, muted=False, dot=True):
    x = cx - w / 2
    stroke, color = (MUTE, MUTE_T) if muted else (INK, INK)
    s = f'<rect x="{f(x)}" y="{f(cy - 12)}" width="{f(w)}" height="24" rx="12" fill="#FFFFFE" stroke="{stroke}" stroke-width="1"/>'
    if dot:
        s += f'<circle cx="{f(x + 14)}" cy="{f(cy)}" r="3.2" fill="{ACC}"/>'
    s += f'<text x="{f(cx + (7 if dot else 0))}" y="{f(cy + 4.2)}" text-anchor="middle" class="svt" style="fill:{color}">{text}</text>'
    return s


def subscribed():
    s = room() + sensor()
    mx, my, mz, mw, md, mh = MACH
    sx, sy = P(*SENSOR)
    tx, ty = P(mx + mw / 2, my + md / 2, mz + mh)
    # their cloud: a server stack off site, floating above and beyond the back wall
    cxw, cyw, czw = 3.6, -2.4, 1.7
    s += box(cxw, cyw, czw, 1.5, 1.0, 0.32, ("#F2F1EC", "#E3E1D8", "#FFFFFE"), MUTE)
    s += box(cxw, cyw, czw + 0.42, 1.5, 1.0, 0.32, ("#F2F1EC", "#E3E1D8", "#FFFFFE"), MUTE)
    top = [(cxw, cyw, czw + 0.74), (cxw + 1.5, cyw, czw + 0.74), (cxw + 1.5, cyw + 1.0, czw + 0.74), (cxw, cyw + 1.0, czw + 0.74)]
    s += poly(top, "#FFF6CC", "none", 1, ' opacity="0"')[:-2] + ">" + anim("opacity", "0;0;1;1;0;0", "0;.38;.42;.58;.62;1", "4s") + "</polygon>"
    bl, br = P(cxw, cyw + 1.0, czw), P(cxw + 1.5, cyw + 1.0, czw)
    cbx, cby = (bl[0] + br[0]) / 2, (bl[1] + br[1]) / 2 + 2
    lab = P(cxw + 0.75, cyw, czw + 0.74)
    s += pill(lab[0] + 6, lab[1] - 20, "their cloud", 92, muted=True, dot=False)
    # the route: up and out of the building to their cloud, a wait, then back down to the machine
    d = (f"M{f(sx)} {f(sy - 6)} C {f(sx)} {f(sy - 70)}, {f(cbx - 70)} {f(cby + 4)}, {f(cbx - 8)} {f(cby)} "
         f"L{f(cbx + 8)} {f(cby)} C {f(cbx + 40)} {f(cby + 6)}, {f(tx + 6)} {f(ty - 40)}, {f(tx)} {f(ty - 2)}")
    s += f'<path id="rt-sub-path" d="{d}" fill="none" stroke="{INK}" stroke-width="1.1" stroke-dasharray="2.5 4.5" stroke-linecap="round" opacity=".7"/>'
    s += machine("#FFF6CC", "4s", 0.94)
    motion = '<animateMotion dur="4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;.46;.54;1" keyTimes="0;.38;.62;.94"><mpath href="#rt-sub-path"/></animateMotion>'
    hide = anim("opacity", "{a};{a};0;0", "0;.94;.95;1", "4s")
    for i, (r, a) in enumerate([(2.4, ".25"), (3, ".5"), (4, "1")]):
        lag = (2 - i) * 0.07
        s += (f'<circle r="{r}" fill="{MUTE_T}" opacity="{a}">'
              + motion.replace('dur="4s"', f'dur="4s" begin="-{4 - lag:.2f}s"' if lag else 'dur="4s"')
              + hide.format(a=a) + "</circle>")
    s += ping(mx + mw / 2, my + md / 2, mz + mh, "4s", 0.94, INK)
    return s


def owned():
    s = room()
    mx, my, mz, mw, md, mh = MACH
    nx, ny, nw, nd, nh = 0.55, 0.55, 0.95, 0.95, 1.75  # the AI node, in the closet corner
    sx, sy, sz = SENSOR
    route = [(sx, sy, sz - 0.1), (sx, sy, 0), (0.95, sy, 0), (0.95, ny + nd, 0)]
    route2 = [(nx + nw, 1.0, 0), (mx + mw / 2, 1.0, 0), (mx + mw / 2, my, 0)]
    for r in (route, route2):
        s += f'<path d="M{" L".join(" ".join(f(v) for v in P(*q)) for q in r)}" fill="none" stroke="{ACC}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    full = route + route2
    s += f'<path id="rt-own-path" d="M{" L".join(" ".join(f(v) for v in P(*q)) for q in full)}" fill="none" stroke="none"/>'
    s += sensor()
    s += f'<circle r="3.4" fill="{PULSE}"><animateMotion dur="1s" repeatCount="indefinite" calcMode="linear" keyPoints="0;.36;.44;1" keyTimes="0;.3;.48;.86"><mpath href="#rt-own-path"/></animateMotion>' + anim("opacity", "1;1;0;0;1;1;0;0", "0;.3;.31;.47;.48;.86;.87;1", "1s") + "</circle>"
    s += box(nx, ny, 0, nw, nd, nh, ("#5577BC", "#3A5A9C", "#6A8BCB"))
    e1, e2 = P(nx, ny + nd, nh), P(nx + nw, ny + nd, nh)
    s += f'<line x1="{f(e1[0])}" y1="{f(e1[1])}" x2="{f(e2[0])}" y2="{f(e2[1])}" stroke="{ACC}" stroke-width="3" stroke-linecap="round"/>'
    top = [(nx, ny, nh), (nx + nw, ny, nh), (nx + nw, ny + nd, nh), (nx, ny + nd, nh)]
    s += poly(top, ACC, INK, 0.9, ' opacity="0"')[:-2] + ">" + anim("opacity", "0;0;.9;0;0", "0;.3;.36;.48;1", "1s") + "</polygon>"
    s += machine(ACC, "1s", 0.86)
    s += ping(mx + mw / 2, my + md / 2, mz + mh, "1s", 0.86, PULSE)
    # AI node: a bordered pill on a short leader, like the cabinet in the hero
    an = P(nx + nw, ny, nh)
    lx, ly = an[0] + 22, an[1] - 18
    s += f'<path d="M{f(an[0] + 1)} {f(an[1])}L{f(lx - 4)} {f(ly)}H{f(lx)}" fill="none" stroke="{INK}" stroke-width="1"/>'
    s += f'<circle cx="{f(an[0] + 1)}" cy="{f(an[1])}" r="2" fill="{INK}"/>'
    s += pill(lx + 41, ly, "AI node", 82)
    return s


def main():
    src = pathlib.Path(__file__).resolve().parents[1] / "design" / "aixaiot-v5-studio.html"
    html = src.read_text()
    for sid, body in (("rt-sub", subscribed()), ("rt-own", owned())):
        m = re.search(rf'(<svg id="{sid}" )viewBox="[^"]*"([^>]*>)(<title[^<]*</title>)(.*?)(</svg>)', html, re.S)
        assert m, sid
        html = html[:m.start()] + m.group(1) + f'viewBox="{VB}"' + m.group(2) + m.group(3) + "\n            " + body + "\n          " + m.group(5) + html[m.end():]
    src.write_text(html)
    print("scenes written into", src.name)


if __name__ == "__main__":
    main()
