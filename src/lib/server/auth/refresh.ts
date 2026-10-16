import type { Cookies } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { refreshTokens } from '$lib/server/api/auth';
import type { AuthTokens } from '$lib/types/auth';
import { REFRESH_COOKIE, endSession, setTokens } from './session';

type Fetch = typeof globalThis.fetch;

// The backend rotates the refresh token without a grace window, so parallel requests that carry
// the same token must share one call. / Các request song song dùng chung một lần refresh.
const inFlight = new Map<string, Promise<AuthTokens>>();

/** A 4xx that means the token is dead; rate limits and a bad site key say nothing about it. */
const isRejection = (e: unknown) =>
	e instanceof ApiError &&
	e.status >= 400 &&
	e.status < 500 &&
	e.status !== 429 &&
	e.code !== 'INVALID_API_KEY';

export type RefreshResult = 'refreshed' | 'rejected' | 'unavailable' | 'none';

/**
 * Renews the token cookies from the refresh cookie. `rejected` = the backend refused the token
 * (session ended, cookies cleared); `unavailable` = outage, cookies kept.
 */
export async function refreshSession(fetch: Fetch, cookies: Cookies): Promise<RefreshResult> {
	const refresh = cookies.get(REFRESH_COOKIE);
	if (!refresh) return 'none';

	let pending = inFlight.get(refresh);
	if (!pending) {
		pending = refreshTokens(fetch, refresh).finally(() => inFlight.delete(refresh));
		inFlight.set(refresh, pending);
	}

	try {
		setTokens(cookies, await pending);
		return 'refreshed';
	} catch (e) {
		if (isRejection(e)) {
			endSession(cookies);
			return 'rejected';
		}
		return 'unavailable';
	}
}
