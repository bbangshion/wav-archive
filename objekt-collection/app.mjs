import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { transformObjektData, unwrapRows, OBJEKT_TOP_COLLECTIONS_ENDPOINT } from './objektData.mjs';
const EMPTY_REPORT = { rows: [], skipped: 0, skipReasons: {}, duplicates: 0, sources: [] };
const DEFAULT_FEEDS = [
    { source: 'objekt.top', url: './data/objekt-top.json' },
    { source: 'apollo.cafe', url: './data/apollo.json' }
];
const CLASS_OPTIONS = [
    'ALL', 'First', 'Special', 'Double', 'Premier', 'Welcome', 'Zero', 'Unit', 'Motion', 'Unknown'
];
const num = (obj) => Number(obj.collectionNo.match(/\d+/)?.[0] ?? 0);
const lowMotion = () => typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    navigator.connection?.saveData === true);
const placeholder = './assets/objekt-placeholder.svg';
function useElementWidth(ref) {
    const [width, setWidth] = useState(360);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const ro = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width;
            if (w && Math.abs(w - width) > 2)
                setWidth(w);
        });
        ro.observe(el);
        setWidth(el.getBoundingClientRect().width || 360);
        return () => ro.disconnect();
        // Subscribe once to avoid observer churn on every resize.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);
    return width;
}
function LazyObjektImage({ objekt, root, detail = false, back = false }) {
    const area = useRef(null);
    const [visible, setVisible] = useState(false);
    const [candidateIndex, setCandidateIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const candidates = useMemo(() => {
        const order = back ? [objekt.backImageUrl] : detail ?
            [objekt.localImageUrl, objekt.imageUrl, objekt.originalFrontImageUrl, objekt.thumbnailUrl] :
            [objekt.localImageUrl, objekt.thumbnailUrl, objekt.imageUrl];
        return order.filter((x) => Boolean(x)).filter((x, i, arr) => arr.indexOf(x) === i);
    }, [objekt.localImageUrl, objekt.thumbnailUrl, objekt.imageUrl, objekt.originalFrontImageUrl, objekt.backImageUrl, detail, back]);
    const source = candidates[candidateIndex] ?? null;
    useEffect(() => {
        setVisible(false);
        setCandidateIndex(0);
        setLoaded(false);
        const node = area.current;
        if (!node)
            return;
        if (detail || !('IntersectionObserver' in window)) {
            setVisible(true);
            return;
        }
        const io = new IntersectionObserver(items => {
            if (items.some(x => x.isIntersecting)) {
                setVisible(true);
                io.disconnect();
            }
        }, { root: root?.current ?? null, rootMargin: '260px 0px', threshold: 0.01 });
        io.observe(node);
        return () => io.disconnect();
    }, [objekt.id, root, detail, back]);
    return React.createElement("div", { ref: area, className: "oc8-image-wrap" },
        (!loaded || !source) && React.createElement("img", { className: "oc8-card-image oc8-image-placeholder", src: placeholder, alt: "", loading: "lazy", decoding: "async" }),
        visible && source && React.createElement("img", { key: source, className: `oc8-card-image oc9-loaded-image ${loaded ? 'is-loaded' : ''}`, src: source, alt: `${objekt.memberKo} ${objekt.season} #${objekt.collectionNo}`, loading: detail ? 'eager' : 'lazy', decoding: "async", fetchPriority: detail ? 'high' : 'low', onLoad: () => setLoaded(true), onError: () => { setLoaded(false); setCandidateIndex(i => i + 1); } }),
        !source && React.createElement("span", { className: "oc8-image-status" }, "IMAGE NOT AVAILABLE"));
}
const Card = memo(function Card({ objekt, root, onChoose }) {
    const ref = useRef(null);
    const frame = useRef(null);
    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });
    const rect = useRef(null);
    const last = useRef(0);
    const tick = useCallback((stamp) => {
        frame.current = null;
        if (!ref.current || document.hidden)
            return;
        const dt = Math.min(50, Math.max(1, last.current ? stamp - last.current : 16.67));
        last.current = stamp;
        const alpha = 1 - Math.pow(.9, dt / 16.67);
        current.current.x += (target.current.x - current.current.x) * alpha;
        current.current.y += (target.current.y - current.current.y) * alpha;
        ref.current.style.setProperty('--oc8-x', `${current.current.x.toFixed(2)}deg`);
        ref.current.style.setProperty('--oc8-y', `${current.current.y.toFixed(2)}deg`);
        if (Math.abs(target.current.x - current.current.x) > .06 || Math.abs(target.current.y - current.current.y) > .06) {
            frame.current = requestAnimationFrame(tick);
        }
        else if (Math.abs(current.current.x) < .09 && Math.abs(current.current.y) < .09) {
            ref.current.classList.remove('oc8-active-tilt');
        }
    }, []);
    const schedule = useCallback(() => {
        if (frame.current === null && !lowMotion())
            frame.current = requestAnimationFrame(tick);
    }, [tick]);
    useEffect(() => () => { if (frame.current !== null)
        cancelAnimationFrame(frame.current); }, []);
    const pointer = useCallback((ev) => {
        if (ev.pointerType !== 'mouse' || lowMotion())
            return;
        const r = rect.current;
        if (!r)
            return;
        target.current.y = Math.max(-8, Math.min(8, ((ev.clientX - r.left) / r.width - .5) * 16));
        target.current.x = Math.max(-8, Math.min(8, (0.5 - (ev.clientY - r.top) / r.height) * 16));
        ref.current?.classList.add('oc8-active-tilt');
        schedule();
    }, [schedule]);
    const end = useCallback(() => { rect.current = null; target.current = { x: 0, y: 0 }; schedule(); }, [schedule]);
    return React.createElement("button", { type: "button", ref: ref, className: `oc8-card oc8-grade-${objekt.class.toLowerCase()}`, onPointerEnter: (e) => { if (e.pointerType === 'mouse')
            rect.current = e.currentTarget.getBoundingClientRect(); }, onPointerMove: pointer, onPointerLeave: end, onPointerCancel: end, onClick: () => onChoose(objekt), "aria-label": `${objekt.memberKo} ${objekt.season} ${objekt.collectionNo} ${objekt.class} 상세` },
        React.createElement("span", { className: "oc8-card-face" },
            React.createElement(LazyObjektImage, { objekt: objekt, root: root }),
            React.createElement("span", { className: "oc8-foil", "aria-hidden": "true" }),
            React.createElement("span", { className: "oc8-card-number" },
                "#",
                objekt.collectionNo),
            React.createElement("span", { className: "oc8-card-caption" },
                React.createElement("small", null,
                    objekt.memberId,
                    " \u00B7 ",
                    objekt.memberEn.toUpperCase()),
                React.createElement("strong", null, objekt.memberKo),
                React.createElement("span", null,
                    objekt.season.toUpperCase(),
                    " \u00B7 ",
                    objekt.class.toUpperCase(),
                    " CLASS"))));
});
function CreditFooter() {
    return React.createElement("footer", { className: "oc8-credit" },
        React.createElement("b", null, "WAV ARCHIVE \u00B7 OBJECT COLLECTION"),
        React.createElement("p", null,
            "Data source references: ",
            React.createElement("a", { href: "https://objekt.top/?artist=tripleS", target: "_blank", rel: "noreferrer noopener" }, "objekt.top"),
            " \u00B7 ",
            React.createElement("a", { href: "https://apollo.cafe/", target: "_blank", rel: "noreferrer noopener" }, "apollo.cafe")),
        React.createElement("span", null, "Fan-made visual archive · Data and image credits belong to their respective sources · Not affiliated with MODHAUS."));
}
/** Default feeds are local exported snapshots. No unofficial external endpoint is invented. */
export function RealDataObjektCollection({ membersUrl = './members.json', feeds = DEFAULT_FEEDS }) {
    const [members, setMembers] = useState([]);
    const [remotePayloads, setRemotePayloads] = useState([]);
    const [report, setReport] = useState(EMPTY_REPORT);
    const [indexing, setIndexing] = useState(false);
    const [filePayloads, setFilePayloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState([]);
    const [refresh, setRefresh] = useState(0);
    // Validated GitHub snapshot is the primary source. Optional live requests live in advanced settings.
    // Avoid redundant cross-origin requests that consistently fail in mobile browsers.
    const [liveEnabled, setLiveEnabled] = useState(false);
    const [sourceStatus, setSourceStatus] = useState('loading');

    const [flipped, setFlipped] = useState(false);
    const [season, setSeason] = useState('ALL');
    const [member, setMember] = useState('ALL');
    const [klass, setKlass] = useState('ALL');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [selectedSource, setSelectedSource] = useState('objekt.top');
    const scrollRef = useRef(null);
    const measureRef = useRef(null);
    const width = useElementWidth(measureRef);
    const seq = useRef(0);
    const memberKey = member;
    const feedIds = useMemo(() => feeds.map(x => `${x.source}|${x.url}|${x.remoteFilters ? 'q' : ''}`).join('::'), [feeds]);
    useEffect(() => {
        const controller = new AbortController();
        const requestId = ++seq.current;
        const timeout = window.setTimeout(() => controller.abort('timeout'), 30000);
        setLoading(true);
        setError([]);
        setSourceStatus('loading');
        const load = async () => {
            const masterRes = await fetch(membersUrl, { signal: controller.signal, cache: 'force-cache' });
            if (!masterRes.ok)
                throw Error(`멤버 DB HTTP ${masterRes.status}`);
            const master = await masterRes.json();
            if (!Array.isArray(master) || master.length !== 24)
                throw Error('S01~S24 멤버 DB 불일치');
            const results = await Promise.all(feeds.map(async (cfg) => {
                try {
                    const res = await fetch(new URL(cfg.url, document.baseURI).href, { signal: controller.signal, cache: 'no-cache' });
                    if (!res.ok)
                        throw Error(`${cfg.source} snapshot HTTP ${res.status}`);
                    return { feed: { source: cfg.source, payload: await res.json(), sourceUrl: `https://${cfg.source}/` }, error: null };
                }
                catch (err) {
                    if (controller.signal.aborted)
                        throw err;
                    return { feed: null, error: `로컬 스냅샷 ${cfg.source}: ${err instanceof Error ? err.message : '실패'}` };
                }
            }));
            const snapshots = results.flatMap(x => x.feed ? [x.feed] : []);
            const errors = results.flatMap(x => x.error ? [x.error] : []);
            let liveFeed = null;
            if (liveEnabled) {
                try {
                    const response = await fetch(OBJEKT_TOP_COLLECTIONS_ENDPOINT, {
                        signal: controller.signal, cache: 'no-cache', mode: 'cors', credentials: 'omit',
                        headers: { Accept: 'application/json' }
                    });
                    if (!response.ok)
                        throw Error(`HTTP ${response.status}`);
                    const body = await response.json();
                    if (!Array.isArray(body) && (typeof body !== 'object' || body === null))
                        throw Error('JSON 응답 형식이 올바르지 않음');
                    liveFeed = { source: 'objekt.top', payload: body, sourceUrl: 'https://objekt.top/?artist=tripleS' };
                }
                catch (err) {
                    if (controller.signal.aborted)
                        throw err;
                    errors.push(`실시간 연결: ${err instanceof Error ? err.message : '접속할 수 없음'}`);
                }
            }
            if (controller.signal.aborted || requestId !== seq.current)
                return;
            setMembers(master);
            setRemotePayloads(liveFeed ? [...snapshots, liveFeed] : snapshots);
            setSourceStatus(liveFeed ? 'live' : snapshots.some(item => unwrapRows(item.payload).length > 0) ? 'snapshot' : 'unavailable');

            setError(errors);
        };
        load().catch(err => {
            if (controller.signal.aborted || requestId !== seq.current)
                return;
            setError([err instanceof Error ? err.message : '데이터 로딩 실패']);
            setSourceStatus('unavailable');
        }).finally(() => {
            window.clearTimeout(timeout);
            if (!controller.signal.aborted && requestId === seq.current)
                setLoading(false);
        });
        return () => { window.clearTimeout(timeout); controller.abort(); };
        // A filter never forces an API refetch. Only explicit refresh and LIVE toggle do.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [membersUrl, feedIds, refresh, liveEnabled]);
    useEffect(() => {
        if (!members.length) {
            setReport(EMPTY_REPORT);
            return;
        }
        const feedsNow = [...remotePayloads, ...filePayloads];
        let cancelled = false;
        let worker = null;
        setIndexing(true);
        const done = (next) => {
            if (cancelled)
                return;
            setReport(next);
            setIndexing(false);
        };
        const fallback = () => {
            // Fallback in older browsers that disallow module workers.
            try {
                done(transformObjektData(feedsNow, members));
            }
            catch {
                if (!cancelled)
                    setIndexing(false);
            }
        };
        try {
            if (typeof Worker === 'undefined') {
                fallback();
                return () => { cancelled = true; };
            }
            worker = new Worker('./normalize.worker.mjs', { type: 'module' });
            worker.onmessage = (event) => {
                if (event.data.ok && event.data.report)
                    done(event.data.report);
                else
                    fallback();
            };
            worker.onerror = () => fallback();
            worker.postMessage({ id: 1, feeds: feedsNow, members });
        }
        catch {
            fallback();
        }
        return () => { cancelled = true; worker?.terminate(); };
    }, [remotePayloads, filePayloads, members]);
    const seasons = useMemo(() => ['ALL', ...new Set(report.rows.map(x => x.season).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })))], [report.rows]);
    const deferred = React.useDeferredValue(search.trim().toLowerCase());
    const filtered = useMemo(() => report.rows.filter(o => (season === 'ALL' || o.season === season) && (member === 'ALL' || o.memberId === member) &&
        (klass === 'ALL' || o.class === klass) &&
        (!deferred || `${o.collectionNo} ${o.season} ${o.memberKo} ${o.memberEn} ${o.memberId} ${o.class}`.toLowerCase().includes(deferred))).sort((a, b) => num(a) - num(b) || a.season.localeCompare(b.season) || a.memberId.localeCompare(b.memberId)), [report.rows, season, member, klass, deferred]);
    const columns = width < 480 ? 2 : width < 770 ? 3 : width < 1030 ? 4 : 5;
    const gap = 12;
    const cardWidth = Math.max(115, (width - gap * (columns - 1)) / columns);
    const rowHeight = Math.ceil(cardWidth * 1.51 + gap);
    const rows = Math.ceil(filtered.length / columns);
    const virtualizer = useVirtualizer({ count: rows, getScrollElement: () => scrollRef.current, estimateSize: () => rowHeight, overscan: 2 });
    useEffect(() => { virtualizer.measure(); virtualizer.scrollToIndex(0); }, [season, member, klass, search, columns, rowHeight]);
    const onImport = useCallback(async (e) => {
        const input = e.currentTarget;
        const file = input.files?.[0];
        if (!file)
            return;
        try {
            if (file.size > 12 * 1024 * 1024)
                throw new Error('JSON file is over 12MB. Split into chunks.');
            const parsed = JSON.parse(await file.text());
            if (!Array.isArray(parsed) && (typeof parsed !== 'object' || !parsed))
                throw new Error('Expected JSON array or an object with an items/collections/data array');
            setFilePayloads(prev => [...prev, { source: selectedSource, payload: parsed, sourceUrl: `https://${selectedSource}/` }]);
            setError([]);
        }
        catch (err) {
            setError([err instanceof Error ? err.message : 'Invalid JSON']);
        }
        input.value = '';
    }, [selectedSource]);
    const onChoose = useCallback((o) => { setSelected(o); setFlipped(false); }, []);
    useEffect(() => {
        if (!selected)
            return;
        const escape = (e) => { if (e.key === 'Escape')
            setSelected(null); };
        document.addEventListener('keydown', escape);
        return () => document.removeEventListener('keydown', escape);
    }, [selected]);
    return React.createElement("main", { className: "oc8-page" },
        React.createElement("section", { className: "oc8-hero" },
            React.createElement("div", { className: "oc8-brow" }, "WAV ARCHIVE / 11.5 / DATA ENGINE"),
            React.createElement("h1", null,
                "OBJECT",
                React.createElement("br", null),
                React.createElement("em", null, "COLLECTION.")),
            React.createElement("p", null, "24\uBA85\uC758 \uAC00\uB2A5\uC131\uC744 \uAE30\uB85D\uD558\uB2E4 \u00B7 \uC2DC\uC98C\uACFC \uBA64\uBC84\uB97C \uAC00\uB85C\uC9C0\uB974\uB294 Objekt \uBA54\uD0C0\uB370\uC774\uD130 \uC544\uCE74\uC774\uBE0C"),
            React.createElement("div", { className: "oc8-hero-stats" },
                React.createElement("span", null,
                    React.createElement("b", null, report.rows.length.toLocaleString('ko-KR')),
                    " indexed designs"),
                React.createElement("span", null,
                    React.createElement("b", null, new Set(report.rows.map(o => o.season)).size),
                    " seasons"),
                React.createElement("span", null,
                    React.createElement("b", null,
                        new Set(report.rows.map(o => o.memberId)).size,
                        "/24"),
                    " members")),
            React.createElement("div", { className: "oc9-live-status" },
                React.createElement("span", { className: "oc10-public-status", role: "status" },
                    React.createElement("span", { className: `oc9-status-dot oc9-${sourceStatus}` }),
                    loading || indexing ? '컬렉션 준비 중' : sourceStatus === 'snapshot' ? '컬렉션 불러옴' : sourceStatus === 'live' ? '컬렉션 연결됨' : '데이터 확인 필요'),
                React.createElement("button", { type: "button", onClick: () => window.parent.postMessage({ type: 'WA_OBJEKT_CLOSE' }, window.location.origin) }, "\u2190 \uC544\uCE74\uC774\uBE0C\uB85C \uB3CC\uC544\uAC00\uAE30"))),
        React.createElement("section", { className: "oc8-toolbar", "aria-label": "Objekt filters" },
            React.createElement("div", { className: "oc8-toolbar-top" },
                React.createElement("span", null, "SEASON INDEX"),
                React.createElement("button", { onClick: () => setRefresh(x => x + 1), type: "button", "aria-label": "컬렉션 새로고침" }, "\u21BB 새로고침")),
            React.createElement("div", { className: "oc8-chipline" }, seasons.map(s => React.createElement("button", { className: s === season ? 'active' : '', type: "button", key: s, "aria-pressed": s === season, onClick: () => setSeason(s) }, s))),
            React.createElement("div", { className: "oc8-toolbar-top" },
                React.createElement("span", null, "MEMBER SELECT"),
                React.createElement("span", null, member === 'ALL' ? 'ALL 24 MEMBERS' : member)),
            React.createElement("div", { className: "oc8-memberstrip" },
                React.createElement("button", { type: "button", className: member === 'ALL' ? 'active' : '', onClick: () => setMember('ALL') },
                    React.createElement("span", { className: "oc8-all-member" }, "24"),
                    React.createElement("b", null, "ALL")),
                members.map(m => React.createElement("button", { type: "button", key: m.id, className: member === m.id ? 'active' : '', "aria-pressed": member === m.id, onClick: () => setMember(m.id) },
                    React.createElement("img", { src: m.portraitUrl, alt: "", loading: "lazy", decoding: "async" }),
                    React.createElement("b", null, m.id),
                    React.createElement("small", null, m.nameKo)))),
            React.createElement("div", { className: "oc8-controls" },
                React.createElement("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "\uBA64\uBC84 \u00B7 \uC2DC\uC98C \u00B7 \uCE74\uB4DC \uBC88\uD638 \uAC80\uC0C9", "aria-label": "Objekt search" }),
                React.createElement("select", { value: klass, onChange: e => setKlass(e.target.value), "aria-label": "Class filter" }, CLASS_OPTIONS.map(c => React.createElement("option", { key: c, value: c }, c === 'ALL' ? 'ALL CLASSES' : `${c.toUpperCase()} CLASS`))))),
        React.createElement("section", { className: "oc8-library", "aria-label": "Objekt catalog" },
            React.createElement("div", { className: "oc8-library-head" },
                React.createElement("div", null,
                    React.createElement("span", null, "OBJECT LIBRARY / WAV ARCHIVE"),
                    React.createElement("h2", null,
                        filtered.length.toLocaleString('ko-KR'),
                        " OBJEKTS")),
                React.createElement("p", null, "컬렉션 번호순 · 멤버 및 시즌별 탐색")),
            React.createElement("div", { className: "oc8-grid-measure", ref: measureRef },
                React.createElement("div", { ref: scrollRef, className: "oc8-scroll" },
                    (loading || indexing) && React.createElement("div", { className: "oc8-message" }, loading ? '데이터 동기화 중…' : '카드 인덱스 생성 중…'),
                    !loading && !indexing && !filtered.length && React.createElement("div", { className: "oc8-message" },
                        React.createElement("strong", null, report.rows.length > 0 ? "검색 결과가 없어요." : "컬렉션을 불러올 수 없어요."),
                        React.createElement("p", null, report.rows.length > 0 ? "다른 멤버나 시즌을 선택해 보세요." : "컬렉션 데이터를 확인한 후 새로고침해 주세요."),
                        report.rows.length > 0 && React.createElement("button", { className: "oc10-reset-filters", type: "button", onClick: () => { setSeason('ALL'); setMember('ALL'); setKlass('ALL'); setSearch(''); } }, "전체 컬렉션 보기")),
                    !indexing && !!filtered.length && React.createElement("div", { className: "oc8-virtual-body", style: { height: virtualizer.getTotalSize() } }, virtualizer.getVirtualItems().map(v => {
                        const offset = v.index * columns;
                        return React.createElement("div", { key: v.key, className: "oc8-grid-row", style: { transform: `translate3d(0,${v.start}px,0)`, height: rowHeight } }, filtered.slice(offset, offset + columns).map(o => React.createElement(Card, { key: o.id, objekt: o, root: scrollRef, onChoose: onChoose })));
                    })))),
            React.createElement("details", { className: "oc10-data-tools" },
                React.createElement("summary", null, "데이터 관리", React.createElement("span", { "aria-hidden": "true" }, " + ")),
                React.createElement("div", { className: "oc10-tools-panel" },
                    React.createElement("div", { className: "oc10-tools-line" },
                        React.createElement("label", null,
                            React.createElement("input", { type: "checkbox", checked: liveEnabled, onChange: e => setLiveEnabled(e.target.checked) }),
                            " 실시간 연결 시도"),
                        React.createElement("span", null, "기본 모드는 저장된 컬렉션을 사용합니다.")),
                    React.createElement("div", { className: "oc8-import" },
                        React.createElement("div", null,
                            React.createElement("b", null, "JSON IMPORT"),
                            React.createElement("p", null, "컬렉션 JSON을 직접 불러올 수 있습니다.")),
                        React.createElement("div", { className: "oc8-import-buttons" },
                            React.createElement("select", { value: selectedSource, onChange: e => setSelectedSource(e.target.value), "aria-label": "Import source" },
                                React.createElement("option", { value: "objekt.top" }, "objekt.top"),
                                React.createElement("option", { value: "apollo.cafe" }, "apollo.cafe"),
                                React.createElement("option", { value: "local" }, "LOCAL VERIFIED")),
                            React.createElement("label", null,
                                "+ JSON 가져오기",
                                React.createElement("input", { type: "file", accept: ".json,application/json", onChange: onImport })),
                            React.createElement("button", { onClick: () => setFilePayloads([]), type: "button" }, "초기화"))),
                    React.createElement("div", { className: "oc8-audit" },
                        React.createElement("span", null, "중복 병합 ", report.duplicates),
                        React.createElement("span", null, "매핑 제외 ", report.skipped),
                        React.createElement("span", null, "데이터 상태 ", sourceStatus.toUpperCase())),
                    error.length > 0 && React.createElement("div", { className: "oc10-debug-log" }, error.map((x, i) => React.createElement("p", { key: i }, x))))),
            React.createElement(CreditFooter, null)),
        selected && React.createElement("div", { className: "oc8-modal-backdrop", role: "presentation", onPointerDown: e => { if (e.target === e.currentTarget)
                setSelected(null); } },
            React.createElement("section", { className: "oc8-modal", role: "dialog", "aria-modal": "true", "aria-label": `${selected.memberKo} Objekt detail` },
                React.createElement("button", { className: "oc8-close", onClick: () => setSelected(null), "aria-label": "\uB2EB\uAE30", type: "button" }, "\u00D7"),
                React.createElement("h2", null,
                    selected.memberKo,
                    " ",
                    React.createElement("small", null, selected.memberId)),
                React.createElement("p", null,
                    selected.season,
                    " \u00B7 #",
                    selected.collectionNo,
                    " \u00B7 ",
                    selected.class,
                    " Class"),
                React.createElement("div", { className: "oc8-detail-image" },
                    React.createElement(LazyObjektImage, { objekt: selected, detail: true, back: flipped })),
                selected.backImageUrl && React.createElement("button", { type: "button", className: "oc9-flip-btn", onClick: () => setFlipped(x => !x) },
                    "\u21BB ",
                    flipped ? '앞면 보기' : '뒷면 보기'),
                React.createElement("strong", null, "DATA PROVENANCE"),
                React.createElement("p", null, selected.sourceNames.join(' · ')),
                React.createElement("div", { className: "oc8-source-links" }, selected.sourceUrls.map(u => React.createElement("a", { key: u, href: u, target: "_blank", rel: "noreferrer noopener" }, "\uC6D0\uBCF8 \uCD9C\uCC98 \u2197"))))));
}
const mount = document.getElementById('root');
if (mount)
    createRoot(mount).render(React.createElement(RealDataObjektCollection, null));
