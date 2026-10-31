/* WAV ARCHIVE - Gravity Data Insights
 * Read-only extension. The existing HISTORY, COMO REPLAY and PREDICTION logic is untouched.
 * Archived aggregate COMO != unique voters. Reference links != official verification.
 */
(() => {
  'use strict';
  const root = document.getElementById('insights');
  const raw = document.getElementById('embedded-catalog');
  if (!root || !raw || window.__WA_GRAVITY_INSIGHTS_5__) return;
  window.__WA_GRAVITY_INSIGHTS_5__ = true;
  const $ = id => root.querySelector(`#${id}`);
  const textNode = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = String(value);
    return el;
  };
  const fmt = number => Number(number).toLocaleString('ko-KR');
  const isTotal = n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
  const csvCell = cell => {
    let value = String(cell ?? '');
    // Protect exported CSV from formula injection in spreadsheet applications.
    if (/^[\s]*[=+@\-]/.test(value) && !/^-?\d+(?:\.\d+)?$/.test(value.trim())) value = `'${value}`;
    return `"${value.replaceAll('"', '""')}"`;
  };
  let catalog;
  try { catalog = JSON.parse(raw.textContent); }
  catch (_) { $('wa5-results').textContent = '기록 파일을 읽지 못했습니다'; return; }
  if (!Array.isArray(catalog.events)) { $('wa5-results').textContent = '기록 형식이 올바르지 않습니다'; return; }
  const events = catalog.events
    .filter(e => e && /^\d{4}-\d{2}-\d{2}$/.test(String(e.date)) && e.id)
    .map(e => ({
      id: String(e.id), number: Number.isFinite(e.number) ? e.number : '',
      name: String(e.name || '제목 미등록'), date: String(e.date),
      type: e.type === 'Grand' ? 'Grand' : 'Event',
      format: String(e.format || 'OTHER'),
      total: isTotal(e.totalComo) ? e.totalComo : null,
      source: /^https:\/\//.test(String(e.source)) ? String(e.source) : '',
      notes: String(e.notes || '')
    }));
  const known = events.filter(e => e.total !== null);
  $('wa5-provenance-note').textContent = `현재 수록된 ${events.length}개 주요 기록과 ${Array.isArray(catalog.ballots) ? catalog.ballots.length : 0}개 후보별 득표 상세 자료를 기반으로 합니다. 출처 링크는 참고 자료이며 각각이 공식 발표 원문으로 검증되었다는 뜻이 아닙니다. 누락된 총 COMO는 0으로 대체하지 않습니다`; 
  const years = [...new Set(events.map(e => e.date.slice(0, 4)))].sort();
  const validYears = new Set(years);
  const counts = new Map(years.map(y => [y, events.filter(e => e.date.startsWith(y)).length]));
  const metrics = [
    [events.length, '수록 Gravity'],
    [events.filter(e => e.type === 'Grand').length, 'Grand 기록'],
    [known.length, '투표량 등록'],
    [Array.isArray(catalog.ballots) ? catalog.ballots.length : 0, '후보별 득표 상세']
  ];
  $('wa5-metrics').replaceChildren(...metrics.map(([val, label]) => {
    const div = textNode('div', 'wa5-metric');
    div.append(textNode('strong', '', fmt(val)), textNode('small', '', label));
    return div;
  }));
  const chart = document.createDocumentFragment();
  const max = Math.max(1, ...counts.values());
  for (const y of years) {
    const row = textNode('div', 'wa5-year-row');
    const track = textNode('div', 'wa5-track');
    const bar = textNode('i', '');
    bar.style.width = `${counts.get(y) / max * 100}%`;
    track.append(bar);
    row.append(textNode('span', '', y), track, textNode('b', '', counts.get(y)));
    chart.append(row);
  }
  $('wa5-year-bars').replaceChildren(chart);
  const yearSelect = $('wa5-year');
  for (const y of years) {
    const option = textNode('option', '', y); option.value = y; yearSelect.append(option);
  }
  const selectable = known.slice().sort((a, b) => b.date.localeCompare(a.date));
  for (const key of ['wa5-compare-a', 'wa5-compare-b']) {
    const select = $(key);
    for (const event of selectable) {
      const option = textNode('option', '', `${event.date} · ${event.name}`);
      option.value = event.id;
      select.append(option);
    }
  }
  if (selectable.length) {
    $('wa5-compare-a').value = selectable[0].id;
    $('wa5-compare-b').value = selectable[Math.min(1, selectable.length - 1)].id;
  }
  function renderCompare() {
    const A = selectable.find(e => e.id === $('wa5-compare-a').value);
    const B = selectable.find(e => e.id === $('wa5-compare-b').value);
    const target = $('wa5-compare-chart');
    if (!A || !B) { target.textContent = '비교할 기록이 충분하지 않습니다'; return; }
    const maxVotes = Math.max(1, A.total, B.total);
    const fragment = document.createDocumentFragment();
    for (const [letter, ev] of [['A', A], ['B', B]]) {
      const row = textNode('div', 'wa5-compare-row');
      const top = textNode('div', 'wa5-compare-top');
      top.append(textNode('b', '', `${letter} · ${ev.name}`), textNode('span', '', `${fmt(ev.total)} COMO`));
      const track = textNode('div', 'wa5-compare-bar');
      const bar = textNode('i'); bar.style.width = `${ev.total / maxVotes * 100}%`;
      track.append(bar); row.append(top, track); fragment.append(row);
    }
    target.replaceChildren(fragment);
    let note = '기록된 총량 비교입니다. 투표 기간·라운드 수·후보 구성에 따라 직접 비교가 어려울 수 있습니다';
    if (A.id === B.id) note = '같은 Gravity를 선택했습니다. 서로 다른 기록을 선택하면 총량을 나란히 볼 수 있습니다';
    else if (A.notes || B.notes) note += ` · 주의: ${[A.notes, B.notes].filter(Boolean).join(' / ')}`;
    $('wa5-compare-note').textContent = note;
  }
  const $query = $('wa5-query');
  const $type = $('wa5-type');
  const $sort = $('wa5-order');
  let filtered = [];
  function list() {
    const q = $query.value.trim().toLocaleLowerCase();
    const y = yearSelect.value;
    const type = $type.value;
    filtered = events.filter(e => (!y || e.date.startsWith(y)) && (!type || e.type === type) &&
      (!q || [e.name, e.date, String(e.number), e.type, e.format, e.notes].join(' ').toLocaleLowerCase().includes(q)));
    const order = $sort.value;
    if (order === 'oldest') filtered.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    else if (order === 'largest' || order === 'smallest') filtered.sort((a, b) => {
      if (a.total === null) return b.total === null ? 0 : 1;
      if (b.total === null) return -1;
      return (order === 'largest' ? b.total - a.total : a.total - b.total) || b.date.localeCompare(a.date);
    });
    else filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    $('wa5-count').textContent = `${filtered.length} RECORDS`;
    $('wa5-results-label').textContent = `총 ${events.length}건 중 ${filtered.length}건 표시`;
    $('wa5-export').disabled = filtered.length === 0;
    const fragment = document.createDocumentFragment();
    for (const e of filtered) {
      const card = textNode('article', 'wa5-item');
      const meta = textNode('div', 'wa5-item-meta');
      meta.append(textNode('span', 'wa5-tag', e.type.toUpperCase()), textNode('span', '', `#${e.number || '—'} · ${e.date} · ${e.format}`));
      card.append(meta, textNode('h4', '', e.name));
      const votes = textNode('div', `wa5-votes${e.total === null ? ' missing' : ''}`,
        e.total === null ? '◌ 득표량 미등록' : `● ${fmt(e.total)} COMO`);
      card.append(votes);
      if (e.notes) card.append(textNode('p', 'wa5-item-notes', e.notes));
      if (e.source) {
        const link = textNode('a', '', '참고 자료 ↗');
        link.href = e.source; link.target = '_blank'; link.rel = 'noopener noreferrer';
        card.append(link);
      }
      fragment.append(card);
    }
    if (!filtered.length) fragment.append(textNode('div', 'wa5-empty', '조건에 맞는 기록이 없습니다. 검색어나 필터를 바꿔 보세요'));
    $('wa5-results').replaceChildren(fragment);
  }
  for (const key of ['wa5-compare-a', 'wa5-compare-b']) $(key).addEventListener('change', renderCompare);
  for (const key of ['wa5-query', 'wa5-year', 'wa5-type', 'wa5-order']) {
    $(key).addEventListener(key === 'wa5-query' ? 'input' : 'change', list);
  }
  $('wa5-export').addEventListener('click', () => {
    if (!filtered.length) return;
    const columns = ['id', 'number', 'date', 'name', 'type', 'format', 'totalComo', 'source', 'notes'];
    const csv = ['\ufeff' + columns.map(csvCell).join(',')]
      .concat(filtered.map(row => [row.id, row.number, row.date, row.name, row.type, row.format,
        row.total ?? '', row.source, row.notes].map(csvCell).join(','))).join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'WAV_ARCHIVE_Gravity_Records.csv';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  });
  renderCompare(); list();
  // Optional direct link for standalone viewing; main page iframe behavior stays unchanged.
  try {
    if (new URLSearchParams(location.search).get('view') === 'insights') {
      const tab = document.querySelector('button.tab[data-tab="insights"]');
      if (tab) tab.click();
    }
  } catch (_) {}
  // No write operations to the original dataset or the user’s locally stored data.
})();
