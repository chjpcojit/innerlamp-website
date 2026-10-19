export interface Orderable {
	solar_date: string;
	sort_order: number;
	code: string;
}

/**
 * Order of occurrences (BR-CAL-12, BR-CAL-05): solar date, then the event's `sort_order`
 * (Rằm / Mùng Một are last on a shared day), then the event `code`.
 */
export function compareOccurrences(a: Orderable, b: Orderable): number {
	if (a.solar_date !== b.solar_date) return a.solar_date < b.solar_date ? -1 : 1;
	if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
	return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
}
