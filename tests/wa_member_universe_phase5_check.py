"""WAV ARCHIVE · Member Universe Phase 5 · safe regression check (no third-party deps)."""
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'members' / 'universe'
html = ROOT / 'index.html'
assert html.is_file(), 'main index.html missing'

for name in ('member-universe.js', 'member-universe-phase2.js', 'member-universe-phase3.js',
             'member-universe-phase4.js', 'member-universe-phase5.js',
             'member-universe-phase5.css', 'member-universe-phase4-stories.json', 'members.json'):
    assert (BASE / name).is_file(), f'missing {name}'

loader = (BASE / 'member-universe.js').read_text(encoding='utf-8')
for phase in (2, 3, 4, 5):
    assert loader.count(f'WA_MEMBER_UNIVERSE_PHASE{phase}_LOADER') == 1, f'Phase {phase} loader missing or duplicated'

members = json.loads((BASE / 'members.json').read_text(encoding='utf-8'))
stories = json.loads((BASE / 'member-universe-phase4-stories.json').read_text(encoding='utf-8'))
expected = {f'S{x:02}' for x in range(1, 25)}
assert {m['id'] for m in members['members']} == expected and len(members['members']) == 24
assert {m['id'] for m in stories['members']} == expected and len(stories['members']) == 24
for m in members['members']:
    assert isinstance(m.get('units'), list)
    assert all(isinstance(x,str) for x in m['units'])
    page = ROOT / 'members' / m['id'].lower() / 'index.html'
    assert page.is_file(), f'missing {page}'
    content = page.read_text(encoding='utf-8')
    assert f'data-wa-member="{m["id"]}"' in content, m['id']
    assert 'rel="canonical"' in content, m['id']
for m in stories['members']:
    assert isinstance(m.get('sources'), list) and len(m['sources']) >= 2, m['id']
    for s in m['sources']:
        assert s.get('type') in ('official', 'fan', 'archive'), m['id']
    for language in ('ko','en','ja'):
        assert m.get('originalNarrative', {}).get(language), (m['id'], language)

script = (BASE/'member-universe-phase5.js').read_text(encoding='utf-8')
assert 'waMu5Connections' in script and 'waMu5Sources' in script
assert 'member-universe-phase4-stories.json' in script
assert 'member-universe-phase5.css' in script
assert 'badgeReveal' not in script, 'Phase 5 should never alter spoiler handling'

sitemap = ROOT / 'member-universe-sitemap.xml'
assert sitemap.is_file(), 'missing standalone member sitemap'
root = ET.fromstring(sitemap.read_text(encoding='utf-8'))
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = [e.text for e in root.findall('./s:url/s:loc', ns)]
assert len(urls) == 24 and len(set(urls)) == 24
assert set(urls) == {f'https://bbangshion.github.io/wav-archive/members/s{x:02}/' for x in range(1,25)}
print('PASS: 24 independent pages, Phase 1–5 loaders, sources, languages, scoped assets, sitemap')
