import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createMemorial,
	deleteMemorial,
	deleteMemorialPhoto,
	getMemorial,
	listMemorials,
	updateMemorial,
	uploadMemorialPhoto
} from './memorials';
import { ApiError } from './client';
import type { MemorialDTO } from '$lib/types/memorial';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://backend.test', API_KEY: 'site-key' }
}));

const dto: MemorialDTO = {
	id: 1,
	full_name: 'Nguyễn Văn An',
	relationship: 'FATHER',
	death_calendar: 'lunar',
	death_date: '2026-11-23',
	death_day: null,
	death_month: null,
	death_leap_month: null,
	note: null,
	photo_url: null,
	reminder: { days_before: 1, time: '07:00' },
	created_at: '2026-11-16T00:00:00Z',
	updated_at: '2026-11-16T00:00:00Z'
};

const request = {
	full_name: 'Nguyễn Văn An',
	relationship: 'FATHER' as const,
	death_calendar: 'lunar' as const,
	death_date: '2026-11-23',
	reminder: { days_before: 1, time: '07:00' }
};

function mockFetch(handler: (url: string, init: RequestInit) => Response) {
	return vi.fn(async (url: string, init: RequestInit) => handler(url, init));
}

afterEach(() => vi.restoreAllMocks());

describe('memorials resource', () => {
	it('fails closed before any backend call when the token is missing', async () => {
		const fetch = vi.fn();
		await expect(
			listMemorials(fetch as unknown as typeof globalThis.fetch, '')
		).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('lists items and total', async () => {
		const fetch = mockFetch(
			() =>
				new Response(JSON.stringify({ success: true, data: { items: [dto], total: 1 } }), {
					status: 200
				})
		);
		const page = await listMemorials(fetch as unknown as typeof globalThis.fetch, 't');
		expect(page.total).toBe(1);
		expect(page.items[0].id).toBe(1);
	});

	it('creates with POST and returns the new memorial', async () => {
		let seen: RequestInit | undefined;
		const fetch = mockFetch((url, init) => {
			seen = init;
			expect(url).toBe('http://backend.test/v1/memorials');
			return new Response(JSON.stringify({ success: true, data: dto }), { status: 201 });
		});
		await createMemorial(fetch as unknown as typeof globalThis.fetch, 't', request);
		expect(seen?.method).toBe('POST');
		expect(JSON.parse(String(seen?.body))).toEqual(request);
	});

	it('updates with PUT to the entry id', async () => {
		let url = '';
		const fetch = mockFetch((u, init) => {
			url = u;
			expect(init.method).toBe('PUT');
			return new Response(JSON.stringify({ success: true, data: dto }), { status: 200 });
		});
		await updateMemorial(fetch as unknown as typeof globalThis.fetch, 't', 7, request);
		expect(url).toBe('http://backend.test/v1/memorials/7');
	});

	it('deletes with no data envelope', async () => {
		const fetch = mockFetch(() => new Response(JSON.stringify({ success: true }), { status: 200 }));
		await expect(
			deleteMemorial(fetch as unknown as typeof globalThis.fetch, 't', 7)
		).resolves.toBeUndefined();
	});

	it('maps 404 to MEMORIAL_NOT_FOUND', async () => {
		const fetch = mockFetch(
			() =>
				new Response(JSON.stringify({ success: false, error: { code: 'MEMORIAL_NOT_FOUND' } }), {
					status: 404
				})
		);
		vi.spyOn(console, 'error').mockImplementation(() => {});
		await expect(
			getMemorial(fetch as unknown as typeof globalThis.fetch, 't', 9)
		).rejects.toMatchObject({ status: 404, code: 'MEMORIAL_NOT_FOUND' });
	});

	it('uploads one multipart part named photo', async () => {
		let body: FormData | undefined;
		let contentType: string | undefined;
		const fetch = mockFetch((_url, init) => {
			body = init.body as FormData;
			contentType = (init.headers as Record<string, string>)['Content-Type'];
			return new Response(JSON.stringify({ success: true, data: dto }), { status: 200 });
		});
		const file = new Blob(['jpeg'], { type: 'image/jpeg' });
		await uploadMemorialPhoto(fetch as unknown as typeof globalThis.fetch, 't', 1, file, 'a.jpg');

		expect(contentType).toBeUndefined();
		expect(body?.getAll('photo')).toHaveLength(1);
		expect(body?.get('photo')).toBeInstanceOf(Blob);
	});

	it('maps 413 PHOTO_TOO_LARGE and 415 PHOTO_UNSUPPORTED_TYPE', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const tooLarge = mockFetch(
			() =>
				new Response(JSON.stringify({ success: false, error: { code: 'PHOTO_TOO_LARGE' } }), {
					status: 413
				})
		);
		await expect(
			uploadMemorialPhoto(
				tooLarge as unknown as typeof globalThis.fetch,
				't',
				1,
				new Blob(['x'], { type: 'image/jpeg' })
			)
		).rejects.toMatchObject({ status: 413, code: 'PHOTO_TOO_LARGE' });

		const unsupported = mockFetch(
			() =>
				new Response(
					JSON.stringify({ success: false, error: { code: 'PHOTO_UNSUPPORTED_TYPE' } }),
					{ status: 415 }
				)
		);
		await expect(
			uploadMemorialPhoto(
				unsupported as unknown as typeof globalThis.fetch,
				't',
				1,
				new Blob(['x'], { type: 'text/plain' })
			)
		).rejects.toMatchObject({ status: 415, code: 'PHOTO_UNSUPPORTED_TYPE' });
	});

	it('deletes the photo with DELETE', async () => {
		let seen: RequestInit | undefined;
		const fetch = mockFetch((_url, init) => {
			seen = init;
			return new Response(JSON.stringify({ success: true, data: dto }), { status: 200 });
		});
		await deleteMemorialPhoto(fetch as unknown as typeof globalThis.fetch, 't', 1);
		expect(seen?.method).toBe('DELETE');
	});

	it('keeps ApiError instances for the caller', async () => {
		const fetch = mockFetch(() => new Response('{}', { status: 500 }));
		vi.spyOn(console, 'error').mockImplementation(() => {});
		await expect(
			getMemorial(fetch as unknown as typeof globalThis.fetch, 't', 1)
		).rejects.toBeInstanceOf(ApiError);
	});
});
