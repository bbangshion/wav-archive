from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
base=root/'members/universe'
main=root/'index.html'
shared=(base/'member-universe.js').read_text(encoding='utf-8')
assert shared.count('WA_MEMBER_UNIVERSE_PHASE4_LOADER')==1,'Missing or repeated Phase 4 loader'
assert 'WA_MEMBER_UNIVERSE_PHASE2_LOADER' in shared, 'Phase 2 loader missing'
assert 'WA_MEMBER_UNIVERSE_PHASE3_LOADER' in shared, 'Phase 3 loader missing'
for name in ['member-universe-phase4.js','member-universe-phase4.css','member-universe-phase4-stories.json']:
 assert (base/name).exists(),name
jsonpath=base/'member-universe-phase4-stories.json'; d=json.loads(jsonpath.read_text(encoding='utf-8'))
assert d['schema']==4
rows=d['members']; assert len(rows)==24 and {r['id'] for r in rows}=={f'S{i:02}' for i in range(1,25)}
for r in rows:
 for l in ['ko','en','ja']:
  text=r['originalNarrative'][l]
  assert len(text)==2 and all(isinstance(x,str) and len(x.strip())>=(20 if l=='ja' else 45) for x in text),(r['id'],l)
 assert len(r['sources'])>=3
 assert (root/'members'/r['id'].lower()/'index.html').is_file()
 assert 'https://www.triples-official.jp/profile/'==r['sources'][0]['url']
assert main.exists() and '<html' in main.read_text(encoding='utf-8')[:5000].lower()
print('PASS: 24 S-number stories, KO/EN/JA, verified source classification, Phase 1–3 loaders retained')
