import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getMemorial } from '$lib/server/api/memorials';
import { currentPhotoUrl } from '$lib/server/memorial-photo';
import { memorialPhotoEnabled } from '$lib/server/memorial-config';
import { memorialToken } from '$lib/server/memorial-guard';
import type { RequestHandler } from './$types';

function parseId(raw: string): number | null {
	if (!/^\d+$/.test(raw)) return null;
	const id = Number(raw);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Same-origin portrait proxy. The signed GCS URL never reaches the browser/HTML; the page only
 * carries `/memorial/{id}/photo`. A 403 means the signature expired: refresh once, no loop (W1).
 * / Proxy ảnh cùng origin, giấu signed URL; hết hạn thì lấy lại một lần.
 */
export const GET: RequestHandler = async ({ locals, cookies, fetch, params, setHeaders }) => {
	setHeaders({
		'Cache-Control': 'private, no-store',
		'Referrer-Policy': 'no-referrer',
		'X-Content-Type-Options': 'nosniff'
	});
	if (!memorialPhotoEnabled()) throw error(404, 'Not found');

	const token = memorialToken(locals, cookies);
	if (!token) throw error(401, 'Unauthorized');

	const id = parseId(params.id);
	if (id === null) throw error(404, 'Not found');

	let upstream: Response;
	try {
		const url = await currentPhotoUrl(() => getMemorial(fetch, token, id));
		if (!url) throw error(404, 'Not found');
		upstream = await fetch(url);
		if (upstream.status === 403) {
			// Signature expired: ask the API for a fresh one, then retry exactly once.
			const refreshed = await currentPhotoUrl(() => getMemorial(fetch, token, id));
			if (!refreshed) throw error(404, 'Not found');
			upstream = await fetch(refreshed);
		}
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status === 404 ? 404 : 502, 'Photo unavailable');
		throw e;
	}

	if (!upstream.ok || !upstream.body) throw error(404, 'Not found');

	return new Response(upstream.body, {
		headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg' }
	});
};
