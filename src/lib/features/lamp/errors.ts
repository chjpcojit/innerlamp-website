import { m } from '$lib/paraglide/messages';
import type { LampError } from './types';

const MESSAGES: Record<LampError, () => string> = {
	auth: () => m.lamp_err_auth(),
	invalid: () => m.lamp_err_invalid(),
	limit: () => m.lamp_err_limit(),
	failed: () => m.lamp_err_failed()
};

export const lampErrorMessage = (error: LampError) => MESSAGES[error]();
