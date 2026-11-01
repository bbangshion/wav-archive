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

# Phase 2 detail integrity (source-tiered; not a claim of primary verification)
p2=json.loads((ROOT/'data/wa-badgewar-phase2.json').read_text(encoding='utf-8'))
assert p2['schemaVersion']==2
assert len(p2['members'])==24 and {m['id'] for m in p2['members']}=={f'S{i:02d}' for i in range(1,25)}
assert [x['number'] for x in p2['seasons']]==[1,2,3,4]
assert 'wa-badgewar-phase2.json' in js and 'renderPhase2' in js
assert '.wa-bw2__missions' in css and '.wa-bw2__team' in css
assert 'fan_crosscheck' in str(p2['sourcePolicy']) or 'fan archive' in str(p2['sourcePolicy'])
teamsets=0
for season in p2['seasons']:
    assert [ep['number'] for ep in season['episodes']]==[1,2,3,4]
    assert all(season['gravityNotes'].get(l) for l in ('ko','en','ja'))
    for ep in season['episodes']:
        for key in ('title','mechanic'):
            assert all(ep[key].get(l) for l in ('ko','en','ja'))
        assert ep['source']['type']=='fan_crosscheck'
        teams=ep['teams']
        if not teams:continue
        teamsets+=1
        roster=[i for grp in teams for i in grp['members']]
        assert len(roster)==len(set(roster)), f'Duplicate members in S{season["number"]} EP{ep["number"]}'
        assert set(roster)<={f'S{i:02d}' for i in range(1,25)}
        assert len(roster)<=data['seasons'][season['number']-1]['members']
        if season['number']==4: assert 'S08' not in roster
assert teamsets>=9, 'Too few sourced team sets'
assert 'data-bw2-ep' in js and 'data-bw2-member' in js
print(f'[PASS] Phase 2: 16 mission summaries, {teamsets} fan-sourced team sets, valid S01–S24 IDs; core code preserved')

# Phase 3: team-lineup-only data lab (no fabricated badge outcomes)
assert 'renderPhase3(); // Phase 3' in js and 'data-bw3-member' in js
assert 'labSelectedMember' in js and 'wa-bw3__pairs' in js
assert '#badgewar4 .wa-bw3' in css
assert 'Gravity' in js and 'wa-bw2__gravity' in css
assert 'renderPhase2(); // Phase 3' not in js  # do not execute extra re-render cycle
all_grouped=[(s['number'],ep['number'],team) for s in p2['seasons'] for ep in s['episodes'] for team in ep['teams']]
coverage=sum(bool(ep['teams']) for s in p2['seasons'] for ep in s['episodes'])
assert coverage>=9, 'Season/episode team data unexpectedly lost (baseline: 9 episodes)'
assert len(all_grouped)>=46, 'Team lineup records unexpectedly lost (baseline: 46)'
assert all(group['members'] for _,_,group in all_grouped), 'Empty team record'
assert all(len(set(group['members']))==len(group['members']) for _,_,group in all_grouped)
assert all(not k in js for k in ('winnerCountGuess','fakeBadgeCount','inventedMvpScore'))
print(f'[PASS] Phase 3 data lab: {coverage}/16 episodes with lineups, {len(all_grouped)} team records; team-only metrics and source caveats')

# Phase 4: sourced Gravity only, no invented winners, bidirectional MEMBER 360 bridge.
p4=json.loads((ROOT/'data/wa-badgewar-phase4.json').read_text(encoding='utf-8'))
assert p4['schemaVersion']==4 and p4['updatedAt']=='2026-11-01'
assert len(p4['events'])==6
assert {e['id'] for e in p4['events']}=={'s1-format','s3-teams','s4-selection','s4-theme','s4-ep2-mvp','s4-ep4-mvp'}
assert sum(e['sourceTier']=='official_primary' for e in p4['events'])==1
for e in p4['events']:
    assert e['season'] in range(1,5) and e['source'].startswith('https://')
    assert e['sourceTier'] in ('official_primary','fan_crosscheck')
    assert all(e['label'].get(lang) and e['detail'].get(lang) for lang in ('ko','en','ja'))
    assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',e['start'])
assert 'wa-badgewar-phase4.json' in js and 'renderPhase4()' in js
assert 'WAVBadgeWar4' in js and 'WAVMember360?.open?' in js
member=(ROOT/'wav-member-view-360-3-2.js').read_text(encoding='utf-8')
assert 'WAVBadgeWar4?.openForMember' in member and 'data.ko' not in member
assert 'cardGrid.innerHTML' not in js and 'winnerCountGuess' not in js
assert '#badgewar4 .wa-bw4' in css
print('[PASS] Phase 4: six tiered Gravity references, no guessed MVP outcome, bidirectional member bridge and preserved card layout')

# Phase 5: checked source-tiered season outcomes and final badge ledger
p5=json.loads((ROOT/'data/wa-badgewar-phase5.json').read_text(encoding='utf-8'))
assert p5['schemaVersion']==5 and p5['spoilerDefault']=='closed'
assert [s['number'] for s in p5['seasons']]==[1,2,3,4]
assert [len(s['players']) for s in p5['seasons']]==[16,24,24,23]
assert 'wa-badgewar-phase5.json' in js and 'renderPhase5()' in js
assert '.wa-bw5__details' in css and 'data-bw5-member' in js
expected_winners={1:['S05'],2:['S01'],3:['S24'],4:['S01','S03','S11','S15','S18']}
for s in p5['seasons']:
 n=s['number']
 ids=[p['id'] for p in s['players']]
 assert len(ids)==len(set(ids))
 assert all(re.fullmatch(r'S(?:0[1-9]|1\d|2[0-4])',i) for i in ids)
 assert s['sourceTier']=='fan_community_table' and s['sourceUrl'].startswith('https://')
 assert s['winnerIds']==expected_winners[n]
 assert {p['id'] for p in s['players'] if p['winner']}==set(expected_winners[n])
 assert sum(p['badges'] for p in s['players'])==s['totalGameBadges']
 assert all(isinstance(p['badges'],int) and p['badges']>=1 for p in s['players'])
 assert all(s[k][l] for k in ('result','method') for l in ('ko','en','ja'))
 if n==4:
  assert 'S08' not in ids
  assert sum(p['benefitBadges'] for p in s['players'])==11
  assert s['totalGameBadges']==79
  assert s['totalBenefitBadges']==11
 else:
  assert s['totalBenefitBadges']==0
assert p5['seasons'][0]['players'][4]['badges']==10  # S05 season1, 7 + 3 transfer
assert p5['seasons'][1]['players'][0]['badges']==11 # S01 season2
assert p5['seasons'][2]['totalGameBadges']==151
assert p5['seasons'][2]['players'][23]['badges']==10
assert 'id="badgewar4"' in main and 'id="members"' in main
assert 'data-bw5-sort' in js and 'wa-bw5__verdict' in js
print('[PASS] Phase 5: 87 sourced badge records, 4 season outcomes, spoiler protection, S4 benefit separation, source tiers')
