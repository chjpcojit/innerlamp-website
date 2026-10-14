import { apiCall } from './client';
import type { UserProfile, UserProfileUpdate } from '$lib/types/user';

type Fetch = typeof globalThis.fetch;

// The backend rate-limits `/v1/users/me*` to 10 requests/minute/account (GET included),
// so repeated page loads must not each hit it.
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { profile: UserProfile; expiresAt: number }>();

/** Current user's profile. Needs the access token (a refresh token yields 401). */
export async function getMe(fetch: Fetch, token: string): Promise<UserProfile> {
	const hit = cache.get(token);
	if (hit && hit.expiresAt > Date.now()) return hit.profile;

	const profile = await apiCall<UserProfile>(fetch, '/v1/users/me', { token });

	remember(token, profile);
	return profile;
}

function remember(token: string, profile: UserProfile) {
	const now = Date.now();
	for (const [key, entry] of cache) if (entry.expiresAt <= now) cache.delete(key);
	cache.set(token, { profile, expiresAt: now + CACHE_TTL_MS });
}

/**
 * Partially updates the current user's profile (only keys present are written) and
 * returns the full updated profile, which also refreshes the cache so no extra GET is
 * spent. Shares the 10/minute limit (429 `RATE_LIMITED`). Throws `ApiError` with
 * `INVALID_TEMPLE` (unknown `ordination_temple_id`), `VALIDATION_ERROR`,
 * `INVALID_FULL_NAME`, `INVALID_DHARMA_NAME` or 401 `UNAUTHORIZED`.
 */
export async function updateMe(
	fetch: Fetch,
	token: string,
	body: UserProfileUpdate
): Promise<UserProfile> {
	const profile = await apiCall<UserProfile>(fetch, '/v1/users/me', {
		method: 'PATCH',
		body,
		token
	});
	remember(token, profile);
	return profile;
}

/** Short name for greetings/headers: dharma name, else full name, else phone. */
export const profileDisplayName = (p: UserProfile) =>
	p.dharma_name || p.full_name || p.phone_number;
