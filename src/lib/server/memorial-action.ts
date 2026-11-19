import { fail } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import type { MemorialDTO } from '$lib/types/memorial';

import type { MemorialActionErrors } from '$lib/types/memorial';

export type { MemorialActionErrors } from '$lib/types/memorial';

export interface MemorialActionData {
	values?: Record<string, string>;
	errors?: MemorialActionErrors;
	photo?: MemorialDTO;
}

export const MEMORIAL_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const MEMORIAL_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Posted values for the no-JS fallback; never logged (NFR-MEM-02). */
export function formValues(form: FormData): Record<string, string> {
	const values: Record<string, string> = {};
	for (const [key, value] of form) if (typeof value === 'string') values[key] = value;
	return values;
}

const DATE_FIELDS = new Set([
	'death_date',
	'death_day',
	'death_month',
	'death_leap_month',
	'death_calendar'
]);

/** Maps one backend failure to a form-local result; 401 is handled by the action itself. */
export function memorialFail(
	e: unknown,
	values: Record<string, string>,
	mode: 'save' | 'delete' | 'photo',
	inputName = ''
) {
	if (!(e instanceof ApiError)) throw e;

	if (e.status === 401) {
		// Q-4=A: keep the form and the draft; the page shows a sign-in message (W3).
		return fail(401, { values, errors: { form: 'auth' } } satisfies MemorialActionData);
	}

	if (e.code === 'MEMORIAL_LIMIT_REACHED') {
		return fail(409, { values, errors: { form: 'full' } } satisfies MemorialActionData);
	}

	if (e.code === 'PHOTO_TOO_LARGE' || e.status === 413) {
		return fail(413, {
			values,
			errors: mode === 'photo' ? { photo: 'too_large' } : { form: 'save' }
		} satisfies MemorialActionData);
	}

	if (e.code === 'PHOTO_UNSUPPORTED_TYPE' || e.status === 415) {
		return fail(415, {
			values,
			errors: mode === 'photo' ? { photo: 'unsupported' } : { form: 'save' }
		} satisfies MemorialActionData);
	}

	if (e.code === 'VALIDATION_ERROR') {
		const field = typeof e.details.field === 'string' ? e.details.field : '';
		const errors: MemorialActionErrors = {};
		if (field === 'full_name') errors.name = inputName.trim().length > 100 ? 'long' : 'empty';
		else if (field === 'note') errors.note = 'note_long';
		else if (DATE_FIELDS.has(field)) errors.date = 'invalid';
		else if (mode === 'photo' && field === 'photo') errors.photo = 'failed';
		else errors.form = 'save';
		return fail(400, { values, errors } satisfies MemorialActionData);
	}

	return fail(502, {
		values,
		errors:
			mode === 'delete'
				? { form: 'delete' }
				: mode === 'photo'
					? { photo: 'failed' }
					: { form: 'save' }
	} satisfies MemorialActionData);
}
