import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getDeity } from '$lib/server/api/deities';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		return { deity: await getDeity(fetch, params.id) };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 404) error(404);
		error(502, 'Backend API error');
	}
};
