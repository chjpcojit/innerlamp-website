import { fail } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { lightLamp, listLampGarden } from '$lib/server/api/lamps';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { LampError } from '$lib/features/lamp/types';
import { validateLampInput } from '$lib/features/lamp/validation';
import type { LampGardenPage, LightLampInput } from '$lib/types/lamp';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	// Guests see the introduction only: no backend call. / Khách chỉ thấy phần giới thiệu, không gọi backend.
	if (!locals.user || !token) return { isGuest: true, garden: null };

	let garden: LampGardenPage | null = null;
	try {
		garden = await listLampGarden(fetch, token);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// The garden block shows an error; lighting a lamp can still work.
		// / Khối vườn đèn báo lỗi; vẫn thắp đèn được.
	}
	return { isGuest: false, garden };
};

export const actions: Actions = {
	light: async ({ request, cookies, fetch, locals }) => {
		const token = cookies.get(TOKEN_COOKIE);
		if (!locals.user || !token) return fail(401, { lampError: 'auth' as LampError });

		const form = await request.formData();
		const field = (name: string) => String(form.get(name) ?? '');
		// The browser check is a convenience; the server applies the same rules again.
		// / Kiểm tra ở trình duyệt chỉ để tiện; server kiểm tra lại cùng luật.
		const checked = validateLampInput({
			lamp_type: field('lamp_type'),
			intention: field('intention'),
			recipient: field('recipient'),
			prayer: field('prayer'),
			duration_days: Number(field('duration_days'))
		});
		if (!checked.valid) return fail(400, { lampError: 'invalid' as LampError });

		const input: LightLampInput = {
			lamp_type: checked.lamp_type,
			intention: checked.intention,
			prayer: checked.prayer,
			duration_days: checked.duration_days,
			is_anonymous: form.get('is_anonymous') === 'true'
		};
		// A blank recipient is left out: the lamp is for all beings, never localized text.
		// / Người nhận trống thì không gửi: đèn dành cho tất cả chúng sanh, không gửi chữ đã dịch.
		if (checked.recipient) input.recipient = checked.recipient;

		try {
			const lamp = await lightLamp(fetch, token, input);
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
