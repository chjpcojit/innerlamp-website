import { ApiError } from '$lib/server/api/client';
import { getMe } from '$lib/server/api/users';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import { updateProfile } from '$lib/features/profile/server/update-profile';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	if (!locals.user || !token) return { profile: null };

	try {
		return { profile: await getMe(fetch, token) };
	} catch (e) {
		// Editing needs the current values; the page shows a notice instead of an empty form.
		if (!(e instanceof ApiError)) throw e;
		return { profile: null };
	}
};

export const actions: Actions = {
	default: updateProfile
};
