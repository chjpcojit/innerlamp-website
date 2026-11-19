import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './api/client';
import { memorialFail } from './memorial-action';

vi.mock('$app/environment', () => ({ dev: true }));

const validation = (field: string) => new ApiError(400, 'VALIDATION_ERROR', { field });

describe('memorialFail', () => {
	it('maps a backend note error to the note key, never the name key', () => {
		const result = memorialFail(validation('note'), {}, 'save');
		expect(result.status).toBe(400);
		expect(result.data?.errors).toEqual({ note: 'note_long' });
	});

	it('maps full_name to empty or long based on the posted value', () => {
		expect(memorialFail(validation('full_name'), {}, 'save').data?.errors).toEqual({
			name: 'empty'
		});
		expect(memorialFail(validation('full_name'), {}, 'save', 'a'.repeat(101)).data?.errors).toEqual(
			{
				name: 'long'
			}
		);
	});

	it('keeps the posted values and returns the session message on 401', () => {
		const result = memorialFail(new ApiError(401, 'UNAUTHORIZED'), { name: 'An' }, 'save');
		expect(result.status).toBe(401);
		expect(result.data).toEqual({ values: { name: 'An' }, errors: { form: 'auth' } });
	});

	it('maps the limit reached error to the form banner', () => {
		const result = memorialFail(new ApiError(409, 'MEMORIAL_LIMIT_REACHED'), {}, 'save');
		expect(result.status).toBe(409);
		expect(result.data?.errors).toEqual({ form: 'full' });
	});

	it('maps photo size/type errors when uploading a portrait', () => {
		expect(memorialFail(new ApiError(413, 'PHOTO_TOO_LARGE'), {}, 'photo').data?.errors).toEqual({
			photo: 'too_large'
		});
		expect(
			memorialFail(new ApiError(415, 'PHOTO_UNSUPPORTED_TYPE'), {}, 'photo').data?.errors
		).toEqual({ photo: 'unsupported' });
	});
});
