/** DTOs for the backend auth API (`/v1/auth/*`). */

export interface AuthUser {
	id: number;
	email: string;
	/** E.164, e.g. "+84912345678". */
	phone_number: string;
	full_name?: string;
	dharma_name?: string;
	/** Id from `GET /v1/temples/options`; absent when none was chosen. */
	ordination_temple_id?: string;
	created_at: string;
}

export interface AuthTokens {
	access_token: string;
	refresh_token: string;
	/** Access-token lifetime in seconds. */
	expires_in?: number;
}

export interface AuthSession extends AuthTokens {
	user: AuthUser;
}

export interface RegisterRequest {
	email: string;
	password: string;
	/** ISO country of the phone (VN, US, …). */
	phone_country: string;
	/** National number as typed, without "+" or country code. */
	phone_number: string;
	full_name: string;
	dharma_name?: string;
	/** Temple id from `GET /v1/temples/options`; omit when none was chosen. */
	ordination_temple_id?: string;
}

export interface OtpChallenge {
	message: string;
	expires_in_seconds: number;
	resend_after_seconds: number;
	resend_remaining?: number;
}

export interface PasswordResetConfirm {
	email: string;
	otp_code: string;
	new_password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
	device: { platform: string; device_model: string; os_version?: string; app_version?: string };
}
