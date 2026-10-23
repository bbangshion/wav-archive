/** Normalize and sort large Objekt JSON outside the main UI thread. */
import { transformObjektData } from './objektData.mjs';
self.onmessage = (event) => {
    try {
        const { feeds, members, id } = event.data;
        const report = transformObjektData(feeds, members);
        self.postMessage({ ok: true, id, report });
    }
    catch (error) {
        self.postMessage({ ok: false, id, error: error instanceof Error ? error.message : 'worker normalization failed' });
    }
};
