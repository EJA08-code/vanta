#!/usr/bin/env python3
"""Joins src/ into the single-file app: vanta.html."""
import base64, pathlib, re
root = pathlib.Path(__file__).resolve().parent
css = (root / "styles.css").read_text(encoding="utf-8")
engine = (root / "engine.js").read_text(encoding="utf-8")
notion = (root / "notion.js").read_text(encoding="utf-8")
ui = (root / "ui.js").read_text(encoding="utf-8")
icon = base64.b64encode((root.parent / "assets" / "favicon.svg").read_bytes()).decode()
paths = re.findall(r'<path d="([^"]+)"', (root.parent / "assets" / "logo-white.svg").read_text())
assert len(paths) == 2
VB = 'viewBox="325 317 603 596" fill="currentColor"'
BOTH = f'<path d="{paths[0]}"/><path d="{paths[1]}"/>'
SPLASH = (
    '<div id="splash" aria-hidden="true"><div class="door a"></div><div class="door b"></div>'
    f'<div class="logo-group"><div class="mark"><svg class="dim" {VB}>{BOTH}</svg><svg class="wide" {VB}>{BOTH}</svg><svg class="tight" {VB}>{BOTH}</svg><svg class="lit" {VB}>{BOTH}</svg></div><div class="name">Vanta</div></div>'
    f'<div class="pieces"><div class="piece a"><svg {VB}><path d="{paths[0]}"/></svg></div><div class="piece b"><svg {VB}><path d="{paths[1]}"/></svg></div></div></div>'
)
# Applies the saved theme and accent before the first paint, and can never leave the app stuck behind the splash.
EARLY = """<script>(function(){var r=document.documentElement;try{var l=JSON.parse(localStorage.getItem('vanta-look')||'{}');if(l.t)r.dataset.theme=l.t;if(l.a)r.style.setProperty('--accent',l.a)}catch(e){}setTimeout(function(){r.classList.remove('boot','opening')},9000)})()</script>"""
html = f"""<!doctype html>
<html lang="en" data-theme="dark" class="boot">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark light">
<title>Vanta</title>
{EARLY}
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,{icon}">
<style>
{css}</style>
</head>
<body>
<div class="app">
  <nav class="side" id="nav" aria-label="Main"></nav>
  <main id="main"></main>
</div>
<nav class="tabs" id="tabs" aria-label="Main"></nav>
<div id="modalRoot"></div>
{SPLASH}
<script>
'use strict';
{engine}
{notion}
{ui}</script>
</body>
</html>
"""
(root.parent / "vanta.html").write_text(html, encoding="utf-8")
print("built vanta.html", len(html), "bytes")
