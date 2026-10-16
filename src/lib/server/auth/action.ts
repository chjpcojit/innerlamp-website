import { fail } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';

/** Turn a backend failure into a form-action failure carrying the error code for the UI. */
export function authFail(e: unknown, extra: Record<string, unknown> = {}) {
	if (!(e instanceof ApiError)) throw e;
	return fail(e.status >= 400 && e.status < 600 ? e.status : 502, {
		error: e.code,
		retryAfter:
			typeof e.details.retry_after_seconds === 'number' ? e.details.retry_after_seconds : undefined,
		lockedUntil: typeof e.details.locked_until === 'string' ? e.details.locked_until : undefined,
		...extra
	});
}
