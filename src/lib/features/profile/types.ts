/** Why saving the profile failed; mapped to a translated message. */
export type ProfileEditError =
	| 'auth'
	| 'full_name_required'
	| 'invalid_full_name'
	| 'invalid_dharma_name'
	| 'invalid_temple'
	| 'rate_limited'
	| 'failed';

/** Text fields echoed back on failure so a no-JS re-render keeps what was typed. */
export interface ProfileEditValues {
	full_name: string;
	dharma_name: string;
}
