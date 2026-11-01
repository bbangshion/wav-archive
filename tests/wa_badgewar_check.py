#!/usr/bin/env python3
"""WAV ARCHIVE Badge War: non-destructive, source and regression checks."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
main=(ROOT/'index.html').read_text(encoding='utf-8')
js=(ROOT/'wa-badge-war-hub.js').read_text(encoding='utf-8')
css=(ROOT/'wa-badge-war-hub.css').read_text(encoding='utf-8')
data=json.loads((ROOT/'data/wa-badgewar-seasons.json').read_text(encoding='utf-8'))
assert main.count('id="badgewar4"')==1, 'Existing badgewar4 anchor removed'
assert 'wa-badge-war-hub.js?v=20261101-bw1' in main
assert 'wa-badge-war-hub.css?v=20261101-bw1' in main
assert 'wa-badgewar-seasons.json' in js
assert 'catch(err=>' in js, 'Legacy fallback removed'
assert '#badgewar4 ' in css, 'Style isolation removed'
seasons=data['seasons']
assert [s['number'] for s in seasons] == [1,2,3,4]
assert [s['members'] for s in seasons] == [16,24,24,23]
assert all(len(s['episodes'])==4 for s in seasons)
expected={
 1:['Yb0GtMc9Axc','tWpMyqOV4F4','u7hlgjKC0Fs','X8Emckj8yVA'],
 2:['aT-Euv1qj8s','aJMTlJUF_Qg','O2yErIi6CGM','F2OiGrCFv3c'],
 3:['7JI5sO3GOwM','BXHHCDxufNM','uMEAOR57SlY','5-T99rLSncg'],
 4:['M2ky7c5kIXo','gTnnzlARDZI','Z78ttVYqg58','7znp7cWwTNs'],
}
for s in seasons:
 assert [x['videoId'] for x in s['episodes']]==expected[s['number']],f'Season {s["number"]} video IDs changed'
 assert [e['number'] for e in s['episodes']]==[1,2,3,4]
 for e in s['episodes']:
  assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',e['date'])
  assert e['source']==f'https://www.youtube.com/watch?v={e["videoId"]}'
  assert all(e['title'].get(l) and e['summary'].get(l) for l in ('ko','en','ja'))
 assert all(s[k].get(l) for k in ('intro','theme','place','gravity') for l in ('ko','en','ja'))
# Protect unrelated HTML sections: do not replace data / member system.
for k in ('id="members"','id="gravity"','id="timeline"','id="discography"','id="badgewar4"'):
 assert k in main, f'Missing core section: {k}'
print('[PASS] Badge War S1–S4, 16 episode links, KO/EN/JA, legacy fallback and core section anchors')
