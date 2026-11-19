import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { ApiError } from '$lib/server/api/client';
import { createMemorial } from '$lib/server/api/memorials';
import { toMemorialRequest } from '$lib/server/api/memorial-map';
import { endSession } from '$lib/server/auth/session';
import { formValues, memorialFail } from '$lib/server/memorial-action';
import { memorialPageHeaders } from '$lib/server/memorial-headers';
import { requireMemorialSession } from '$lib/server/memorial-guard';
import { setMemorialFlash } from '$lib/server/memorial-flash';
import { readMemorialForm, validateMemorialForm } from '$lib/utils/memorial-validate';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ setHeaders }) => {
	setHeaders(memorialPageHeaders());
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch, locals }) => {
		const token = requireMemorialSession(locals, cookies);

		const form = await request.formData();
		const values = formValues(form);
		const input = readMemorialForm(form);
		// The browser check is a convenience; the server applies the same rules again.
		const checked = validateMemorialForm(input);
		if (!checked.valid) return fail(400, { values, errors: checked.errors });

		const mapped = toMemorialRequest(checked.draft);
		if (!mapped.ok) {
			return fail(400, {
				values,
				errors: { date: mapped.error === 'date_not_exist' ? 'not_exist' : 'invalid' }
			});
		}

		try {
			await createMemorial(fetch, token, mapped.body);
		} catch (e) {
			if (!(e instanceof ApiError)) throw e;
			// Keep the draft (Q-4=A); the form shows the sign-in message.
			if (e.status === 401) endSession(cookies);
			return memorialFail(e, values, 'save', checked.draft.name);
		}

		setMemorialFlash(cookies, { kind: 'saved' });
		redirect(303, localizeHref('/memorial'));
	}
};
