import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { login } from '$lib/server/api/auth';
import { authFail } from '$lib/server/auth/action';
import { dev } from '$app/environment';
import { startDevSession, startSession } from '$lib/server/auth/session';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const phone = String(form.get('phone_number') ?? '').trim();
		const password = String(form.get('password') ?? '');
		// TEMP (dev only): skip the backend and treat any submit as a successful login.
		if (dev) {
			startDevSession(cookies, phone || 'InnerLamp');
			redirect(303, localizeHref('/'));
		}

		if (!phone || !password) return fail(400, { error: 'VALIDATION_ERROR' });

		try {
			const session = await login(fetch, {
				phone_number: phone,
				password,
				device: {
					platform: 'web',
					device_model: (request.headers.get('user-agent') ?? 'Web browser').slice(0, 100)
				}
			});
			startSession(cookies, session);
		} catch (e) {
			return authFail(e);
		}
		redirect(303, localizeHref('/'));
	}
};
