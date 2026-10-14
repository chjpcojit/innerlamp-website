import { fail, type RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { updateMe } from '$lib/server/api/users';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { SanghaError } from '../types';

/**
 * Form action body: sets the user's practice temple to the posted `temple_id`, or removes
 * it when `temple_id` is empty. The backend writes immediately (no approval step) and the
 * updated profile refreshes the `getMe` cache, so the reloaded page shows the change
 * without spending another request of the 10/minute profile quota.
 */
export async function setSanghaTemple({ request, cookies, fetch, locals }: RequestEvent) {
	const token = cookies.get(TOKEN_COOKIE);
	if (!locals.user || !token) return fail(401, { sanghaError: 'auth' as SanghaError });

	const templeId = String((await request.formData()).get('temple_id') ?? '').trim();
	try {
		await updateMe(fetch, token, { ordination_temple_id: templeId || null });
		return { sanghaSaved: true };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		const sanghaError: SanghaError =
			e.code === 'INVALID_TEMPLE'
				? 'invalid_temple'
				: e.code === 'RATE_LIMITED'
					? 'rate_limited'
					: e.status === 401
						? 'auth'
						: 'failed';
		return fail(e.status >= 400 && e.status < 500 ? e.status : 502, { sanghaError });
	}
}
