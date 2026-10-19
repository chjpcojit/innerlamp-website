/** Vietnam time (`Asia/Ho_Chi_Minh`), which is how the backend and BR-CAL-02 define "now". */
const parts = (options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', ...options });

/** Today in Vietnam as `YYYY-MM-DD`. */
export function vietnamToday(): string {
	return parts({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/** Current year in Vietnam. */
export function vietnamYear(): number {
	return Number(vietnamToday().slice(0, 4));
}

/** Current year and month (1–12) in Vietnam. */
export function vietnamYearMonth(): { year: number; month: number } {
	const today = vietnamToday();
	return { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
}
