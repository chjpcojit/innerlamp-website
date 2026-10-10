import { redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { logout } from '$lib/server/api/auth';
import { TOKEN_COOKIE, endSession } from '$lib/server/auth/session';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async ({ cookies, fetch }) => {
		const token = cookies.get(TOKEN_COOKIE);
		// Best effort: the local session is cleared even if the backend is unreachable.
		if (token) await logout(fetch, token).catch(() => {});
		endSession(cookies);
		redirect(303, localizeHref('/'));
	}
};
