#!/usr/bin/env python3
"""Converts the four pages of design/aixaiot-v5-studio.html into JSX bodies for the Next.js app.

Every text node is carried over unchanged (copy rule: verbatim from the prototype).
Interactive parts are swapped for client components, internal hash links become
routes, <img> becomes next/image. Output: src/app/_pages/<page>.generated.tsx

Run from web/:  python3 scripts/convert-v5.py
"""
import html.parser
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "design" / "aixaiot-v5-studio.html"
OUT = ROOT / "src" / "app" / "_pages"

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
BLOCK = {"div", "section", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "figure", "figcaption", "article",
         "table", "thead", "tbody", "tr", "td", "th", "dl", "dt", "dd", "header", "footer", "nav", "details", "summary",
         "aside", "main", "br", "svg", "img", "video", "source", "blockquote", "hr"}
SVG_TAGS = {"svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "text", "tspan", "title",
            "animate", "animatemotion", "mpath", "defs", "use", "clippath"}
TAG_CASE = {"animatemotion": "animateMotion", "clippath": "clipPath"}
ATTR_CASE = {"viewbox": "viewBox", "attributename": "attributeName", "calcmode": "calcMode", "keypoints": "keyPoints",
             "keytimes": "keyTimes", "repeatcount": "repeatCount", "class": "className", "for": "htmlFor",
             "tabindex": "tabIndex", "colspan": "colSpan", "rowspan": "rowSpan", "playsinline": "playsInline",
             "srcset": "srcSet", "crossorigin": "crossOrigin", "datetime": "dateTime"}
ROUTES = {"#overview": "/", "#framework": "/framework", "#domains": "/domains", "#examples": "/examples",
          "#method": "/examples#method"}


class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []


class Builder(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def camel(name):
    return re.sub(r"-([a-z])", lambda m: m.group(1).upper(), name)


def style_obj(css):
    parts = []
    for decl in filter(None, (d.strip() for d in css.split(";"))):
        k, v = (x.strip() for x in decl.split(":", 1))
        parts.append(f"{camel(k)}: {js_str(v)}")
    return "{{ " + ", ".join(parts) + " }}"


def js_str(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def text_jsx(t):
    t = re.sub(r"\s+", " ", t)
    out = []
    for ch in t:
        out.append({"{": '{"{"}', "}": '{"}"}', "<": '{"<"}', ">": '{">"}'}.get(ch, ch))
    s = "".join(out)
    if s.startswith(" "):
        s = '{" "}' + s[1:]
    if s.endswith(" ") and len(s) > 1:
        s = s[:-1] + '{" "}'
    return s


def is_block(n):
    return isinstance(n, Node) and n.tag in BLOCK


class Emitter:
    def __init__(self):
        self.imports = set()

    def attrs(self, n, in_svg):
        out = []
        for k, v in n.attrs.items():
            if k == "style":
                out.append(f"style={style_obj(v)}")
                continue
            name = ATTR_CASE.get(k, k)
            if in_svg and "-" in name and not name.startswith(("aria-", "data-")):
                name = camel(name)
            if v is None:
                out.append(name)
            else:
                out.append(f"{name}={js_str(v)}")
        return (" " + " ".join(out)) if out else ""

    def children(self, n, depth, in_svg):
        kids = n.children
        parts = []
        for i, c in enumerate(kids):
            if isinstance(c, str):
                if not c.strip():
                    prev = kids[i - 1] if i else None
                    nxt = kids[i + 1] if i + 1 < len(kids) else None
                    if in_svg or prev is None or nxt is None or is_block(prev) or is_block(nxt) or "\n" in c and (is_block(prev) or is_block(nxt)):
                        continue
                    parts.append('{" "}')
                else:
                    parts.append(text_jsx(c))
            else:
                if isinstance(c, Node) and c.tag == "#comment":
                    continue
                parts.append(self.node(c, depth + 1, in_svg))
        return parts

    def node(self, n, depth, in_svg=False):
        pad = "  " * depth
        a = n.attrs
        # ---- swaps for interactive parts ----
        if n.tag == "figure" and a.get("aria-labelledby") == "iso-cap":
            self.imports.add("PremisesFigure")
            return f"{pad}<PremisesFigure />"
        if n.tag == "div" and any(isinstance(c, Node) and c.tag == "div" and any(isinstance(g, Node) and g.attrs.get("id") == "slabs" for g in c.children) for c in n.children):
            self.imports.add("StackExplorer")
            return f"{pad}<StackExplorer />"
        if n.tag == "details" and has_id(n, "ly-all"):
            return ""  # StackExplorer renders the full-text list too
        if n.tag == "video" and "lazyv" in a.get("class", ""):
            self.imports.add("LazyVideo")
            src = next(c.attrs.get("data-src") for c in n.children if isinstance(c, Node) and c.tag == "source")
            return (f'{pad}<LazyVideo className={js_str(a["class"].replace("lazyv ", ""))} '
                    f'poster={js_str("/" + a["poster"])} src={js_str("/" + src)} />')
        if n.tag == "img":
            self.imports.add("Image")
            props = {k: v for k, v in a.items() if k not in ("src", "loading")}
            attrs = " ".join(f"{ATTR_CASE.get(k, k)}={{{v}}}" if k in ("width", "height") else f"{ATTR_CASE.get(k, k)}={js_str(v)}"
                             for k, v in props.items())
            return f'{pad}<Image src={js_str("/" + a["src"])} {attrs} />'
        if n.tag == "Link":
            self.imports.add("Link")
        tag = TAG_CASE.get(n.tag, n.tag)
        svg = in_svg or n.tag == "svg"
        attrs = self.attrs(n, svg)
        if n.tag in VOID:
            return f"{pad}<{tag}{attrs} />"
        kids = self.children(n, depth, svg)
        if not kids:
            return f"{pad}<{tag}{attrs}></{tag}>" if tag != "path" and not svg else f"{pad}<{tag}{attrs} />"
        inline = all(not k.startswith(" ") for k in kids)
        if inline and sum(len(k) for k in kids) < 140:
            return f"{pad}<{tag}{attrs}>{''.join(kids)}</{tag}>"
        body = "\n".join(k if k.startswith(" ") else pad + "  " + k for k in kids)
        return f"{pad}<{tag}{attrs}>\n{body}\n{pad}</{tag}>"


def has_id(n, i):
    if isinstance(n, Node):
        if n.attrs.get("id") == i:
            return True
        return any(has_id(c, i) for c in n.children)
    return False


def fix_links(root):
    """Anchors with internal hash routes keep their children; done in place before emitting."""
    def walk(n):
        for c in n.children:
            if isinstance(c, Node):
                if c.tag == "a" and c.attrs.get("href") in ROUTES:
                    c.tag = "Link"
                    c.attrs["href"] = ROUTES[c.attrs["href"]]
                walk(c)
    walk(root)


IMPORTS = {
    "Link": 'import Link from "next/link";',
    "Image": 'import Image from "next/image";',
    "PremisesFigure": 'import PremisesFigure from "@/components/PremisesFigure";',
    "StackExplorer": 'import StackExplorer from "@/components/StackExplorer";',
    "LazyVideo": 'import LazyVideo from "@/components/LazyVideo";',
    "SmilPause": 'import SmilPause from "@/components/SmilPause";',
}


def main():
    src = SRC.read_text()
    b = Builder()
    b.feed(src)
    pages = {}

    def find(n):
        for c in n.children:
            if isinstance(c, Node):
                if c.tag == "div" and "page" in c.attrs.get("class", "").split() and c.attrs.get("data-page"):
                    pages[c.attrs["data-page"]] = c
                else:
                    find(c)
    find(b.root)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, div in pages.items():
        fix_links(div)
        em = Emitter()
        if has_id(div, "rt-sub"):
            em.imports.add("SmilPause")
        if any(isinstance(c, Node) and c.tag == "a" for c in div.children):
            pass
        body = "\n".join(filter(None, (em.node(c, 2) for c in div.children if isinstance(c, Node))))
        if "Link" in body:
            em.imports.add("Link")
        if "SmilPause" in em.imports:
            body += '\n    <SmilPause ids={["rt-sub", "rt-own"]} />'
        comp = name.capitalize() + "Content"
        out = ("// Generated by scripts/convert-v5.py from aixaiot-v5-studio.html — edit the source or the script, not this file.\n"
               + "\n".join(IMPORTS[i] for i in sorted(em.imports)) + "\n\n"
               + f"export default function {comp}() {{\n  return (\n    <>\n{body}\n    </>\n  );\n}}\n")
        (OUT / f"{name}.generated.tsx").write_text(out)
        print(f"{name}: {len(out)} bytes, imports {sorted(em.imports)}")


if __name__ == "__main__":
    main()
