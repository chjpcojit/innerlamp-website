import { getLocale } from '$lib/paraglide/runtime';

/** `YYYY-MM-DD` → locale date; empty string when the article has no date. */
export function formatArticleDate(iso: string | null) {
	if (!iso) return '';
	return new Date(`${iso}T00:00:00`).toLocaleDateString(getLocale(), {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}
