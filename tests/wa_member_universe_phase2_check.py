#!/usr/bin/env python3
"""Read-only checks for additive MEMBER UNIVERSE phase 2."""
import json, pathlib, re, sys
root=pathlib.Path(__file__).resolve().parents[1]
base=root/'members/universe'
need=[base/'member-universe.js',base/'member-universe-phase2.js',base/'member-universe-phase2.css',base/'discography-index.json',base/'members.json']
errors=[]
for path in need:
    if not path.is_file(): errors.append('Missing: '+str(path.relative_to(root)))
if errors: print('\n'.join(errors));sys.exit(1)
loader=(base/'member-universe.js').read_text()
if 'WA_MEMBER_UNIVERSE_PHASE2_LOADER' not in loader:errors.append('Phase 2 shared loader missing')
if 'member-universe-phase2.js' not in loader:errors.append('Add-on script not referenced')
data=json.loads((base/'discography-index.json').read_text())
rows=data.get('albums',[])
if len(rows)!=21:errors.append(f'Expected 21 archive album records; found {len(rows)}')
if len({v.get('id') for v in rows})!=len(rows):errors.append('Duplicate album IDs')
for v in rows:
    if not re.fullmatch(r'wa-record-\d{2}',str(v.get('id'))):errors.append('Invalid album ID: '+str(v.get('id')))
mem=json.loads((base/'members.json').read_text())
entries=mem.get('members',[])
if len(entries)!=24:errors.append(f'Expected 24 members, found {len(entries)}')
for i in range(1,25):
    target=root/f'members/s{i:02d}/index.html'
    if not target.is_file():errors.append(f'Missing {target.relative_to(root)}')
    elif 'member-universe.js' not in target.read_text():errors.append(f'Member page not linked to base JS: s{i:02d}')
if errors:
    print('\n'.join(errors));sys.exit(1)
print(f'OK: {len(entries)} member pages · {len(rows)} album records · additive phase2 loader · original source retained')
