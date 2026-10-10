import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { requestRegisterOtp, resendRegisterOtp, verifyRegisterOtp } from '$lib/server/api/auth';
import { authFail } from '$lib/server/auth/action';
import { startSession } from '$lib/server/auth/session';
import type { Actions } from './$types';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

export const actions: Actions = {
	// Step 1: validate + send the SMS code. The password is never echoed back to the page.
	request: async ({ request, fetch }) => {
		const form = await request.formData();
		const phone = text(form, 'phone_number');
		const email = text(form, 'email');
		const password = String(form.get('password') ?? '');
		if (!phone || !email || !password) return fail(400, { error: 'VALIDATION_ERROR' });

		try {
			const challenge = await requestRegisterOtp(fetch, {
				phone_number: phone,
				email,
				password,
				dharma_name: text(form, 'dharma_name') || undefined,
				ordination_place: text(form, 'ordination_place') || undefined
			});
			return { step: 'otp' as const, phone, resendAfter: challenge.resend_after_seconds };
		} catch (e) {
			return authFail(e);
		}
	},

	resend: async ({ request, fetch }) => {
		const phone = text(await request.formData(), 'phone_number');
		try {
			const challenge = await resendRegisterOtp(fetch, phone);
			return { step: 'otp' as const, phone, resendAfter: challenge.resend_after_seconds };
		} catch (e) {
			return authFail(e, { step: 'otp', phone });
		}
	},

	// Step 2: confirm the code; the backend creates the account and logs the user in.
	verify: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const phone = text(form, 'phone_number');
		const code = text(form, 'otp_code');
		if (!/^\d{6}$/.test(code)) return fail(400, { error: 'OTP_INVALID', step: 'otp', phone });

		try {
			startSession(cookies, await verifyRegisterOtp(fetch, phone, code));
		} catch (e) {
			return authFail(e, { step: 'otp', phone });
		}
		redirect(303, localizeHref('/'));
	}
};
