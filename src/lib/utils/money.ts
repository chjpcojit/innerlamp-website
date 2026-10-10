/** Format an amount in đồng, e.g. `100.000đ` (vi) / `100,000đ` (en). */
export function formatVnd(amount: number, locale: string): string {
	return `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount)}đ`;
}
