import { apiCall } from './client';
import type {
	AuthSession,
	AuthTokens,
	LoginRequest,
	OtpChallenge,
	RegisterRequest
} from '$lib/types/auth';

type Fetch = typeof globalThis.fetch;

const post = <T>(fetch: Fetch, path: string, body?: unknown, token?: string) =>
	apiCall<T>(fetch, `/v1/auth/${path}`, { method: 'POST', body, token });

/** Register step 1: validates the data and sends an SMS OTP. */
export const requestRegisterOtp = (fetch: Fetch, body: RegisterRequest) =>
	post<OtpChallenge>(fetch, 'register/request-otp', body);

export const resendRegisterOtp = (fetch: Fetch, phone_number: string) =>
	post<OtpChallenge>(fetch, 'resend-otp', { phone_number, purpose: 'register' });

/** Register step 2: creates the account and returns a logged-in session. */
export const verifyRegisterOtp = (fetch: Fetch, phone_number: string, otp_code: string) =>
	post<AuthSession>(fetch, 'register/verify-otp', { phone_number, otp_code });

export const login = (fetch: Fetch, body: LoginRequest) => post<AuthSession>(fetch, 'login', body);

/** Rotates the pair: the old refresh token stops working. */
export const refreshTokens = (fetch: Fetch, refresh_token: string) =>
	post<AuthTokens>(fetch, 'refresh', { refresh_token });

export const logout = (fetch: Fetch, accessToken: string) =>
	post<unknown>(fetch, 'logout', undefined, accessToken);
