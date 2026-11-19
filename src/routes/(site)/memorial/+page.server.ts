import { redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { ApiError } from '$lib/server/api/client';
import { listMemorials } from '$lib/server/api/memorials';
import { MemorialDecodeError, toMemorialEntry } from '$lib/server/api/memorial-map';
import { endSession } from '$lib/server/auth/session';
import { memorialPhotoEnabled } from '$lib/server/memorial-config';
import { memorialPageHeaders } from '$lib/server/memorial-headers';
import { memorialToken } from '$lib/server/memorial-guard';
import { takeMemorialFlash } from '$lib/server/memorial-flash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, fetch, setHeaders }) => {
	setHeaders(memorialPageHeaders());
	const photoEnabled = memorialPhotoEnabled();
	const token = memorialToken(locals, cookies);
	// Guests see the invitation only: no backend call. / Khách chỉ thấy lời mời, không gọi BE.
	if (!token) return { entries: null, total: 0, loadError: false, flash: null, photoEnabled };

	try {
		const { items, total } = await listMemorials(fetch, token);
		return {
			entries: items.map(toMemorialEntry),
			total,
			loadError: false,
			flash: takeMemorialFlash(cookies),
			photoEnabled
		};
	} catch (e) {
		if (e instanceof MemorialDecodeError) {
			// A response we cannot map is a load failure, never a fake empty book.
			return {
				entries: null,
				total: 0,
				loadError: true,
				flash: takeMemorialFlash(cookies),
				photoEnabled
			};
		}
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 401) {
			endSession(cookies);
			redirect(303, localizeHref('/login'));
		}
		// No offline copy on the web: show the error and a retry, never a fake empty book.
		return {
			entries: null,
			total: 0,
			loadError: true,
			flash: takeMemorialFlash(cookies),
			photoEnabled
		};
	}
};
