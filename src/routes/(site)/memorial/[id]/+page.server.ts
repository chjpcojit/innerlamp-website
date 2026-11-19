import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { ApiError } from '$lib/server/api/client';
import {
	deleteMemorial,
	deleteMemorialPhoto,
	getMemorial,
	updateMemorial,
	uploadMemorialPhoto
} from '$lib/server/api/memorials';
import {
	MemorialDecodeError,
	toMemorialEntry,
	toMemorialRequest
} from '$lib/server/api/memorial-map';
import { endSession } from '$lib/server/auth/session';
import {
	MEMORIAL_PHOTO_MAX_BYTES,
	MEMORIAL_PHOTO_TYPES,
	formValues,
	memorialFail
} from '$lib/server/memorial-action';
import { memorialPhotoEnabled } from '$lib/server/memorial-config';
import { memorialPageHeaders } from '$lib/server/memorial-headers';
import { memorialToken, requireMemorialSession } from '$lib/server/memorial-guard';
import { setMemorialFlash } from '$lib/server/memorial-flash';
import { readMemorialForm, validateMemorialForm } from '$lib/utils/memorial-validate';
import type { Actions, PageServerLoad } from './$types';

/** Route ids are integers; anything else is "not found" without a backend call. */
function parseId(raw: string): number | null {
	if (!/^\d+$/.test(raw)) return null;
	const id = Number(raw);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const load: PageServerLoad = async ({ locals, cookies, fetch, params, setHeaders }) => {
	setHeaders(memorialPageHeaders());
	const token = memorialToken(locals, cookies);
	if (!token) return { entry: null, notFound: false, loadError: false, photoEnabled: false };

	const photoEnabled = memorialPhotoEnabled();
	const id = parseId(params.id);
	if (id === null) return { entry: null, notFound: true, loadError: false, photoEnabled };

	try {
		return {
			entry: toMemorialEntry(await getMemorial(fetch, token, id)),
			notFound: false,
			loadError: false,
			photoEnabled
		};
	} catch (e) {
		if (e instanceof MemorialDecodeError) {
			return { entry: null, notFound: false, loadError: true, photoEnabled };
		}
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 401) {
			endSession(cookies);
			redirect(303, localizeHref('/login'));
		}
		if (e.status === 404) return { entry: null, notFound: true, loadError: false, photoEnabled };
		return { entry: null, notFound: false, loadError: true, photoEnabled };
	}
};

export const actions: Actions = {
	save: async ({ request, cookies, fetch, locals, params }) => {
		const token = requireMemorialSession(locals, cookies);

		const form = await request.formData();
		const values = formValues(form);
		const input = readMemorialForm(form);
		const checked = validateMemorialForm(input);
		if (!checked.valid) return fail(400, { values, errors: checked.errors });

		const mapped = toMemorialRequest(checked.draft);
		if (!mapped.ok) {
			return fail(400, {
				values,
				errors: { date: mapped.error === 'date_not_exist' ? 'not_exist' : 'invalid' }
			});
		}

		const id = parseId(params.id);
		if (id === null) {
			setMemorialFlash(cookies, { kind: 'gone' });
			redirect(303, localizeHref('/memorial'));
		}

		try {
			await updateMemorial(fetch, token, id, mapped.body);
		} catch (e) {
			if (!(e instanceof ApiError)) throw e;
			// Keep the draft (Q-4=A); the form shows the sign-in message.
			if (e.status === 401) endSession(cookies);
			if (e.status === 404) {
				setMemorialFlash(cookies, { kind: 'gone' });
				redirect(303, localizeHref('/memorial'));
			}
			return memorialFail(e, values, 'save', checked.draft.name);
		}

		setMemorialFlash(cookies, { kind: 'saved' });
		redirect(303, localizeHref('/memorial'));
	},

	delete: async ({ request, cookies, fetch, locals, params }) => {
		const token = requireMemorialSession(locals, cookies);

		const form = await request.formData();
		const values = formValues(form);
		const id = parseId(params.id);
		if (id === null) {
			setMemorialFlash(cookies, { kind: 'gone' });
			redirect(303, localizeHref('/memorial'));
		}

		try {
			await deleteMemorial(fetch, token, id);
		} catch (e) {
			if (!(e instanceof ApiError)) throw e;
			// Keep the draft (Q-4=A); the form shows the sign-in message.
			if (e.status === 401) endSession(cookies);
			// 404 = already gone; the UI treats it as success.
			if (e.status === 404) {
				setMemorialFlash(cookies, { kind: 'gone' });
				redirect(303, localizeHref('/memorial'));
			}
			return memorialFail(e, values, 'delete');
		}

		setMemorialFlash(cookies, { kind: 'deleted' });
		redirect(303, localizeHref('/memorial'));
	},

	photo: async ({ request, cookies, fetch, locals, params }) => {
		const token = requireMemorialSession(locals, cookies);
		if (!memorialPhotoEnabled()) return fail(404, { errors: { photo: 'failed' } });

		const id = parseId(params.id);
		if (id === null) return fail(404, { errors: { photo: 'failed' } });

		const form = await request.formData();
		const file = form.get('photo');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { errors: { photo: 'failed' } });
		}
		if (file.size > MEMORIAL_PHOTO_MAX_BYTES) {
			return fail(413, { errors: { photo: 'too_large' } });
		}
		if (!MEMORIAL_PHOTO_TYPES.includes(file.type)) {
			return fail(415, { errors: { photo: 'unsupported' } });
		}

		try {
			await uploadMemorialPhoto(fetch, token, id, file, file.name || 'photo.jpg');
		} catch (e) {
			if (!(e instanceof ApiError)) throw e;
			// Keep the draft (Q-4=A); the form shows the sign-in message.
			if (e.status === 401) endSession(cookies);
			if (e.status === 404) {
				setMemorialFlash(cookies, { kind: 'gone' });
				redirect(303, localizeHref('/memorial'));
			}
			return memorialFail(e, {}, 'photo');
		}
		// Reload the entry so the signed URL is fresh and never stored.
		redirect(303, localizeHref(`/memorial/${id}`));
	},

	photoDelete: async ({ cookies, fetch, locals, params }) => {
		const token = requireMemorialSession(locals, cookies);
		if (!memorialPhotoEnabled()) return fail(404, { errors: { photo: 'failed' } });

		const id = parseId(params.id);
		if (id === null) return fail(404, { errors: { photo: 'failed' } });

		try {
			await deleteMemorialPhoto(fetch, token, id);
		} catch (e) {
			if (!(e instanceof ApiError)) throw e;
			// Keep the draft (Q-4=A); the form shows the sign-in message.
			if (e.status === 401) endSession(cookies);
			if (e.status === 404) {
				setMemorialFlash(cookies, { kind: 'gone' });
				redirect(303, localizeHref('/memorial'));
			}
			return memorialFail(e, {}, 'photo');
		}
		redirect(303, localizeHref(`/memorial/${id}`));
	}
};
