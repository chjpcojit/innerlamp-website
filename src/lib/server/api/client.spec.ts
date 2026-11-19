import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiCall } from './client';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://backend.test', API_KEY: 'site-key' }
}));

const jsonOk = (data: unknown) =>
	new Response(JSON.stringify({ success: true, data }), { status: 200 });

afterEach(() => vi.restoreAllMocks());

describe('apiCall', () => {
	it('keeps JSON calls as application/json with a stringified body', async () => {
		let seen: RequestInit | undefined;
		const fetch = vi.fn(async (_url: string, init: RequestInit) => {
			seen = init;
			return jsonOk({ ok: true });
		});

		await apiCall(fetch as unknown as typeof globalThis.fetch, '/v1/memorials', {
			method: 'POST',
			body: { full_name: 'An' },
			token: 't'
		});

		const headers = seen?.headers as Record<string, string>;
		expect(headers['Content-Type']).toBe('application/json');
		expect(headers['Authorization']).toBe('Bearer t');
		expect(headers['x-api-key']).toBe('site-key');
		expect(seen?.body).toBe(JSON.stringify({ full_name: 'An' }));
	});

	it('sends FormData without a JSON Content-Type so the boundary is kept', async () => {
		let seen: RequestInit | undefined;
		const fetch = vi.fn(async (_url: string, init: RequestInit) => {
			seen = init;
			return jsonOk({ id: 1 });
		});
		const form = new FormData();
		form.append('photo', new Blob(['x'], { type: 'image/jpeg' }), 'a.jpg');

		await apiCall(fetch as unknown as typeof globalThis.fetch, '/v1/memorials/1/photo', {
			method: 'PUT',
			body: form,
			token: 't'
		});

		const headers = seen?.headers as Record<string, string>;
		expect(headers['Content-Type']).toBeUndefined();
		expect(seen?.body).toBe(form);
	});

	it('maps an error envelope to ApiError with status, code and details', async () => {
		const fetch = vi.fn(
			async () =>
				new Response(
					JSON.stringify({
						success: false,
						error: { code: 'VALIDATION_ERROR', message: 'bad' },
						details: { field: 'note' }
					}),
					{ status: 400 }
				)
		);
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(
			apiCall(fetch as unknown as typeof globalThis.fetch, '/v1/memorials', {
				method: 'POST',
				body: {},
				token: 't'
			})
		).rejects.toMatchObject({
			status: 400,
			code: 'VALIDATION_ERROR',
			details: { field: 'note' }
		});
	});

	it('turns an unreachable backend into NETWORK_ERROR', async () => {
		const fetch = vi.fn(async () => {
			throw new Error('down');
		});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(
			apiCall(fetch as unknown as typeof globalThis.fetch, '/v1/memorials', { token: 't' })
		).rejects.toBeInstanceOf(ApiError);
	});
});
