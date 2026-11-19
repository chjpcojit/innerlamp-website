import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { FLASH_COOKIE, setMemorialFlash, takeMemorialFlash } from './memorial-flash';

vi.mock('$app/environment', () => ({ dev: true }));

function jar(initial?: string) {
	const store = new Map<string, string>();
	if (initial !== undefined) store.set(FLASH_COOKIE, initial);
	const cookies = {
		get: (name: string) => store.get(name),
		set: (name: string, value: string) => store.set(name, value),
		delete: (name: string) => store.delete(name)
	};
	return { cookies: cookies as unknown as Cookies, store };
}

describe('memorial flash cookie', () => {
	it('stores a one-shot message without exposing it in the URL', () => {
		const { cookies, store } = jar();
		setMemorialFlash(cookies, { kind: 'deleted' });
		expect(JSON.parse(store.get(FLASH_COOKIE) ?? '')).toEqual({ kind: 'deleted' });
	});

	it('reads then clears it', () => {
		const { cookies, store } = jar(JSON.stringify({ kind: 'saved' }));
		expect(takeMemorialFlash(cookies)).toEqual({ kind: 'saved' });
		expect(store.has(FLASH_COOKIE)).toBe(false);
	});

	it('drops a name left in an old cookie', () => {
		const { cookies } = jar(JSON.stringify({ kind: 'deleted', name: 'Bà Bình' }));
		expect(takeMemorialFlash(cookies)).toEqual({ kind: 'deleted' });
	});

	it('drops a corrupt cookie', () => {
		const { cookies } = jar('not json');
		expect(takeMemorialFlash(cookies)).toBeNull();
	});
});
