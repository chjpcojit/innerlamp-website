import { json } from '@sveltejs/kit';
import { LAMP_TYPES } from '$lib/content/lamps';
import { ApiError } from '$lib/server/api/client';
import { listLampGarden } from '$lib/server/api/lamps';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

/**
 * Browser-facing proxy for the lamp garden's filter and "load more":
 * `?lamp_type=OIL_LAMP&cursor=…` → `LampGardenPage`. The lamps API needs the user's token,
 * which stays in the httpOnly cookie; guests get 401.
 */
export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const lampType = url.searchParams.get('lamp_type') || undefined;
	const type = lampType && LAMP_TYPES.find((t) => t.code === lampType);
	if (lampType && !type) return json({ error: 'INVALID_FILTER' }, { status: 400 });

	const token = cookies.get(TOKEN_COOKIE);
	if (!token) return json({ error: 'UNAUTHORIZED' }, { status: 401 });

	try {
		return json(
			await listLampGarden(fetch, token, {
				lamp_type: type ? type.code : undefined,
				cursor: url.searchParams.get('cursor') || undefined
			})
		);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
