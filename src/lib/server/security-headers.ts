/**
 * Baseline security headers for every response. CSP allows the app's inline hydration script and
 * Tailwind's inline styles, keeps frames closed, and limits images to the same origin or HTTPS
 * (profile avatars and gallery images are signed GCS URLs).
 * / Header bảo mật chung: CSP, chống nhúng frame, không đoán kiểu nội dung.
 */
export const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	"connect-src 'self' ws: wss:",
	"media-src 'self' blob:",
	"worker-src 'self' blob:"
].join('; ');

/** Applied after the route resolved, so a page can override `Referrer-Policy` (memorial does). */
export function applySecurityHeaders(headers: Headers): void {
	headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
	headers.set('X-Frame-Options', 'DENY');
	headers.set('X-Content-Type-Options', 'nosniff');
	if (!headers.has('Referrer-Policy')) {
		headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	}
}
