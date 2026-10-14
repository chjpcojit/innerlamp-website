/** Valid national number length (digits, without trunk "0"), any country. */
export const PHONE_MIN_LEN = 9;
export const PHONE_MAX_LEN = 10;

/** Strip formatting, country code and trunk "0"; cap at PHONE_MAX_LEN digits. */
export function normalizePhone(raw: string, dial: string): string {
	const code = dial.slice(1);
	let d = raw.replace(/\D/g, '');
	if (d.startsWith('00' + code)) d = d.slice(2 + code.length);
	else if (d.startsWith(code) && d.length > PHONE_MAX_LEN) d = d.slice(code.length);
	if (d.startsWith('0')) d = d.slice(1);
	return d.slice(0, PHONE_MAX_LEN);
}

/** Group digits in threes: 949123456 → "949 123 456". */
export function formatPhone(digits: string): string {
	return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
}
