import { error } from '@sveltejs/kit';
import { findTemple } from '$lib/content/temples';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	if (!findTemple(params.slug)) error(404);
	return { id: params.slug };
};
