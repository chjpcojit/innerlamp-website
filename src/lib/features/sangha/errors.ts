import { m } from '$lib/paraglide/messages';
import type { SanghaError } from './types';

const MESSAGES: Record<SanghaError, () => string> = {
	auth: () => m.sg_err_auth(),
	invalid_temple: () => m.sg_err_invalid_temple(),
	rate_limited: () => m.sg_err_rate_limited(),
	failed: () => m.sg_err_failed()
};

export const sanghaErrorMessage = (error: SanghaError) => MESSAGES[error]();
