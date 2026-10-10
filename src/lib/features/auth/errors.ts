import { m } from '$lib/paraglide/messages';

/** Backend error codes → translated copy. The backend only sends English messages. */
const MESSAGES: Record<string, () => string> = {
	INVALID_CREDENTIALS: () => m.auth_err_invalid_credentials(),
	LOGIN_LOCKED: () => m.auth_err_login_locked(),
	PHONE_TAKEN: () => m.auth_err_phone_taken(),
	EMAIL_TAKEN: () => m.auth_err_email_taken(),
	INVALID_PHONE: () => m.auth_err_invalid_phone(),
	INVALID_EMAIL: () => m.auth_err_invalid_email(),
	INVALID_PASSWORD: () => m.auth_err_invalid_password(),
	VALIDATION_ERROR: () => m.auth_err_validation(),
	OTP_INVALID: () => m.auth_err_otp_invalid(),
	OTP_EXPIRED: () => m.auth_err_otp_expired(),
	PENDING_REGISTRATION_EXPIRED: () => m.auth_err_pending_expired(),
	OTP_RESEND_TOO_SOON: () => m.auth_err_resend_too_soon(),
	OTP_SEND_LIMITED: () => m.auth_err_otp_limited(),
	OTP_LOCKED: () => m.auth_err_otp_locked(),
	NETWORK_ERROR: () => m.auth_err_network()
};

export function authErrorMessage(code: string | undefined): string {
	return (code && MESSAGES[code]?.()) || m.auth_err_generic();
}
