import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { safeRedirect } from '$lib/features/auth/redirect';
import { login } from '$lib/server/api/auth';
import { authFail } from '$lib/server/auth/action';
import { startSession } from '$lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

const NOTICES = ['session_ended', 'password_changed'] as const;

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, localizeHref('/'));
	const reason = url.searchParams.get('reason');
	return {
		notice: NOTICES.find((n) => n === reason) ?? null,
		redirectTo: safeRedirect(url.searchParams.get('redirect'))
	};
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const target = safeRedirect(String(form.get('redirect') ?? ''));
		if (!email || !password) return fail(400, { error: 'VALIDATION_ERROR' });

		try {
			const session = await login(fetch, {
				email,
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
		redirect(303, localizeHref(target ?? '/'));
	}
};
