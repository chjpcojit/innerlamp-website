import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { SessionUser } from '$lib/types/user';
import type { AuthSession, AuthTokens } from '$lib/types/auth';

export const TOKEN_COOKIE = 'il_token';
export const REFRESH_COOKIE = 'il_refresh';
export const NAME_COOKIE = 'il_name';

// Fallbacks when the backend omits `expires_in` (its dev TTLs: access 15m, refresh 7d).
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const cookieOptions = (maxAge: number) =>
	({ path: '/', httpOnly: true, sameSite: 'lax', secure: !dev, maxAge }) as const;

/**
 * Resolve the visitor from httpOnly cookies. The display name is cached at login and
 * refreshed from `GET /v1/users/me` on the home page. An expired access cookie is renewed
 * in the hook.
 */
export function getSessionUser(cookies: Cookies): SessionUser | null {
	if (!cookies.get(TOKEN_COOKIE)) return null;
	return { name: cookies.get(NAME_COOKIE) ?? '' };
}

export function setTokens(cookies: Cookies, tokens: AuthTokens): void {
	cookies.set(
		TOKEN_COOKIE,
		tokens.access_token,
		cookieOptions(tokens.expires_in ?? ACCESS_MAX_AGE)
	);
	cookies.set(REFRESH_COOKIE, tokens.refresh_token, cookieOptions(REFRESH_MAX_AGE));
}

/** Persist a backend session: tokens plus the display name (dharma name, else full name). */
export function startSession(cookies: Cookies, session: AuthSession): void {
	setTokens(cookies, session);
	const name = session.user.dharma_name || session.user.full_name || '';
	cookies.set(NAME_COOKIE, name, cookieOptions(REFRESH_MAX_AGE));
}

export function setDisplayName(cookies: Cookies, name: string): void {
	cookies.set(NAME_COOKIE, name, cookieOptions(REFRESH_MAX_AGE));
}

export function endSession(cookies: Cookies): void {
	for (const name of [TOKEN_COOKIE, REFRESH_COOKIE, NAME_COOKIE]) {
		cookies.delete(name, { path: '/' });
	}
}
