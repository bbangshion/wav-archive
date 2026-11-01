#!/usr/bin/env python3
"""WAV ARCHIVE 3.3 regression guard: real data counts, essential loading links and formats.

Pure stdlib Python. It checks source integrity, not mobile rendering or truth of official sources.
"""
import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXPECT = json.loads((ROOT / 'tests/wa-integrity-baseline.json').read_text('utf-8'))
HTML = (ROOT / 'index.html').read_text('utf-8')
failures = []


def check(ok, message):
    print(('PASS' if ok else 'FAIL') + '  ' + message)
    if not ok:
        failures.append(message)


class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.refs = []
        self.counts = Counter()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get('id'):
            self.ids.append(attributes['id'])
        classes = set((attributes.get('class') or '').split())
        for label, classname in [
            ('member_cards', 'member-card'),
            ('legacy_history_records', 'timeline-event'),
            ('album_cards', 'disco-db-card'),
            ('gravity_cards', 'gravity-card'),
        ]:
            if classname in classes:
                self.counts[label] += 1
        if tag == 'script' and attributes.get('src'):
            self.refs.append(('script', attributes['src']))
        elif tag == 'link' and attributes.get('href') and attributes.get('rel') in ('stylesheet', None):
            if 'stylesheet' in str(attributes.get('rel')):
                self.refs.append(('style', attributes['href']))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)


def local_path(url):
    split = urlsplit(url)
    if split.scheme or split.netloc or url.startswith(('#', '//', 'data:')):
        return None
    path = unquote(split.path)
    if path.startswith('/'):
        # same-site absolute URLs from hosting paths are not resolvable by local file path
        if path.startswith('/wav-archive/'):
            path = path[len('/wav-archive/'):]
        else:
            return None
    rel = (ROOT / path).resolve()
    if not rel.is_relative_to(ROOT.resolve()):
        return 'INVALID_PATH'
    return rel

parser = AuditParser()
parser.feed(HTML)
ids = Counter(parser.ids)
for key in EXPECT['critical_sections']:
    check(ids[key] == 1, f'essential element #{key} exists exactly once ({ids[key]})')
check(all(v == 1 for v in ids.values()), f'unique ID attributes (duplicates: {[k for k,v in ids.items() if v>1][:6]})')

for filename in EXPECT['critical_styles']:
    check((ROOT / filename).is_file(), f'style file exists: {filename}')
    check(sum(local_path(url) == (ROOT / filename).resolve() for tag,url in parser.refs if tag=='style') == 1,
          f'style linked exactly once: {filename}')
for filename in EXPECT['critical_scripts']:
    check((ROOT / filename).is_file(), f'script file exists: {filename}')
    check(sum(local_path(url) == (ROOT / filename).resolve() for tag,url in parser.refs if tag=='script') == 1,
          f'script linked exactly once: {filename}')
for tag, url in parser.refs:
    path = local_path(url)
    if path is not None:
        check(path != 'INVALID_PATH' and path.is_file(), f'local {tag} present: {url.split("?")[0]}')

for name in EXPECT['critical_data']:
    check((ROOT / name).is_file(), f'data file exists: {name}')

calendar = json.loads((ROOT / 'data/wav-official-calendar.json').read_text('utf-8'))
signals = json.loads((ROOT / 'signal-moments/data.json').read_text('utf-8'))
objekt = json.loads((ROOT / 'objekt-collection/data/objekt-top.json').read_text('utf-8'))
events = calendar.get('events', [])
episodes = signals.get('episodes', [])
collections = objekt.get('collections', [])
check(isinstance(events,list), 'calendar.events list')
check(isinstance(episodes,list), 'signal.episodes list')
check(isinstance(collections,list), 'objekt.collections list')
check(len({e.get('id') for e in events if isinstance(e,dict)}) == len(events), 'calendar event IDs unique')
check(len({e.get('videoId') for e in episodes if isinstance(e,dict)}) == len(episodes), 'SIGNAL video IDs unique')
check(all(isinstance(e,dict) and re.fullmatch(r'20\d\d-\d\d-\d\d',str(e.get('date',''))) and e.get('title') for e in events), 'calendar dates/titles present')

tagged = sum(bool(isinstance(e,dict) and isinstance(e.get('members'),list) and e['members']) for e in episodes)
counts = {
    **dict(parser.counts),
    'official_calendar_events': len(events),
    'signal_episodes': len(episodes),
    'signal_episodes_with_member_tags': tagged,
    'objekt_records': len(collections),
}
counts['history_connected_sources'] = sum(counts.get(x,0) for x in ['legacy_history_records','album_cards','gravity_cards','official_calendar_events']) + len(calendar.get('upcomingWithNoDate',[]))
for name, minimum in EXPECT['minimum'].items():
    if name == 'member_cards':
        # A page may contain another reference to the class in JS strings; card structure test is also in browser smoke.
        count = counts.get(name,0)
        check(count >= minimum, f'{name}: {count} >= {minimum}')
    else:
        count = counts.get(name,0)
        check(count >= minimum, f'{name}: {count} >= {minimum}')
check('WAVHistoryUniverse' in (ROOT/'wav-history-universe.js').read_text('utf-8'), 'HISTORY engine API retained')
check('wa21-member-wide' in (ROOT/'wav-member-view-360-3-2.js').read_text('utf-8'), '2-column member switch retained')
check('WAVMember360' in (ROOT/'wav-member-view-360-3-2.js').read_text('utf-8'), 'MEMBER 360 API retained')
check('wa-calendar-active' in (ROOT/'wav-calendar.css').read_text('utf-8'), 'calendar replaces original TODAY view')
check('wa-hu-legacy-hidden > .wrap > .section-head' in (ROOT/'wav-history-universe.css').read_text('utf-8'), 'legacy header only hidden when universe active')
print('\nSUMMARY:', json.dumps(counts, ensure_ascii=False, sort_keys=True))
if failures:
    print(f'\nBLOCKED: {len(failures)} regression(s). If a deletion was intentional, review and update baseline carefully.', file=sys.stderr)
    raise SystemExit(1)
print('\nPASS: No protected feature or minimum data-source regression detected (static only).')
