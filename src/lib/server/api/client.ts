import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

type Fetch = typeof globalThis.fetch;

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	signal?: AbortSignal;
	/** The logged-in user's token (from their httpOnly cookie). Omit for public calls. */
	token?: string;
}

const DEFAULT_TIMEOUT_MS = 8000;

/** Backend error envelope: `{ success: false, error: { code, message, type }, details }`. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		/** Stable backend error code (e.g. `INVALID_CREDENTIALS`); `NETWORK_ERROR` when unreachable. */
		readonly code: string,
		readonly details: Record<string, unknown> = {}
	) {
		super(`${status} ${code}`);
	}
}

/**
 * Calls the backend and unwraps its `{ success, data }` envelope. Throws `ApiError` on
 * any failure so callers can map `code` to a translated message. Always pass SvelteKit's
 * `event.fetch` so cookies and relative requests behave correctly during SSR.
 */
export async function apiCall<T>(
	fetch: Fetch,
	path: string,
	{ method = 'GET', body, signal, token }: RequestOptions = {}
): Promise<T> {
	if (!env.API_BASE_URL) {
		error(500, 'API_BASE_URL is not configured');
	}

	const headers: Record<string, string> = { Accept: 'application/json' };
	// Identifies the website itself (shared services); sent on every call.
	if (env.API_KEY) headers['x-api-key'] = env.API_KEY;
	// Identifies the end user; only present after login.
	if (token) headers['Authorization'] = `Bearer ${token}`;
	if (body !== undefined) headers['Content-Type'] = 'application/json';

	let response: Response;
	try {
		response = await fetch(`${env.API_BASE_URL}${path}`, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
			signal: signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
		});
	} catch (cause) {
		console.error(`[api] ${method} ${path} failed`, cause);
		throw new ApiError(0, 'NETWORK_ERROR');
	}

	const payload = (await response.json().catch(() => null)) as {
		data?: T;
		error?: { code?: string };
		details?: Record<string, unknown>;
	} | null;

	if (!response.ok) {
		const code = payload?.error?.code ?? 'INTERNAL_ERROR';
		console.error(`[api] ${method} ${path} → ${response.status} ${code}`);
		throw new ApiError(response.status, code, payload?.details ?? {});
	}

	// Some endpoints (logout) return `{ success: true }` without `data`.
	return (payload?.data ?? payload) as T;
}

/** Page-load variant: converts any backend failure into a SvelteKit error page. */
export async function apiRequest<T>(
	fetch: Fetch,
	path: string,
	options: RequestOptions = {}
): Promise<T> {
	try {
		return await apiCall<T>(fetch, path, options);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		error(e.status === 404 ? 404 : 502, 'Backend API error');
	}
}
