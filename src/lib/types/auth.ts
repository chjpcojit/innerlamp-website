/** DTOs for the backend auth API (`/v1/auth/*`). */

export interface AuthUser {
	id: number;
	email: string;
	/** E.164, e.g. "+84912345678". */
	phone_number: string;
	dharma_name?: string;
	ordination_place?: string;
	created_at: string;
}

export interface AuthTokens {
	access_token: string;
	refresh_token: string;
}

export interface AuthSession extends AuthTokens {
	user: AuthUser;
}

export interface RegisterRequest {
	email: string;
	password: string;
	phone_number: string;
	dharma_name?: string;
	ordination_place?: string;
}

export interface OtpChallenge {
	message: string;
	expires_in_seconds: number;
	resend_after_seconds: number;
	resend_remaining?: number;
}

export interface LoginRequest {
	phone_number: string;
	password: string;
	device: { platform: string; device_model: string; os_version?: string; app_version?: string };
}
