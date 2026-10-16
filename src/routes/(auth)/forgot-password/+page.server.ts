import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { checkPassword } from '$lib/features/auth/validation';
import { confirmPasswordReset, requestPasswordReset } from '$lib/server/api/auth';
import { authFail } from '$lib/server/auth/action';
import { endSession } from '$lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, localizeHref('/'));
};

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/** Step 1 and resend share one call: the backend answers the same for any email. */
async function sendCode(fetch: typeof globalThis.fetch, form: FormData) {
	const email = text(form, 'email');
	if (!email) return fail(400, { error: 'INVALID_EMAIL' });
	try {
		const challenge = await requestPasswordReset(fetch, email);
		return {
			step: 'reset' as const,
			email,
			resendAfter: challenge.resend_after_seconds,
			expiresIn: challenge.expires_in_seconds
		};
	} catch (e) {
		return authFail(e);
	}
}

export const actions: Actions = {
	request: async ({ request, fetch }) => sendCode(fetch, await request.formData()),

	resend: async ({ request, fetch }) => {
		const form = await request.formData();
		const result = await sendCode(fetch, form);
		// A failed resend stays on the code step.
		return 'status' in result
			? fail(result.status, { ...result.data, step: 'reset' as const, email: text(form, 'email') })
			: result;
	},

	// The new password is never returned to the page.
	confirm: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const email = text(form, 'email');
		const otp = text(form, 'otp_code');
		const password = String(form.get('new_password') ?? '');
		const stay = { step: 'reset' as const, email };
		if (!/^\d{6}$/.test(otp)) return fail(400, { error: 'OTP_INVALID', ...stay });
		if (checkPassword(password) !== 'ok') return fail(400, { error: 'INVALID_PASSWORD', ...stay });

		try {
			await confirmPasswordReset(fetch, { email, otp_code: otp, new_password: password });
		} catch (e) {
			return authFail(e, stay);
		}
		// The backend revoked every session; drop this browser's cookies too and sign in again.
		endSession(cookies);
		redirect(303, `${localizeHref('/login')}?reason=password_changed`);
	}
};
