import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { ApiError } from '$lib/server/api/client';
import { requestRegisterOtp, resendRegisterOtp, verifyRegisterOtp } from '$lib/server/api/auth';
import { suggestTemple } from '$lib/server/api/temples';
import { authFail } from '$lib/server/auth/action';
import { startSession } from '$lib/server/auth/session';
import type { TempleSuggestionRequest } from '$lib/types/temple';
import type { Actions } from './$types';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/**
 * A proposed temple carried through the OTP step, so it is submitted once, after the
 * account exists. Everything is required by the backend; anything else is dropped.
 */
function readSuggestion(raw: unknown): TempleSuggestionRequest | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const { name, province_code, ward_code, address } = raw as Record<string, unknown>;
	if (
		typeof name !== 'string' ||
		typeof province_code !== 'string' ||
		typeof ward_code !== 'string' ||
		typeof address !== 'string'
	)
		return null;
	const s = {
		name: name.trim().slice(0, 255),
		province_code,
		ward_code,
		address: address.trim().slice(0, 500)
	};
	return s.name && s.province_code && s.ward_code && s.address ? s : null;
}

function suggestionFromJson(form: FormData): TempleSuggestionRequest | null {
	try {
		return readSuggestion(JSON.parse(text(form, 'temple_suggestion')));
	} catch {
		return null;
	}
}

export const actions: Actions = {
	// Step 1: validate + send the SMS code. The password is never echoed back to the page.
	request: async ({ request, fetch }) => {
		const form = await request.formData();
		const phone = text(form, 'phone_number');
		const fullName = text(form, 'full_name');
		const email = text(form, 'email');
		const password = String(form.get('password') ?? '');
		if (!phone || fullName.length < 2 || !email || !password)
			return fail(400, { error: 'VALIDATION_ERROR' });

		try {
			const challenge = await requestRegisterOtp(fetch, {
				phone_number: phone,
				email,
				password,
				full_name: fullName,
				dharma_name: text(form, 'dharma_name') || undefined,
				ordination_temple_id: text(form, 'ordination_temple_id') || undefined
			});
			return {
				step: 'otp' as const,
				phone,
				resendAfter: challenge.resend_after_seconds,
				expiresIn: challenge.expires_in_seconds,
				suggestion: readSuggestion({
					name: text(form, 'suggest_name'),
					province_code: text(form, 'suggest_province_code'),
					ward_code: text(form, 'suggest_ward_code'),
					address: text(form, 'suggest_address')
				})
			};
		} catch (e) {
			return authFail(e);
		}
	},

	resend: async ({ request, fetch }) => {
		const form = await request.formData();
		const phone = text(form, 'phone_number');
		const suggestion = suggestionFromJson(form);
		try {
			const challenge = await resendRegisterOtp(fetch, phone);
			return {
				step: 'otp' as const,
				phone,
				resendAfter: challenge.resend_after_seconds,
				expiresIn: challenge.expires_in_seconds,
				suggestion
			};
		} catch (e) {
			return authFail(e, { step: 'otp' as const, phone, suggestion });
		}
	},

	// Step 2: confirm the code; the backend creates the account and logs the user in.
	verify: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const phone = text(form, 'phone_number');
		const code = text(form, 'otp_code');
		const suggestion = suggestionFromJson(form);
		if (!/^\d{6}$/.test(code))
			return fail(400, { error: 'OTP_INVALID', step: 'otp' as const, phone, suggestion });

		try {
			startSession(cookies, await verifyRegisterOtp(fetch, phone, code));
		} catch (e) {
			return authFail(e, { step: 'otp' as const, phone, suggestion });
		}

		// Best effort: a rejected proposal (rate limit, validation) must not undo the sign-up.
		if (suggestion) {
			try {
				await suggestTemple(fetch, suggestion);
			} catch (e) {
				if (!(e instanceof ApiError)) throw e;
			}
		}
		redirect(303, localizeHref('/'));
	}
};
