import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { ApiError } from '$lib/server/api/client';
import { getMe, profileDisplayName, updateMe } from '$lib/server/api/users';
import { TOKEN_COOKIE, setDisplayName } from '$lib/server/auth/session';
import type { UserProfileUpdate } from '$lib/types/user';
import { DHARMA_NAME_MAX, FULL_NAME_MAX } from '../limits';
import type { ProfileEditError, ProfileEditValues } from '../types';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/**
 * Form action body: writes the editable profile fields (full name, dharma name, practice
 * temple) with `PATCH /v1/users/me`, sending only keys that changed, then refreshes the
 * display-name cookie and returns to `/profile`.
 */
export async function updateProfile({ request, cookies, fetch, locals }: RequestEvent) {
	const token = cookies.get(TOKEN_COOKIE);
	if (!locals.user || !token) return fail(401, { error: 'auth' as ProfileEditError });

	const form = await request.formData();
	const values: ProfileEditValues = {
		full_name: text(form, 'full_name'),
		dharma_name: text(form, 'dharma_name')
	};
	const templeId = text(form, 'ordination_temple_id') || null;

	const invalid = (error: ProfileEditError) => fail(400, { error, values });
	if (!values.full_name) return invalid('full_name_required');
	// Count code points, as the backend does, so Vietnamese diacritics aren't miscounted.
	if ([...values.full_name].length > FULL_NAME_MAX) return invalid('invalid_full_name');
	if ([...values.dharma_name].length > DHARMA_NAME_MAX) return invalid('invalid_dharma_name');

	try {
		// Usually a cache hit from the page load, so the diff costs no extra request.
		const current = await getMe(fetch, token);
		const body: UserProfileUpdate = {};
		if (values.full_name !== (current.full_name ?? '')) body.full_name = values.full_name;
		// Assumption: the backend clears the dharma name on "" (only `full_name` is documented
		// as non-clearable).
		if (values.dharma_name !== (current.dharma_name ?? '')) body.dharma_name = values.dharma_name;
		if (templeId !== (current.ordination_temple?.id ?? null)) body.ordination_temple_id = templeId;

		if (Object.keys(body).length > 0) {
			const profile = await updateMe(fetch, token, body);
			setDisplayName(cookies, profileDisplayName(profile));
		}
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		const error: ProfileEditError =
			e.code === 'INVALID_FULL_NAME'
				? 'invalid_full_name'
				: e.code === 'INVALID_DHARMA_NAME'
					? 'invalid_dharma_name'
					: e.code === 'INVALID_TEMPLE'
						? 'invalid_temple'
						: e.code === 'RATE_LIMITED'
							? 'rate_limited'
							: e.status === 401
								? 'auth'
								: 'failed';
		return fail(e.status >= 400 && e.status < 500 ? e.status : 502, { error, values });
	}

	redirect(303, localizeHref('/profile'));
}
