import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listTempleOptions } from '$lib/server/api/temples';
import type { RequestHandler } from './$types';

/** Browser-facing proxy for the temple dropdown (search + paging); keeps the backend URL/key server-side. */
export const GET: RequestHandler = async ({ url, fetch }) => {
	const page = Number(url.searchParams.get('page'));
	// Backend caps `q` at 100 chars and rejects longer input.
	const q = url.searchParams.get('q')?.trim().slice(0, 100) || undefined;

	try {
		const data = await listTempleOptions(fetch, {
			page: Number.isInteger(page) && page > 0 ? page : undefined,
			q
		});
		return json(data);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
