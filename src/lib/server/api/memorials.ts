import { ApiError, apiCall } from './client';
import type { MemorialDTO, MemorialList, MemorialRequest } from '$lib/types/memorial';

type Fetch = typeof globalThis.fetch;

/** Fail closed before any request: a missing session never reaches the backend (W2). */
function requireToken(token: string): string {
	if (!token) throw new ApiError(401, 'UNAUTHORIZED');
	return token;
}

/**
 * Every relative in the caller's book (max 100), newest first. No pagination: do not send
 * `page`/`limit`. Needs the access token; 401 `UNAUTHORIZED` when the session is gone.
 */
export const listMemorials = async (fetch: Fetch, token: string) =>
	apiCall<MemorialList>(fetch, '/v1/memorials', { token: requireToken(token) });

/** One relative; 404 `MEMORIAL_NOT_FOUND` for unknown, malformed or another user's id alike. */
export const getMemorial = async (fetch: Fetch, token: string, id: number) =>
	apiCall<MemorialDTO>(fetch, `/v1/memorials/${id}`, { token: requireToken(token) });

/** Creates a relative; 400 `VALIDATION_ERROR` (+ `details.field`), 409 `MEMORIAL_LIMIT_REACHED`. */
export const createMemorial = async (fetch: Fetch, token: string, body: MemorialRequest) =>
	apiCall<MemorialDTO>(fetch, '/v1/memorials', {
		method: 'POST',
		body,
		token: requireToken(token)
	});

/** Replaces the whole editable document; a missing `reminder`/`note` clears it. */
export const updateMemorial = async (
	fetch: Fetch,
	token: string,
	id: number,
	body: MemorialRequest
) =>
	apiCall<MemorialDTO>(fetch, `/v1/memorials/${id}`, {
		method: 'PUT',
		body,
		token: requireToken(token)
	});

/** Hard delete: `{ success: true }` with no `data`; a repeat call is 404. */
export const deleteMemorial = async (fetch: Fetch, token: string, id: number): Promise<void> => {
	await apiCall<unknown>(fetch, `/v1/memorials/${id}`, {
		method: 'DELETE',
		token: requireToken(token)
	});
};

/**
 * Uploads/replaces the portrait: multipart with exactly one part named `photo` (JPEG/PNG/WebP,
 * ≤ 5 MiB). Returns the updated memory with a signed `photo_url` (15 minutes). Call only when
 * `MEMORIAL_PHOTO_ENABLED` is on: the route is not deployed yet (D4).
 */
export async function uploadMemorialPhoto(
	fetch: Fetch,
	token: string,
	id: number,
	photo: Blob,
	filename = 'photo.jpg'
) {
	const form = new FormData();
	form.append('photo', photo, filename);
	return apiCall<MemorialDTO>(fetch, `/v1/memorials/${id}/photo`, {
		method: 'PUT',
		body: form,
		token: requireToken(token)
	});
}

/** Removes the portrait (200 even when there was none) and returns the updated memory. */
export const deleteMemorialPhoto = async (fetch: Fetch, token: string, id: number) =>
	apiCall<MemorialDTO>(fetch, `/v1/memorials/${id}/photo`, {
		method: 'DELETE',
		token: requireToken(token)
	});
