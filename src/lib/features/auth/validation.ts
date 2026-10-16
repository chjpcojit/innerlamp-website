const MIN = 8;
const MAX = 64;

/**
 * Password length per product BR-ONB-06: 8–64 characters after NFC (not bytes). The same rule
 * applies to a new password in forgot-password. / Độ dài mật khẩu tính theo ký tự sau NFC.
 */
export function checkPassword(password: string): 'ok' | 'too_short' | 'too_long' {
	const length = [...password.normalize('NFC')].length;
	if (length < MIN) return 'too_short';
	if (length > MAX) return 'too_long';
	return 'ok';
}
