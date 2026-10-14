export interface SessionUser {
	/** Display name (dharma name, else full name, else phone). */
	name: string;
}

/** `GET /v1/users/me`. Optional keys are absent (never null / "") when unset. */
export interface UserProfile {
	email: string;
	/** Always false for now: the backend has no email verification flow yet. */
	email_verified: boolean;
	/** Full number; backend may return national ("090…") or E.164 ("+84…"). */
	phone_number: string;
	/** Absent on legacy accounts that registered without a name. */
	full_name?: string;
	dharma_name?: string;
	ordination_temple?: { id: string; name: string };
	/** Signed URL valid ~15 minutes (see `avatar_url_expires_at`); never persist it. */
	avatar_url?: string;
	avatar_url_expires_at?: string;
}

/** `PATCH /v1/users/me` body. Absent keys are left unchanged; unknown keys fail the request. */
export interface UserProfileUpdate {
	/** Cannot be cleared: null is rejected with `INVALID_FULL_NAME`. */
	full_name?: string;
	dharma_name?: string;
	/** Sets or changes the practice temple; null removes it. */
	ordination_temple_id?: string | null;
}
