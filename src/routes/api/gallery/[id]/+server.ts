import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getGalleryImage } from '$lib/server/api/gallery';
import type { RequestHandler } from './$types';

/** Browser-facing proxy for one photo's credit (author/license); keeps the backend URL/key server-side. */
export const GET: RequestHandler = async ({ params, fetch }) => {
	try {
		return json(await getGalleryImage(fetch, params.id));
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
