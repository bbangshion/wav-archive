const obj = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const str = (value) => typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
const key = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
function pick(record, ...paths) {
    for (const path of paths) {
        const v = path.split('.').reduce((cur, k) => obj(cur) ? cur[k] : undefined, record);
        if (v !== null && v !== undefined && (obj(v) || str(v)))
            return v;
    }
    return null;
}
const aliases = {
    seoyeon: 'S01', hyerin: 'S02', hyelin: 'S02', jiwoo: 'S03', chaeyeon: 'S04',
    yooyeon: 'S05', yuyeon: 'S05', soomin: 'S06', nakyoung: 'S07', nakyung: 'S07',
    yubin: 'S08', kaede: 'S09', dahyun: 'S10', kotone: 'S11', yeonji: 'S12',
    nien: 'S13', sohyun: 'S14', xinyu: 'S15', shinyu: 'S15', mayu: 'S16', lynn: 'S17',
    joobin: 'S18', jubin: 'S18', hayeon: 'S19', shion: 'S20', sion: 'S20',
    chaewon: 'S21', sullin: 'S22', seoah: 'S23', jiyeon: 'S24'
};
export function createMemberResolver(members) {
    const lookup = new Map();
    for (const m of members)
        for (const x of [m.id, m.nameKo, m.nameEn])
            lookup.set(key(x), m);
    const byId = new Map(members.map(m => [m.id, m]));
    for (const [alias, id] of Object.entries(aliases)) {
        const m = byId.get(id);
        if (m)
            lookup.set(key(alias), m);
    }
    return (raw) => {
        if (obj(raw))
            return lookup.get(key(str(raw.id ?? raw.name ?? raw.slug ?? raw.member))) ?? null;
        return lookup.get(key(str(raw))) ?? null;
    };
}
export function normalizeCollectionNo(raw) {
    const s = str(raw).toUpperCase().replace(/^#/, '').replace(/[\s_-]+/g, '');
    if (/^[A-Z]{0,3}\d{3,4}[A-Z]?$/.test(s))
        return s;
    // Do not infer a collection number from a minted serial, UUID or slug.
    return null;
}
export function normalizeSeason(raw) {
    const s = obj(raw) ? str(raw.name ?? raw.slug ?? raw.season) : str(raw);
    const match = s.match(/^([A-Za-z]{3,20})[\s_-]*0?(\d{1,2})$/);
    if (!match)
        return null;
    return match[1].slice(0, 1).toUpperCase() + match[1].slice(1).toLowerCase() + String(Number(match[2])).padStart(2, '0');
}
export function normalizeClass(raw) {
    const v = key(str(obj(raw) ? raw.name : raw));
    const types = [
        [/first|fco/, 'First'], [/special|sco/, 'Special'], [/double|dco/, 'Double'],
        [/premier|premium|pco/, 'Premier'], [/welcome|wco/, 'Welcome'],
        [/zero|zco/, 'Zero'], [/unit|uco/, 'Unit'], [/motion|mco/, 'Motion']
    ];
    return types.find(([re]) => re.test(v))?.[1] ?? 'Unknown';
}
export function safeImageUrl(raw) {
    const s = str(raw);
    if (!s)
        return null;
    if (/^\.\/[a-z\d_./-]+\.(webp|png|jpe?g|avif)$/i.test(s) && !s.includes('..'))
        return s;
    try {
        const u = new URL(s);
        if (u.protocol !== 'https:' || !!u.username || !!u.password)
            return null;
        if (/\.(?:html?|js|svg)$/i.test(u.pathname))
            return null;
        return u.href;
    }
    catch {
        return null;
    }
}
export function unwrapRows(input) {
    if (Array.isArray(input))
        return input;
    if (!obj(input))
        return [];
    for (const name of ['collections', 'items', 'objekts', 'results', 'rows', 'data']) {
        const v = input[name];
        if (Array.isArray(v))
            return v;
        if (obj(v)) {
            const inner = unwrapRows(v);
            if (inner.length)
                return inner;
        }
    }
    return [];
}
const color = (input) => /^#[\da-f]{6}$/i.test(str(input)) ? str(input) : null;
const iso = (input) => /^\d{4}-\d{2}-\d{2}T/.test(str(input)) ? str(input) : null;
function parseRow(raw, source, resolve, sourceUrl) {
    if (!obj(raw))
        return { reason: 'invalid-row' };
    const artistRaw = pick(raw, 'artist.name', 'artist', 'group', 'artistName');
    const artist = str(obj(artistRaw) ? artistRaw.name : artistRaw);
    if (artist && key(artist) !== 'triples')
        return { reason: 'other-artist' };
    const memberRaw = pick(raw, 'memberId', 'member.id', 'member.name', 'member', 'memberName', 'memberSlug', 'artistMember.name', 'artistMember');
    const member = resolve(memberRaw);
    // Official catalog also contains partner/unit/team cards. Keep them in the full
    // archive without forcing a fictional owner or changing S01–S24 member records.
    const membersList = Array.isArray(raw.members) ? raw.members : [];
    const relatedMembers = [...new Map(membersList.map(resolve).filter(Boolean).map(m => [m.id, m])).values()];
    const sourceGroupName = str(memberRaw).slice(0, 70);
    const isGroup = !member && !!sourceGroupName && membersList.length > 0 &&
        membersList.some(v => str(v) === sourceGroupName);
    if (!member && !isGroup)
        return { reason: 'unknown-member' };
    const linkedIds = member ? [member.id] : relatedMembers.map(m => m.id);
    const catalogMemberId = member ? member.id : 'GROUP';
    const catalogMemberNameKo = member ? member.nameKo : sourceGroupName;
    const catalogMemberNameEn = member ? member.nameEn : sourceGroupName;
    const season = normalizeSeason(pick(raw, 'season.name', 'season', 'seasonName', 'seasonId', 'era'));
    if (!season)
        return { reason: 'invalid-season' };
    const collectionNo = normalizeCollectionNo(pick(raw, 'collectionNo', 'collectionNumber', 'collection_no', 'collection.collectionNo', 'collection.number', 'cardNumber', 'collectionId', 'number', 'code', 'collection'));
    if (!collectionNo)
        return { reason: 'invalid-collection-number' };
    const klass = normalizeClass(pick(raw, 'class.name', 'class', 'className', 'objektClass', 'rarity', 'grade'));
    const thumb = safeImageUrl(pick(raw, 'thumbnailImage', 'thumbnailUrl', 'images.thumbnail', 'image.thumbnail'));
    const front = safeImageUrl(pick(raw, 'frontImage', 'frontImageUrl', 'image.front', 'images.front', 'imageUrl', 'image.url', 'image', 'metadata.image'));
    const back = safeImageUrl(pick(raw, 'backImage', 'backImageUrl', 'images.back', 'image.back'));
    const original = safeImageUrl(pick(raw, 'originalFrontImage', 'originalFrontImageUrl', 'images.originalFront'));
    const local = safeImageUrl(pick(raw, 'localImageUrl', 'localImage', 'localWebp'));
    const link = str(pick(raw, 'sourceUrl', 'permalink'));
    const citation = (link.startsWith('https://') ? link : sourceUrl?.startsWith('https://') ? sourceUrl : '');
    const groupSuffix = !member ? `:${key(sourceGroupName)}` : '';
    const id = `${season}:${catalogMemberId}:${klass}:${collectionNo}${groupSuffix}`;
    return { row: { id, artist: 'tripleS', memberId: catalogMemberId,
            memberIds: linkedIds, memberKo: catalogMemberNameKo, memberEn: catalogMemberNameEn,
            season, collectionNo, class: klass, unitTag: str(pick(raw, 'unit', 'unitTag', 'dimension')) || (isGroup ? sourceGroupName : null),
            thumbnailUrl: thumb, imageUrl: front, backImageUrl: back, originalFrontImageUrl: original, localImageUrl: local,
            mediaState: thumb || front || original || local ? 'provided-url' : 'unavailable', sourceNames: [source], sourceUrls: citation ? [citation] : [],
            originalId: str(pick(raw, 'id', 'slug', 'collectionId')) || null,
            isOffline: typeof raw.onOffline === 'string' ? raw.onOffline.toLowerCase() === 'offline' : typeof raw.onOffline === 'boolean' ? raw.onOffline : null,
            backgroundColor: color(raw.backgroundColor), createdAt: iso(raw.createdAt)
        } };
}
export function transformObjektData(feeds, members) {
    const resolve = createMemberResolver(members);
    const map = new Map();
    const skipReasons = {};
    let duplicates = 0;
    for (const feed of feeds)
        for (const raw of unwrapRows(feed.payload)) {
            const result = parseRow(raw, feed.source, resolve, feed.sourceUrl);
            if (!result.row) {
                const reason = result.reason ?? 'invalid';
                skipReasons[reason] = (skipReasons[reason] ?? 0) + 1;
                continue;
            }
            const next = result.row;
            const old = map.get(next.id);
            if (!old) {
                map.set(next.id, next);
                continue;
            }
            duplicates++;
            map.set(next.id, { ...old,
                thumbnailUrl: old.thumbnailUrl ?? next.thumbnailUrl, imageUrl: old.imageUrl ?? next.imageUrl,
                backImageUrl: old.backImageUrl ?? next.backImageUrl, originalFrontImageUrl: old.originalFrontImageUrl ?? next.originalFrontImageUrl,
                localImageUrl: old.localImageUrl ?? next.localImageUrl, unitTag: old.unitTag ?? next.unitTag,
                mediaState: old.mediaState === 'provided-url' || next.mediaState === 'provided-url' ? 'provided-url' : 'unavailable',
                sourceNames: [...new Set([...old.sourceNames, ...next.sourceNames])], sourceUrls: [...new Set([...old.sourceUrls, ...next.sourceUrls])],
                backgroundColor: old.backgroundColor ?? next.backgroundColor, createdAt: old.createdAt ?? next.createdAt
            });
        }
    const rows = [...map.values()].sort((a, b) => a.season.localeCompare(b.season, undefined, { numeric: true }) ||
        (Number(a.collectionNo.match(/\d+/)?.[0] ?? 0) - Number(b.collectionNo.match(/\d+/)?.[0] ?? 0)) ||
        a.memberId.localeCompare(b.memberId) || a.collectionNo.localeCompare(b.collectionNo));
    return { rows, skipped: Object.values(skipReasons).reduce((a, b) => a + b, 0), skipReasons, duplicates, sources: [...new Set(feeds.map(x => x.source))] };
}
/** Prefer a compact thumbnail on grids; only load full-size when detail opens. */
export function resolveObjektImage(objekt, detail = false) {
    return detail ?
        objekt.localImageUrl ?? objekt.imageUrl ?? objekt.originalFrontImageUrl ?? objekt.thumbnailUrl ?? null :
        objekt.localImageUrl ?? objekt.thumbnailUrl ?? objekt.imageUrl ?? null;
}
export const OBJEKT_TOP_COLLECTIONS_ENDPOINT = 'https://objekt.top/api/v1/collections?artist=triples';
