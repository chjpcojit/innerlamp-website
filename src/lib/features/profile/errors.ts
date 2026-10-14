import { m } from '$lib/paraglide/messages';
import type { ProfileEditError } from './types';

const MESSAGES: Record<ProfileEditError, () => string> = {
	auth: () => m.pfe_err_auth(),
	full_name_required: () => m.pfe_err_full_name_required(),
	invalid_full_name: () => m.pfe_err_invalid_full_name(),
	invalid_dharma_name: () => m.pfe_err_invalid_dharma_name(),
	invalid_temple: () => m.pfe_err_invalid_temple(),
	rate_limited: () => m.pfe_err_rate_limited(),
	failed: () => m.pfe_err_failed()
};

export const profileEditErrorMessage = (error: ProfileEditError) => MESSAGES[error]();
