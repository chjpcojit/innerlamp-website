import type { PageLoad } from './$types';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Normalised `YYYY-MM-DD` of the `?date=` param, falling back to today when missing/invalid. */
export const load: PageLoad = ({ url }) => {
	const match = ISO_DATE.exec(url.searchParams.get('date') ?? '');
	if (match) {
		const [y, mo, d] = [+match[1], +match[2], +match[3]];
		const parsed = new Date(y, mo - 1, d);
		if (parsed.getMonth() === mo - 1 && parsed.getDate() === d) {
			return { date: match[0] };
		}
	}
	const now = new Date();
	const p2 = (n: number) => String(n).padStart(2, '0');
	return { date: `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}` };
};
