import { apiCall } from './client';
import type { Lamp, LampGardenPage, LampGardenQuery, LightLampInput } from '$lib/types/lamp';

type Fetch = typeof globalThis.fetch;

/**
 * Lights a lamp for the user. Needs the user's token. The same content posted again within
 * 5 s returns the earlier lamp (200) instead of creating one. Throws `ApiError` with 400
 * `VALIDATION_ERROR` (`details.field`), 401 `UNAUTHORIZED` or 409 `LAMP_LIMIT_REACHED`
 * (20 burning lamps per user).
 */
export const lightLamp = (fetch: Fetch, token: string, input: LightLampInput) =>
	apiCall<Lamp>(fetch, '/v1/lamps', { method: 'POST', body: input, token });

/**
 * One page (≤ 12) of every user's burning lamps (expired ones are dropped by the backend). Needs the user's token.
 * Throws `ApiError` with 400 `INVALID_FILTER` / `INVALID_LIMIT` / `INVALID_CURSOR` or 401.
 */
export const listLampGarden = (
	fetch: Fetch,
	token: string,
	{ lamp_type, cursor }: LampGardenQuery = {}
) => {
	const params = new URLSearchParams();
	if (lamp_type) params.set('lamp_type', lamp_type);
	if (cursor) params.set('cursor', cursor);
	const qs = params.size ? `?${params}` : '';
	return apiCall<LampGardenPage>(fetch, `/v1/lamps${qs}`, { token });
};
