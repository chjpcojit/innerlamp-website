/** Strip formatting, country code and trunk "0"; cap at the country's number length. */
export function normalizePhone(raw: string, dial: string, len: number): string {
	const code = dial.slice(1);
	let d = raw.replace(/\D/g, '');
	if (d.startsWith('00' + code)) d = d.slice(2 + code.length);
	else if (d.startsWith(code) && d.length > len) d = d.slice(code.length);
	if (d.startsWith('0')) d = d.slice(1);
	return d.slice(0, len);
}

/** Group digits in threes: 949123456 → "949 123 456". */
export function formatPhone(digits: string): string {
	return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
}
