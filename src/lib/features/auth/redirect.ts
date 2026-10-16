/**
 * Accepts only a same-site relative path for the post-login `redirect` parameter.
 * / Chỉ chấp nhận đường dẫn tương đối cùng site cho tham số `redirect` sau đăng nhập.
 */
export function safeRedirect(raw: string | null | undefined): string | null {
	if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return null;
	// Reject control characters and anything that parses as another origin.
	// eslint-disable-next-line no-control-regex
	if (/[\u0000-\u001f]/.test(raw)) return null;
	try {
		const url = new URL(raw, 'http://localhost');
		if (url.origin !== 'http://localhost') return null;
	} catch {
		return null;
	}
	return raw;
}
