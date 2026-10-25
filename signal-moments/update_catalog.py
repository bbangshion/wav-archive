#!/usr/bin/env python3
"""Static YouTube SIGNAL archive indexer. Writes official video metadata only.

- YouTube Data API key stored exclusively as GitHub Actions Secret.
- Full 2022-2026 scan when no full backfill has completed or SIGNAL_FORCE_FULL=1.
- Incremental daily scan once full sync is complete.
- On API failure, preserves the last successful catalog and exits with an error.
- With no key, updates only recent public Atom feed and explicitly keeps 'starter' coverage.
"""
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data.json'
CHANNEL_ID = 'UCJnL-TBcsYrF2SLs7tmiC8Q'  # tripleS official, verified channel ID
API = 'https://www.googleapis.com/youtube/v3/'
START_YEAR, END_YEAR = 2022, 2026

NAMES = {
    '윤서연':'S01','정혜린':'S02','이지우':'S03','김채연':'S04','김유연':'S05','김수민':'S06',
    '김나경':'S07','공유빈':'S08','카에데':'S09','서다현':'S10','코토네':'S11','곽연지':'S12',
    '니엔':'S13','박소현':'S14','신위':'S15','마유':'S16','린':'S17','주빈':'S18',
    '정하연':'S19','박시온':'S20','김채원':'S21','설린':'S22','서아':'S23','지연':'S24',
}
# Use full Korean names and reasonably unambiguous Romanized hashtags from the
# *video title only*: channel description often lists every tripleS member.
ROMANIZED = {
    'seoyeon':'S01','hyerin':'S02','jiwoo':'S03','chaeyeon':'S04','yooyeon':'S05',
    'soomin':'S06','nakyong':'S07','nakyung':'S07','nakyoung':'S07','yubin':'S08',
    'kaede':'S09','dahyun':'S10','kotone':'S11','yeonji':'S12','nien':'S13',
    'sohyun':'S14','xinyu':'S15','mayu':'S16','lynn':'S17','joobin':'S18',
    'hayeon':'S19','shion':'S20','chaewon':'S21','sullin':'S22','seoah':'S23','jiyeon':'S24',
}
# Standalone nickname matching only when explicit and useful, not substring inside common words.
ALIASES = {
    '연지':'S12','하연':'S19','시온':'S20','채원':'S21','서아':'S23',
    '수민':'S06','유빈':'S08','채연':'S04','지우':'S03','혜린':'S02','나경':'S07',
    '코토네':'S11','주빈':'S18','다현':'S10','소현':'S14',
}
TAG_WORDS = {
    '룸메이트': ['룸메이트', 'roommate'], 'HAUS': ['하우스', 'haus'],
    '생일':['생일', 'birthday', 'birth day', 'hbd'],
    '투어':['투어', 'tour', 'world tour'], '마카오투어':['마카오', 'macau'],
    '데뷔':['데뷔','debut'], '무대':['무대','stage','쇼케이스'],
    '비하인드':['behind','비하인드','촬영 현장'], '일상':['일상','vlog','먹방','하루'],
    '우정':['우정','절친'], '연습':['연습','practice'], '팬미팅':['팬미팅','fan meeting'],
}


def request(url: str) -> bytes:
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'WavArchive-SignalCatalog/2.0'})
            with urllib.request.urlopen(req, timeout=35) as response:
                return response.read()
        except urllib.error.HTTPError as exc:
            if exc.code in (400, 401, 403):
                info = exc.read(700).decode('utf-8', 'replace')
                raise RuntimeError(f'YouTube API HTTP {exc.code}: {info}') from exc
            if attempt == 3:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == 3:
                raise
        time.sleep(attempt + 1)
    raise RuntimeError('Unable to fetch YouTube metadata')


def api(path, key, **params):
    params['key'] = key
    return json.loads(request(API + path + '?' + urllib.parse.urlencode(params)))


def kind_of(title):
    name = title.casefold()
    if re.search(r'(?<![a-z])sssignal(?![a-z])',name):return 'SSSIGNAL'
    if re.search(r'(?<![a-z])(?:signal\s*live|live\s*signal)(?![a-z])',name):return 'LIVE'
    if re.search(r'(?<![a-z])signal\s*weekly(?![a-z])',name):return 'WEEKLY'
    if re.search(r'(?<![a-z])signal(?![a-z])',name):return 'SIGNAL'
    return None


def members_of(title):
    members={sid for name,sid in NAMES.items() if name in title}
    for name,sid in ALIASES.items():
        if name in title:members.add(sid)
    for name,sid in ROMANIZED.items():
        if re.search(r'(?<![a-z])'+re.escape(name)+r'(?![a-z])', title.casefold()):members.add(sid)
    for x in re.findall(r'(?<![a-z\d])S(0?[1-9]|1\d|2[0-4])(?!\d)',title,re.I):
        members.add('S'+str(int(x)).zfill(2))
    return sorted(members)


def tags_of(title):
    low=title.casefold()
    return [tag for tag,words in TAG_WORDS.items() if any(word in low for word in words)]


def summarized(title):
    """Short factual title-derived descriptor, NOT an invented plot synopsis."""
    clean=re.sub(r'(?:\|\s*)?(?:SIGNAL\s*WEEKLY|SIGNAL\s*LIVE|LIVE\s*SIGNAL|SSSIGNAL|SIGNAL)(?:\s*\d{6})?', '',title,flags=re.I)
    clean=re.sub(r'\b(?:EN|JP|CN|ENG|SUB)\b','',clean,flags=re.I)
    clean=re.sub(r'\s+',' ',clean).strip(' |—·-_')
    if not clean:return 'tripleS 공식 YouTube에 올라온 SIGNAL 기록.'
    return ('공식 영상 제목: '+clean[:132]).strip()


def create(video_id, title, published_at, embeddable=True):
    kind=kind_of(title)
    if not kind or not re.fullmatch(r'[\w-]{11}',video_id or ''):return None
    try:
        timestamp = dt.datetime.fromisoformat(str(published_at).replace('Z','+00:00'))
        if timestamp.tzinfo is None:timestamp=timestamp.replace(tzinfo=dt.timezone.utc)
        date=timestamp.astimezone(dt.timezone(dt.timedelta(hours=9))).date()
    except (ValueError,TypeError):return None
    if not START_YEAR<=date.year<=END_YEAR:return None
    return {
       'videoId':video_id,'date':date.isoformat(),'title':title[:275],
       'kind':kind,'members':members_of(title),'tags':tags_of(title),
       'summary':summarized(title),'embeddable':bool(embeddable),
    }


def from_api(key, existing_ids, full):
    channels=api('channels',key,part='contentDetails',id=CHANNEL_ID)
    rec=(channels.get('items') or [])
    playlist=((((rec[0] if rec else {}).get('contentDetails') or {}).get('relatedPlaylists')) or {}).get('uploads')
    if not playlist:raise RuntimeError('Official uploads playlist not found')
    out=[];page=None;pages=0;stable=0
    while pages<180:
        params={'part':'snippet,contentDetails','playlistId':playlist,'maxResults':50}
        if page:params['pageToken']=page
        payload=api('playlistItems',key,**params)
        candidates=[]
        for row in payload.get('items',[]):
            snippet=row.get('snippet') or {}
            video_id=((row.get('contentDetails') or {}).get('videoId') or (snippet.get('resourceId') or {}).get('videoId'))
            if not re.fullmatch(r'[\w-]{11}',video_id or ''):continue
            if kind_of(snippet.get('title','')):candidates.append(video_id)
        found=set(existing_ids)
        if full or candidates:
            # Use videos.list for official publication date and embedding permissions.
            for i in range(0,len(candidates),50):
                full_videos=api('videos',key,part='snippet,status',id=','.join(candidates[i:i+50]))
                for item in full_videos.get('items',[]):
                    s=item.get('snippet') or {}; status=item.get('status') or {}
                    if status.get('privacyStatus') not in (None,'public'):continue
                    if s.get('channelId')!=CHANNEL_ID:continue
                    ep=create(item.get('id'),s.get('title',''),s.get('publishedAt',''),status.get('embeddable',True))
                    if ep:out.append(ep)
        pages+=1
        fresh=sum(1 for x in candidates if x not in found)
        stable=stable+1 if not fresh else 0
        page=payload.get('nextPageToken')
        if not page:break
        # Full scans are necessary for backfill. Regular refresh scans recent uploads only.
        if not full and pages>=3 and stable>=3:break
    if full and page:raise RuntimeError('Full history was truncated; preserving existing catalog')
    print(f'YouTube official API: {pages} pages, {len(out)} video candidates; full={full}',flush=True)
    return out


def from_atom():
    xml=request(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}')
    root=ET.fromstring(xml)
    ns='{http://www.w3.org/2005/Atom}';yt='{http://www.youtube.com/xml/schemas/2015}'
    result=[]
    for entry in root.findall(ns+'entry'):
        obj=create(entry.findtext(yt+'videoId',''),entry.findtext(ns+'title',''),entry.findtext(ns+'published',''))
        if obj:result.append(obj)
    print(f'Atom public feed: {len(result)} most recent SIGNAL entries (not history)',flush=True)
    return result


def main():
    original=json.loads(DATA.read_text(encoding='utf8')) if DATA.exists() else {'schemaVersion':2,'episodes':[],'coverage':'starter'}
    if isinstance(original,list):original={'schemaVersion':2,'episodes':original,'coverage':'starter'}
    prior=original.get('episodes') or []
    verified={d['videoId']:d for d in prior if isinstance(d,dict) and re.fullmatch(r'[\w-]{11}',str(d.get('videoId') or ''))}
    key=os.environ.get('YOUTUBE_API_KEY','').strip()
    full=bool(key) and (original.get('coverage')!='official-full' or os.environ.get('SIGNAL_FORCE_FULL')=='1')
    try:
        candidates=from_api(key,verified,full) if key else from_atom()
    except Exception as exc:
        print('SIGNAL sync failed; previous catalog preserved: '+str(exc),file=sys.stderr)
        # Fail loudly with an API key, so a user can see invalid credentials in Actions.
        if key:raise
        return
    for ep in candidates:
        old=verified.get(ep['videoId'])
        if old and old.get('curated') is True:
            for f in ('summary','members','tags'):ep[f]=old.get(f,ep[f])
        verified[ep['videoId']]=ep
    manual=[] if full else [d for d in prior if isinstance(d,dict) and not d.get('videoId')]
    combined=sorted([*verified.values(),*manual],key=lambda x:(x.get('date',''),x.get('videoId','')),reverse=True)
    # This flag means a complete crawl of public official channel uploads succeeded,
    # not that private/deleted/unlisted videos are discoverable.
    coverage='official-full' if full or original.get('coverage')=='official-full' else original.get('coverage','starter')
    updated={**original,'schemaVersion':2,'coverage':coverage,'source':'tripleS official YouTube channel / YouTube Data API' if key else 'Official YouTube Atom feed (recent only) + existing verified entries','episodes':combined,'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}
    if any(updated.get(k)!=original.get(k) for k in ('schemaVersion','coverage','source','episodes')):
        DATA.write_text(json.dumps(updated,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print('Saved',len(combined),'SIGNAL entries; newly fetched',len(candidates),'coverage',coverage)
    else:print('Catalog content unchanged; no commit necessary')

if __name__=='__main__':main()
