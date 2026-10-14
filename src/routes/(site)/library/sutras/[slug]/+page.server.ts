import { error, redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import {
	SUTRA_LINES_PAGE_SIZE,
	getSutra,
	listSutraLines,
	listSutras
} from '$lib/server/api/sutras';
import type { SutraLine, SutraSummary } from '$lib/types/sutra';
import { defaultTranslation, groupChapters } from '$lib/utils/sutra';
import type { PageServerLoad } from './$types';

type Fetch = typeof globalThis.fetch;

/** Safety stop for a runaway `total_pages`; 20 × 500 lines is far beyond any seeded text. */
const MAX_LINE_PAGES = 20;
const RELATED_COUNT = 4;

/** Whole text of one translation, or `null` when the backend cannot deliver it. */
async function loadLines(fetch: Fetch, id: string, translation: string) {
	const lines: SutraLine[] = [];
	try {
		for (let page = 1; page <= MAX_LINE_PAGES; page++) {
			const res = await listSutraLines(fetch, id, translation, {
				page,
				pageSize: SUTRA_LINES_PAGE_SIZE
			});
			lines.push(...res.items);
			if (page >= res.total_pages || res.items.length === 0) break;
		}
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return null;
	}
	return lines;
}

/** Other texts of the same tradition; empty when the backend cannot deliver them. */
async function loadRelated(fetch: Fetch, id: string, tradition: SutraSummary['tradition']) {
	try {
		const page = await listSutras(fetch, {
			tradition: tradition as 'THERAVADA' | 'MAHAYANA' | 'VAJRAYANA'
		});
		return page.items.filter((s) => s.id !== id).slice(0, RELATED_COUNT);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return [];
	}
}

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	let sutra;
	try {
		sutra = await getSutra(fetch, params.slug);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 404) error(404);
		error(502, 'Backend API error');
	}

	const requested = url.searchParams.get('translation');
	const translation =
		sutra.translations.find((t) => t.key === requested) ?? defaultTranslation(sutra.translations);
	// An unknown `?translation=` falls back to the default one under a clean URL.
	if (requested !== null && translation?.key !== requested) redirect(307, url.pathname);

	const [lines, related] = await Promise.all([
		translation ? loadLines(fetch, sutra.id, translation.key) : [],
		loadRelated(fetch, sutra.id, sutra.tradition)
	]);

	return {
		sutra,
		translation: translation ?? null,
		/** `null` when the text failed to load; `[]` when the sutra has no translation. */
		chapters: lines ? groupChapters(lines) : null,
		related
	};
};
