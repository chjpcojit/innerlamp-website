import { m } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';

/** Backend error codes → translated copy. The backend only sends English messages. */
/** Extra data some codes carry: `lockedUntil` (RFC 3339) and `retryAfter` (seconds). */
export interface ErrorContext {
	lockedUntil?: string;
	retryAfter?: number;
}

/** Unlock time in the visitor's locale, or null when the backend sent none / an invalid one. */
function unlockTime(lockedUntil: string | undefined): string | null {
	const until = lockedUntil ? new Date(lockedUntil) : null;
	if (!until || Number.isNaN(until.getTime())) return null;
	return until.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
}

const MESSAGES: Record<string, (ctx: ErrorContext) => string> = {
	INVALID_CREDENTIALS: () => m.auth_err_invalid_credentials(),
	LOGIN_LOCKED: ({ lockedUntil }) => {
		const time = unlockTime(lockedUntil);
		return time ? m.auth_err_login_locked_until({ time }) : m.auth_err_login_locked();
	},
	PHONE_TAKEN: () => m.auth_err_phone_taken(),
	INVALID_PHONE: () => m.auth_err_invalid_phone(),
	INVALID_EMAIL: () => m.auth_err_invalid_email(),
	INVALID_PASSWORD: () => m.auth_err_invalid_password(),
	INVALID_FULL_NAME: () => m.auth_err_invalid_full_name(),
	INVALID_DHARMA_NAME: () => m.auth_err_invalid_dharma_name(),
	INVALID_TEMPLE: () => m.auth_err_invalid_temple(),
	VALIDATION_ERROR: () => m.auth_err_validation(),
	OTP_INVALID: () => m.auth_err_otp_invalid(),
	OTP_EXPIRED: () => m.auth_err_otp_expired(),
	PENDING_REGISTRATION_EXPIRED: () => m.auth_err_pending_expired(),
	OTP_RESEND_TOO_SOON: () => m.auth_err_resend_too_soon(),
	OTP_SEND_LIMITED: ({ lockedUntil }) => {
		const time = unlockTime(lockedUntil);
		return time ? m.auth_err_otp_limited_until({ time }) : m.auth_err_otp_limited();
	},
	OTP_LOCKED: ({ lockedUntil }) => {
		const time = unlockTime(lockedUntil);
		return time ? m.auth_err_otp_locked_until({ time }) : m.auth_err_otp_locked();
	},
	RATE_LIMITED: ({ retryAfter }) =>
		retryAfter ? m.auth_err_rate_limited_wait({ seconds: retryAfter }) : m.auth_err_rate_limited(),
	REGISTRATION_IN_PROGRESS: ({ retryAfter }) =>
		retryAfter
			? m.auth_err_registration_in_progress_wait({ seconds: retryAfter })
			: m.auth_err_registration_in_progress(),
	EMAIL_SEND_FAILED: () => m.auth_err_email_send_failed(),
	INVALID_DEVICE: () => m.auth_err_generic(),
	INVALID_API_KEY: () => m.auth_err_generic(),
	NETWORK_ERROR: () => m.auth_err_network()
};

export function authErrorMessage(code: string | undefined, ctx: ErrorContext = {}): string {
	return (code && MESSAGES[code]?.(ctx)) || m.auth_err_generic();
}

/** Pull the optional wait / unlock data out of a form-action result (`authFail` adds them). */
export function errorContext(data: object | null | undefined): ErrorContext {
	const { lockedUntil, retryAfter } = (data ?? {}) as Record<string, unknown>;
	return {
		lockedUntil: typeof lockedUntil === 'string' ? lockedUntil : undefined,
		retryAfter: typeof retryAfter === 'number' ? retryAfter : undefined
	};
}
