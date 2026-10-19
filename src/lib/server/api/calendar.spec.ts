import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalendarYear } from '$lib/types/calendar';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://backend.test', API_KEY: 'site-key' }
}));

const HOUR = 60 * 60_000;

const year = (y: number): CalendarYear => ({ year: y, groups: [], events: [], occurrences: [] });
const ok = (y: number) =>
	new Response(JSON.stringify({ success: true, data: year(y) }), { status: 200 });
const fail = (status: number, code: string, details: Record<string, unknown> = {}) =>
	new Response(JSON.stringify({ success: false, error: { code }, details }), { status });

type Calendar = typeof import('./calendar');

// The cache lives in module state: load a fresh module for every test.
async function setup(...responses: (() => Response | Promise<Response>)[]) {
	vi.resetModules();
	const queue = [...responses];
	const fetch = vi.fn(async () => {
		const next = queue.shift();
		if (!next) throw new Error('unexpected backend call');
		return next();
	});
	const calendar: Calendar = await import('./calendar');
	const get = (y: number) =>
		calendar.getCalendarYear(fetch as unknown as typeof globalThis.fetch, y);
	return { fetch, get };
}

describe('getCalendarYear', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-17T00:00:00Z'));
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('calls the public route with an explicit year, the site key and no Authorization', async () => {
		const { fetch, get } = await setup(() => ok(2026));
		await get(2026);
		const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('http://backend.test/v1/calendar/events?year=2026');
		const headers = init.headers as Record<string, string>;
		expect(headers['x-api-key']).toBe('site-key');
		expect(headers['Authorization']).toBeUndefined();
	});

	it('serves a fresh entry without calling the backend again', async () => {
		const { fetch, get } = await setup(() => ok(2026));
		await get(2026);
		vi.advanceTimersByTime(HOUR - 1);
		expect(await get(2026)).toEqual({ calendar: year(2026), stale: false });
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('refetches an expired entry and replaces it', async () => {
		const { fetch, get } = await setup(
			() => ok(2026),
			() => ok(2026)
		);
		await get(2026);
		vi.advanceTimersByTime(HOUR);
		expect((await get(2026)).stale).toBe(false);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('serves the old copy as stale when the backend fails after expiry', async () => {
		const { get } = await setup(
			() => ok(2026),
			() => fail(500, 'INTERNAL_ERROR')
		);
		await get(2026);
		vi.advanceTimersByTime(HOUR);
		expect(await get(2026)).toEqual({ calendar: year(2026), stale: true });
	});

	it('throws the backend error when there is no copy', async () => {
		const { get } = await setup(() => fail(401, 'INVALID_API_KEY'));
		await expect(get(2026)).rejects.toMatchObject({ status: 401, code: 'INVALID_API_KEY' });
	});

	it('backs off after a 429 for retry_after_seconds, serving the copy meanwhile', async () => {
		const { fetch, get } = await setup(
			() => ok(2026),
			() => fail(429, 'RATE_LIMITED', { retry_after_seconds: 30 }),
			() => ok(2026)
		);
		await get(2026);
		vi.advanceTimersByTime(HOUR);
		expect((await get(2026)).stale).toBe(true); // 429 → stale, back-off starts
		vi.advanceTimersByTime(29_000);
		expect((await get(2026)).stale).toBe(true); // still backing off: no backend call
		expect(fetch).toHaveBeenCalledTimes(2);
		vi.advanceTimersByTime(1_000);
		expect((await get(2026)).stale).toBe(false); // back-off over: asks again
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it('without a copy, a 429 fails at once and is not retried before the wait ends', async () => {
		const { fetch, get } = await setup(
			() => fail(429, 'RATE_LIMITED'),
			() => ok(2026)
		);
		await expect(get(2026)).rejects.toMatchObject({ status: 429 });
		await expect(get(2026)).rejects.toMatchObject({ status: 429 });
		expect(fetch).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(60_000); // default wait when retry_after_seconds is absent
		expect((await get(2026)).stale).toBe(false);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('keeps years apart', async () => {
		const { get } = await setup(
			() => ok(2026),
			() => ok(2027)
		);
		expect((await get(2026)).calendar.year).toBe(2026);
		expect((await get(2027)).calendar.year).toBe(2027);
	});
});
