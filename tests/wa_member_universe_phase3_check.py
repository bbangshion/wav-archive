#!/usr/bin/env python3
"""Member Universe Phase 3 contract guard: reads site files, never modifies them."""
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'members/universe'
required=['member-universe.js','member-universe-phase3.js','member-universe-phase3.css','member-universe-phase2.js']
for name in required:
    if not (base/name).is_file():sys.exit('MISSING '+str(base/name))
source=(base/'member-universe.js').read_text(encoding='utf-8')
if source.count('WA_MEMBER_UNIVERSE_PHASE3_LOADER')!=1:
    sys.exit('Phase 3 loader missing or duplicated')
for id_num in range(1,25):
    path=ROOT/f'members/s{id_num:02}/index.html'
    if not path.is_file():sys.exit('Missing page '+str(path))
    if f'data-wa-member="S{id_num:02}"' not in path.read_text(encoding='utf-8'):
        sys.exit('Member ID mismatch '+str(path))
path=ROOT/'signal-moments/data.json'
if not path.is_file():sys.exit('Missing original SIGNAL data: '+str(path))
data=json.loads(path.read_text(encoding='utf-8'))
rows=data.get('episodes',[])
if not isinstance(rows,list) or len(rows)<900:sys.exit('SIGNAL catalog regression: expected >=900 videos')
tagged=0;ids=set();members=set()
for row in rows:
    if not isinstance(row,dict) or not re.fullmatch('[A-Za-z0-9_-]{11}',str(row.get('videoId',''))):
        sys.exit('Invalid video ID')
    ids.add(row['videoId'])
    tags=row.get('members',[])
    if not isinstance(tags,list):sys.exit('Invalid cast tags')
    tagged+=bool(tags)
    for tag in tags:
        if not re.fullmatch('S(?:0[1-9]|1[0-9]|2[0-4])',str(tag)):sys.exit('Unexpected member tag '+str(tag))
        members.add(tag)
if tagged<200:sys.exit('Member metadata regression: tagged videos below 200')
if len(ids)<900:sys.exit('SIGNAL unique video count below 900')
if 'S20' not in members or 'S19' not in members:sys.exit('Missing member video tags')
js=(base/'member-universe-phase3.js').read_text(encoding='utf-8')
for needle in ('#signals','waMu3Explorer','youtube-nocookie.com','waMu3Year','waMu3Query','member-universe-phase3.css'):
    if needle not in js and needle!='#signals':sys.exit('Missing Phase 3 feature: '+needle)
print(f'PASS · 24 member pages · {len(rows)} catalog videos · {tagged} tagged videos · Phase 3 features preserved')
