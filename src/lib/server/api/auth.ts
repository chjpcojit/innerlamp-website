import { apiCall } from './client';
import type {
	AuthSession,
	AuthTokens,
	LoginRequest,
	OtpChallenge,
	PasswordResetConfirm,
	RegisterRequest
} from '$lib/types/auth';

type Fetch = typeof globalThis.fetch;

const post = <T>(fetch: Fetch, path: string, body?: unknown, token?: string) =>
	apiCall<T>(fetch, `/v1/auth/${path}`, { method: 'POST', body, token });

/** Register step 1: validates the data and emails a verification code. */
export const requestRegisterOtp = (fetch: Fetch, body: RegisterRequest) =>
	post<OtpChallenge>(fetch, 'register/request-otp', body);

export const resendRegisterOtp = (fetch: Fetch, email: string) =>
	post<OtpChallenge>(fetch, 'register/resend-otp', { email });

/** Register step 2: creates the account and returns a logged-in session. */
export const verifyRegisterOtp = (fetch: Fetch, email: string, otp_code: string) =>
	post<AuthSession>(fetch, 'register/verify-otp', { email, otp_code });

export const login = (fetch: Fetch, body: LoginRequest) => post<AuthSession>(fetch, 'login', body);

/** Rotates the pair: the old refresh token stops working. */
export const refreshTokens = (fetch: Fetch, refresh_token: string) =>
	post<AuthTokens>(fetch, 'refresh', { refresh_token });

export const logout = (fetch: Fetch, accessToken: string) =>
	post<unknown>(fetch, 'logout', undefined, accessToken);

/**
 * Forgot password step 1. Answers the same whether or not the email has an account; calling it
 * again resends the code. / Quên mật khẩu bước 1; gọi lại là gửi lại mã.
 */
export const requestPasswordReset = (fetch: Fetch, email: string) =>
	post<OtpChallenge>(fetch, 'password-reset/request-otp', { email });

/** Forgot password step 2. No tokens come back; every session of the account is revoked. */
export const confirmPasswordReset = (fetch: Fetch, body: PasswordResetConfirm) =>
	post<unknown>(fetch, 'password-reset/confirm', body);
