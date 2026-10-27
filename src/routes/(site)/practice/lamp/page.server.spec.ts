import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Lamp, LampGardenPage } from '$lib/types/lamp';
import { actions, load } from './+page.server';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://backend.test', API_KEY: 'site-key' }
}));

const LAMP: Lamp = {
	id: 7,
	lamp_type: 'OIL_LAMP',
	intention: 'PEACE',
	recipient: null,
	prayer: null,
	duration_days: 7,
	is_anonymous: false,
	lighter_name: 'Vô danh',
	lit_at: '2026-10-27T10:00:00Z',
	end_at: '2026-11-03T10:00:00Z'
};
const GARDEN: LampGardenPage = {
	items: [],
	total: 0,
	counts: { OIL_LAMP: 0, LOTUS_CANDLE: 0, FLOWER_LANTERN: 0 },
	has_more: false,
	next_cursor: null
};

const envelope = (status: number, data: unknown) =>
	new Response(JSON.stringify({ success: true, data }), { status });
const failure = (status: number, code: string) =>
	new Response(JSON.stringify({ success: false, error: { code } }), { status });

function fakeFetch(response?: () => Response | Promise<Response>) {
	return vi.fn(async (...args: [string, RequestInit?]) => {
		void args;
		if (!response) throw new Error('unexpected backend call');
		return response();
	});
}

const cookies = (token?: string) => ({
	get: (name: string) => (name === 'il_token' ? token : undefined)
});
const USER = { name: 'Tâm' };

function form(values: Record<string, string>) {
	const body = new FormData();
	for (const [k, v] of Object.entries({
		lamp_type: 'OIL_LAMP',
		intention: 'PEACE',
		recipient: '',
		prayer: '',
		duration_days: '7',
		...values
	}))
		body.set(k, v);
	return new Request('http://site.test/practice/lamp?/light', { method: 'POST', body });
}

// SvelteKit events carry more than the action reads; the cast keeps the tests short.
// / Event của SvelteKit có nhiều field hơn action dùng; ép kiểu cho test gọn.
type LightEvent = Parameters<typeof actions.light>[0];
type LoadEvent = Parameters<typeof load>[0];

async function light(
	values: Record<string, string>,
	response?: () => Response | Promise<Response>,
	{ token = 'tok', user = USER as unknown }: { token?: string; user?: unknown } = {}
) {
	const fetch = fakeFetch(response);
	const result = await actions.light({
		request: form(values),
		cookies: cookies(token),
		fetch,
		locals: { user }
	} as unknown as LightEvent);
	return { fetch, result };
}

const sentBody = (fetch: ReturnType<typeof fakeFetch>) =>
	JSON.parse(String(fetch.mock.calls[0][1]?.body)) as Record<string, unknown>;

describe('lamp page load', () => {
	it('a guest gets the introduction and no backend call', async () => {
		const fetch = fakeFetch();
		const data = await load({
			locals: {},
			cookies: cookies(undefined),
			fetch
		} as unknown as LoadEvent);
		expect(data).toEqual({ isGuest: true, garden: null });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('a signed-in visitor gets the first garden page with the Bearer token', async () => {
		const fetch = fakeFetch(() => envelope(200, GARDEN));
		const data = await load({
			locals: { user: USER },
			cookies: cookies('tok'),
			fetch
		} as unknown as LoadEvent);
		expect(data).toEqual({ isGuest: false, garden: GARDEN });
		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe('http://backend.test/v1/lamps');
		expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok');
	});

	it('a garden failure leaves garden null and keeps the page', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const fetch = fakeFetch(() => failure(503, 'SERVICE_UNAVAILABLE'));
		const data = await load({
			locals: { user: USER },
			cookies: cookies('tok'),
			fetch
		} as unknown as LoadEvent);
		expect(data).toEqual({ isGuest: false, garden: null });
	});
});

describe('lamp page action light', () => {
	beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
	afterEach(() => vi.restoreAllMocks());

	it('without a session answers 401 and makes no backend call', async () => {
		const { fetch, result } = await light({}, undefined, { token: '' });
		expect(result).toMatchObject({ status: 401, data: { lampError: 'auth' } });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('a blank recipient is left out, never replaced by localized text', async () => {
		const { fetch, result } = await light({ recipient: '   ' }, () => envelope(201, LAMP));
		expect(result).toEqual({ lamp: LAMP });
		const body = sentBody(fetch);
		expect(body).not.toHaveProperty('recipient');
		expect(body).toEqual({
			lamp_type: 'OIL_LAMP',
			intention: 'PEACE',
			prayer: null,
			duration_days: 7,
			is_anonymous: false
		});
	});

	it('sends the trimmed NFC recipient and prayer and is_anonymous from the switch', async () => {
		const { fetch } = await light(
			{ recipient: ' Bà ngoại ', prayer: ' Mong bà bình an ', is_anonymous: 'true' },
			() => envelope(201, { ...LAMP, recipient: 'Bà ngoại' })
		);
		const body = sentBody(fetch);
		expect(body.recipient).toBe('Bà ngoại'.normalize('NFC'));
		expect(body.prayer).toBe('Mong bà bình an');
		expect(body.is_anonymous).toBe(true);
		expect(body).not.toHaveProperty('lighter_name');
	});

	it('the earlier identical lamp (200) is shown as lit', async () => {
		const { result } = await light({}, () => envelope(200, LAMP));
		expect(result).toEqual({ lamp: LAMP });
	});

	it.each([
		['recipient', { recipient: 'a'.repeat(101) }],
		['prayer', { prayer: 'a'.repeat(301) }],
		['duration', { duration_days: '5' }],
		['lamp type', { lamp_type: 'CANDLE' }]
	])('invalid %s answers 400 without a backend call', async (_name, values) => {
		const { fetch, result } = await light(values);
		expect(result).toMatchObject({ status: 400, data: { lampError: 'invalid' } });
		expect(fetch).not.toHaveBeenCalled();
	});

	it.each([
		[400, 'VALIDATION_ERROR', 400, 'invalid'],
		[401, 'UNAUTHORIZED', 401, 'auth'],
		[409, 'LAMP_LIMIT_REACHED', 409, 'limit'],
		[429, 'RATE_LIMITED', 429, 'failed'],
		[503, 'SERVICE_UNAVAILABLE', 502, 'failed']
	])('backend %i %s → %i %s', async (status, code, expected, lampError) => {
		const { result } = await light({}, () => failure(status, code));
		expect(result).toMatchObject({ status: expected, data: { lampError } });
	});

	it('a network error → 502 failed', async () => {
		const { result } = await light({}, () => Promise.reject(new TypeError('offline')));
		expect(result).toMatchObject({ status: 502, data: { lampError: 'failed' } });
	});
});
