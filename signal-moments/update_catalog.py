#!/usr/bin/env python3
"""Append publicly listed official tripleS SIGNAL videos to a static JSON catalogue.

With YOUTUBE_API_KEY: backfills the complete official channel upload playlist since 2022.
Without a key: best-effort recent YouTube Atom feed only, no invented historical coverage.
No scraping of community websites; no client-side API credentials.
"""
import datetime as dt
import json
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / 'data.json'
CHANNEL = 'UCJnL-TBcsYrF2SLs7tmiC8Q'  # @triplescosmos
MEMBERS = {
 '윤서연':'S01','정혜린':'S02','이지우':'S03','김채연':'S04','김유연':'S05','김수민':'S06',
 '김나경':'S07','공유빈':'S08','카에데':'S09','서다현':'S10','코토네':'S11','곽연지':'S12',
 '니엔':'S13','박소현':'S14','신위':'S15','마유':'S16','린':'S17','주빈':'S18',
 '정하연':'S19','박시온':'S20','김채원':'S21','설린':'S22','서아':'S23','지연':'S24'
}
ALIASES = {'하연':'S19','시온':'S20','연지':'S12','채원':'S21','수민':'S06','지우':'S03',
 '서연':'S01','혜린':'S02','나경':'S07','유빈':'S08','다현':'S10','채연':'S04','소현':'S14','유연':'S05'}
TAG_WORDS = {'HAUS':['하우스','haus'], '룸메이트':['룸메이트','roommate'],
 '투어':['투어','tour','마카오'], '마카오투어':['마카오','macau'],
 '생일':['생일','birthday','hbd'], '데뷔':['데뷔','debut'],
 '무대':['무대','stage','쇼케이스'], '비하인드':['behind','비하인드'],
 '일상':['일상','vlog','먹방'], '연습':['연습','practice'], '팬미팅':['팬미팅','fan meeting']}


def request(url):
    err = None
    for attempt in range(3):
        try:
            req=urllib.request.Request(url, headers={'User-Agent':'WavArchiveSignalMoments/1.0'})
            with urllib.request.urlopen(req, timeout=25) as response:
                return response.read()
        except Exception as ex:
            err=ex
            time.sleep(1 + attempt)
    raise RuntimeError(f'Network error: {err}')


def kind_of(title):
    s=title.casefold()
    if 'sssignal' in s:return 'SSSIGNAL'
    if re.search(r'signal\s*live',s):return 'LIVE'
    if re.search(r'signal\s*weekly',s):return 'WEEKLY'
    if re.search(r'\bsignal\b',s):return 'SIGNAL'
    return None


def members_of(title):
    hits=[]
    for name,sid in MEMBERS.items():
        if name in title:hits.append(sid)
    for name,sid in ALIASES.items():
        if name in title:hits.append(sid)
    return sorted(set(hits))


def tags_of(title):
    txt=title.casefold()
    return [tag for tag,words in TAG_WORDS.items() if any(word in txt for word in words)]


def summarized(title):
    cleaned=re.sub(r'\|?\s*(?:tripleS\s*트리플에스\s*:\s*)?(?:SSSIGNAL|SIGNAL(?:\s+LIVE|\s+WEEKLY)?)(?:\s+\d{6})?.*$', '', title, flags=re.I).strip(' |·-')
    return (f'{cleaned} — 공식 SIGNAL의 그날 기록.' if cleaned else '공식 채널에서 이 회차의 이야기를 확인해 보세요.')[:160]


def item(video_id,title,published):
    kind=kind_of(title)
    if not kind:return None
    if not re.fullmatch(r'[\w-]{11}',video_id or ''):return None
    try:date=dt.date.fromisoformat(published[:10])
    except (ValueError,TypeError):return None
    if not (2022 <= date.year <= 2026):return None
    return {'videoId':video_id,'date':date.isoformat(),'title':title[:250],'kind':kind,
            'members':members_of(title),'tags':tags_of(title),'summary':summarized(title)}


def from_api(key):
    out=[];page=None;count=0
    while count<120:
        args={'part':'snippet,contentDetails','playlistId':'UU'+CHANNEL[2:], 'maxResults':'50','key':key}
        if page:args['pageToken']=page
        url='https://www.googleapis.com/youtube/v3/playlistItems?'+urllib.parse.urlencode(args)
        body=json.loads(request(url))
        if body.get('error'):raise RuntimeError(str(body['error'])[:300])
        for entry in body.get('items',[]):
            snippet=entry.get('snippet') or {}
            title=snippet.get('title','')
            vid=((entry.get('contentDetails') or {}).get('videoId') or
                 (snippet.get('resourceId') or {}).get('videoId'))
            obj=item(vid,title,snippet.get('publishedAt',''))
            if obj:out.append(obj)
        count+=1;page=body.get('nextPageToken')
        if not page:break
    print(f'Official API pages: {count}, candidate SIGNAL videos: {len(out)}')
    return out


def from_feed():
    xml=request(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL}')
    root=ET.fromstring(xml)
    atom='{http://www.w3.org/2005/Atom}'
    yt='{http://www.youtube.com/xml/schemas/2015}'
    out=[]
    for entry in root.findall(f'{atom}entry'):
        obj=item(entry.findtext(f'{yt}videoId',''), entry.findtext(f'{atom}title',''),entry.findtext(f'{atom}published',''))
        if obj:out.append(obj)
    print(f'Public Atom feed: {len(out)} recent videos')
    return out


def main():
    initial=json.loads(DATA.read_text(encoding='utf8'))
    current=initial.get('episodes') or []
    key=os.getenv('YOUTUBE_API_KEY','').strip()
    try:
        fetched=from_api(key) if key else from_feed()
    except Exception as ex:
        print(f'Catalogue refresh unavailable: {ex}; preserving current entries')
        return
    by_video={e['videoId']:e for e in current if e.get('videoId')}
    manual=[e for e in current if not e.get('videoId')]
    changed=0
    for e in fetched:
        previous=by_video.get(e['videoId'])
        if previous:
            # Preserve human-reviewed summaries, tags and cast in existing records.
            preserved={**e,**previous,'title':e['title'],'date':e['date'],'kind':e['kind']}
            by_video[e['videoId']]=preserved
        else:
            by_video[e['videoId']]=e
            changed+=1
    # Replace manual placeholders when same kind and same date are now represented
    # by an official URL. Never guess a video ID for an unverified entry.
    represented={(e['date'],e['kind']) for e in by_video.values()}
    manual=[m for m in manual if (m.get('date'),m.get('kind')) not in represented]
    combined=list(by_video.values())+manual
    combined.sort(key=lambda r:(r.get('date',''),r.get('videoId','')), reverse=True)
    latest={**initial,'episodes':combined,'coverage':'official-playlist' if key else initial.get('coverage','starter')}
    if changed or len(combined)!=len(current):
        latest['generatedAt']=dt.datetime.now(dt.timezone.utc).isoformat()
        DATA.write_text(json.dumps(latest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        print(f'Updated {len(combined)} episodes, +{changed} confirmed IDs')
    else:print('No new entries. Existing data preserved.')

if __name__=='__main__':main()
