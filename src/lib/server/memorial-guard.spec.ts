import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { memorialToken, requireMemorialSession } from './memorial-guard';

vi.mock('$app/environment', () => ({ dev: true }));

const cookies = (token?: string) =>
	({
		get: (name: string) => (name === 'il_token' ? token : undefined)
	}) as unknown as Cookies;

const locals = (name?: string) => ({ user: name ? { name } : null }) as unknown as App.Locals;

describe('memorial guard', () => {
	it('returns null when the cookie or the session is missing', () => {
		expect(memorialToken(locals('An'), cookies(undefined))).toBeNull();
		expect(memorialToken(locals(undefined), cookies('t'))).toBeNull();
	});

	it('returns the token only for a real session', () => {
		expect(memorialToken(locals('An'), cookies('t'))).toBe('t');
	});

	it('redirects to login instead of returning a token', () => {
		expect(() => requireMemorialSession(locals(undefined), cookies(undefined))).toThrow();
	});
});
