import { describe, expect, it } from 'vitest';
import { MEMORIAL_PAGE_HEADERS, memorialPageHeaders } from './memorial-headers';

describe('memorial page headers', () => {
	it('keeps personal data out of shared caches and referrers', () => {
		expect(MEMORIAL_PAGE_HEADERS).toEqual({
			'Cache-Control': 'private, no-store',
			'Referrer-Policy': 'no-referrer'
		});
	});

	it('returns a fresh copy per call', () => {
		const a = memorialPageHeaders();
		a['Cache-Control'] = 'public';
		expect(memorialPageHeaders()['Cache-Control']).toBe('private, no-store');
	});
});
