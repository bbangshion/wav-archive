#!/usr/bin/env python3
"""Optional Chromium QA for WAV ARCHIVE 3.3, mobile viewport, using local server at URL."""
import json,os,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
URL = os.environ.get('WAV_TEST_URL','http://127.0.0.1:18765/')
issues = []
results = {}

def assert_check(label, ok, detail=''):
    results[label]={'pass':bool(ok),'detail':str(detail)[:250]}
    if not ok: issues.append(label)

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path=os.environ.get('CHROME_BIN') or None,
                               args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
    try:
        page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=2,is_mobile=True,has_touch=True,
                              reduced_motion='reduce',locale='ko-KR')
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)[:250]))
        response=page.goto(URL,wait_until='domcontentloaded',timeout=60000)
        assert_check('HTTP 200',response and response.status==200,str(response.status if response else None))
        page.wait_for_function('window.WAVHistoryUniverse && window.WAVCalendar && window.WAVMember360',timeout=30000)
        page.wait_for_function('Number(document.querySelector("#waHistoryUniverse .wa-hu-stat strong")?.textContent) >= 99',timeout=30000)
        stats=page.evaluate('window.WAVHistoryUniverse.getStats()')
        assert_check('History sources protected floor',sum(stats[k] for k in ('history','discography','gravity','official','monthOnly'))>=99,stats)
        assert_check('Legacy heading hidden by default',page.locator('#timeline > .wrap > .section-head').evaluate('(el) => getComputedStyle(el).display')=='none')
        assert_check('History source breakdown visible',page.locator('.wa-hu-breakdown').is_visible(),page.locator('.wa-hu-breakdown').inner_text())
        page.locator('#waHistoryLegacy').click(force=True)
        assert_check('Old timeline recovered by button',page.locator('#timeline > .wrap > .section-head').evaluate('(el) => getComputedStyle(el).display')!='none')
        page.locator('#waHistoryLegacy').click(force=True)
        assert_check('Old timeline hidden again',page.locator('#timeline > .wrap > .section-head').evaluate('(el) => getComputedStyle(el).display')=='none')
        assert_check('24 member cards',page.locator('#memberGrid .member-card[data-member]').count()==24)
        assert_check('2-column switch exists',page.locator('[data-wa21-view="grid"]').count()==1)
        page.locator('[data-wa21-view="wide"]').click(force=True)
        assert_check('Wide view changes layout',page.locator('#memberGrid').evaluate('(el)=>el.classList.contains("wa21-member-wide")'))
        page.locator('[data-wa21-view="grid"]').click(force=True)
        assert_check('Grid view restores',not page.locator('#memberGrid').evaluate('(el)=>el.classList.contains("wa21-member-wide")'))
        assert_check('Calendar rendered',page.locator('#wac-days .wac-date:not(.is-out)').count()>=28)
        assert_check('360 opens',page.evaluate('window.WAVMember360.open("S20")'))
        assert_check('360 tabs',page.locator('#wa65DetailModal .wa22-tab').count()==5)
        page.locator('#wa65DetailModal .wa22-tab').nth(3).click(force=True)
        page.wait_for_function('window.WAVMember360.getState().calendarStatus === "ready"',timeout=30000)
        page.wait_for_timeout(250)
        text=page.locator('#wa65DetailModal .wa22-content').inner_text()
        calendar_data=json.loads((Path(__file__).resolve().parents[1]/'data/wav-official-calendar.json').read_text('utf-8'))
        tagged=[e for e in calendar_data['events'] if 'S20' in (e.get('members') or [])]
        untagged=[e for e in calendar_data['events'] if not e.get('members')]
        if not tagged:
            assert_check('No invented S20 event', '멤버가 명시된 공식 일정이 아직 없어요' in text,text[:240])
        if untagged and not tagged:
            assert_check('Unattributed events labeled separately', '멤버 미지정 공식 일정' in text and '참석을 의미하지 않습니다' in text,text[:240])
            assert_check('Unattributed preview links',page.locator('#wa65DetailModal .wa22-content .wa22-row').count()>0)
        assert_check('No JS uncaught exceptions',not errors,errors[:6])
        print(json.dumps({'results':results,'page_errors':errors[:8]},ensure_ascii=False,indent=2))
    finally:
        browser.close()
if issues:
    print('FAIL:',', '.join(issues),file=sys.stderr)
    raise SystemExit(1)
print('PASS: Browser smoke for calendar, history, member grid and 360 schedule')
