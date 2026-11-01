#!/usr/bin/env python3
"""WAV ARCHIVE MEMBER UNIVERSE — source-only regression guard (stdlib)."""
import json,re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
folder=root/'members'
blob=json.loads((folder/'universe/members.json').read_text('utf-8'))
items=blob.get('members',[])
assert len(items)==24, f'Expected 24 records, got {len(items)}'
assert {m['id'] for m in items}=={f'S{x:02d}' for x in range(1,25)}
for item in items:
    ident=item['id']; page=folder/ident.lower()/'index.html'
    assert page.is_file(),f'Missing route: {page}'
    html=page.read_text('utf-8')
    for term in [f'data-wa-member="{ident}"','member-universe.js','member-universe.css',f'<title>{item["ko"]}']:
        assert term in html,(ident,term)
    assert item['birthday'] and re.fullmatch(r'\d{4}-\d{2}-\d{2}',item['birthday']),ident
    assert item['units'] and isinstance(item['history'],list) and item['history'],ident
    assert f'/{ident.lower()}/' in html,ident
    assert (root/item['photo']).exists(),f'Photo missing for {ident}: {item["photo"]}'
assert (folder/'universe/member-universe.js').is_file()
assert (folder/'universe/member-universe.css').is_file()
bridge=(root/'wav-member-view-360-3-2.js').read_text('utf-8')
assert '멤버 독립 아카이브' in bridge and "'./members/'+data.id.toLowerCase()+'/'" in bridge
assert 'wa_member_card_view_21' in bridge and 'window.WAVMember360' in bridge
assert '배지전쟁 기록 ↗' in bridge, 'Badge War Phase 4 connection missing'
assert 'index.html' not in [p.name for p in (folder/'universe').iterdir()]
for script in [folder/'universe/member-universe.js',root/'wav-member-view-360-3-2.js']:
    result=subprocess.run(['node','--check',str(script)],capture_output=True,text=True)
    assert result.returncode==0,result.stderr
print('PASS: 24 routes, source data, photos, original card engine, Badge War link, JS syntax')
