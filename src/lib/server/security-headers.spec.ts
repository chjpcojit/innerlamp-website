import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY, applySecurityHeaders } from './security-headers';

describe('security headers', () => {
	it('closes frames and keeps a restrictive default', () => {
		expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
		expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
		expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
	});

	it('sets CSP, frame and MIME headers', () => {
		const headers = new Headers();
		applySecurityHeaders(headers);
		expect(headers.get('Content-Security-Policy')).toBe(CONTENT_SECURITY_POLICY);
		expect(headers.get('X-Frame-Options')).toBe('DENY');
		expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
	});

	it('keeps a stricter page-level Referrer-Policy', () => {
		const headers = new Headers({ 'Referrer-Policy': 'no-referrer' });
		applySecurityHeaders(headers);
		expect(headers.get('Referrer-Policy')).toBe('no-referrer');
	});
});
