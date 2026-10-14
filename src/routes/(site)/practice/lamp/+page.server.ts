import { fail } from '@sveltejs/kit';
import {
	LAMP_DAYS,
	LAMP_PURPOSES,
	LAMP_TYPES,
	PRAYER_MAX,
	RECIPIENT_MAX
} from '$lib/content/lamps';
import { m } from '$lib/paraglide/messages';
import { ApiError } from '$lib/server/api/client';
import { lightLamp, listLampGarden } from '$lib/server/api/lamps';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { LampError } from '$lib/features/lamp/types';
import type { LampDuration, LampGardenPage } from '$lib/types/lamp';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	// Both lamp endpoints need the user's token; guests see the form and a sign-in prompt.
	if (!locals.user || !token) return { isGuest: true, garden: null };

	let garden: LampGardenPage | null = null;
	try {
		garden = await listLampGarden(fetch, token);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// The garden block shows an error; lighting a lamp can still work.
	}
	return { isGuest: false, garden };
};

const chars = (s: string) => [...s].length;

export const actions: Actions = {
	light: async ({ request, cookies, fetch, locals }) => {
		const token = cookies.get(TOKEN_COOKIE);
		if (!locals.user || !token) return fail(401, { lampError: 'auth' as LampError });

		const form = await request.formData();
		const field = (name: string) => String(form.get(name) ?? '').trim();
		const type = LAMP_TYPES.find((t) => t.code === field('lamp_type'));
		const purpose = LAMP_PURPOSES.find((p) => p.code === field('intention'));
		const days = Number(field('duration_days')) as LampDuration;
		// The backend has no "all beings" default, so an empty recipient is sent as that text.
		const recipient = field('recipient') || m.lamp_recipient_all();
		const prayer = field('prayer');
		if (
			!type ||
			!purpose ||
			!LAMP_DAYS.includes(days) ||
			chars(recipient) > RECIPIENT_MAX ||
			chars(prayer) > PRAYER_MAX
		)
			return fail(400, { lampError: 'invalid' as LampError });

		try {
			const lamp = await lightLamp(fetch, token, {
				lamp_type: type.code,
				intention: purpose.code,
				recipient,
				prayer: prayer || null,
				duration_days: days
			});
			return { lamp };
		} catch (e) {
			if (!(e instanceof ApiError)) throw e;
			const lampError: LampError =
				e.code === 'LAMP_LIMIT_REACHED'
					? 'limit'
					: e.code === 'VALIDATION_ERROR'
						? 'invalid'
						: e.status === 401
							? 'auth'
							: 'failed';
			return fail(e.status >= 400 && e.status < 500 ? e.status : 502, { lampError });
		}
	}
};
