import type { Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { TOKEN_COOKIE } from '$lib/server/auth/session';

/**
 * The memorial token, or null when either the cookie session or the resolved user is missing.
 * Fail closed: callers must not reach the backend with null (W2).
 * / Token sổ giỗ, null khi thiếu cookie hoặc phiên — không gọi BE.
 */
export function memorialToken(locals: App.Locals, cookies: Cookies): string | null {
	const token = cookies.get(TOKEN_COOKIE);
	return locals.user && token ? token : null;
}

/** Page/action guard: a missing session goes to the login page before any backend call. */
export function requireMemorialSession(locals: App.Locals, cookies: Cookies): string {
	const token = memorialToken(locals, cookies);
	if (!token) redirect(303, localizeHref('/login'));
	return token;
}
