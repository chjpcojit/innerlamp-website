import { redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { ApiError } from '$lib/server/api/client';
import { logout } from '$lib/server/api/auth';
import { getMe } from '$lib/server/api/users';
import { TOKEN_COOKIE, endSession } from '$lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	if (!locals.user || !token) return { profile: null };

	try {
		return { profile: await getMe(fetch, token) };
	} catch (e) {
		// Keep the page usable with the name cached at login if the profile can't be loaded.
		if (!(e instanceof ApiError)) throw e;
		return { profile: null };
	}
};

export const actions: Actions = {
	logout: async ({ cookies, fetch }) => {
		const token = cookies.get(TOKEN_COOKIE);
		// Best effort: the local session is cleared even if the backend is unreachable.
		if (token) await logout(fetch, token).catch(() => {});
		endSession(cookies);
		redirect(303, localizeHref('/'));
	}
};
