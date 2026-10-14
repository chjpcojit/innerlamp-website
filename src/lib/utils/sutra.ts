import { m } from '$lib/paraglide/messages';
import type {
	SutraLine,
	SutraSummary,
	SutraTranslationSummary,
	SutraTradition
} from '$lib/types/sutra';

/** Backend enums are open: an unknown value yields `undefined` so the UI can skip the badge. */
const TRADITION_LABELS: Record<string, () => string> = {
	THERAVADA: () => m.sutra_tradition_theravada(),
	MAHAYANA: () => m.sutra_tradition_mahayana(),
	VAJRAYANA: () => m.sutra_tradition_vajrayana()
};

const VARIANT_LABELS: Record<string, () => string> = {
	translation: () => m.sutra_variant_translation(),
	chant: () => m.sutra_variant_chant(),
	meaning: () => m.sutra_variant_meaning(),
	poem: () => m.sutra_variant_poem()
};

/** Cover colour per tradition; unknown values fall back to the first. */
const TRADITION_COVERS: Record<string, string> = {
	MAHAYANA: 'bg-gold-deep',
	THERAVADA: 'bg-sage',
	VAJRAYANA: 'bg-maroon'
};

export const traditionLabel = (tradition: SutraTradition) => TRADITION_LABELS[tradition]?.();

export const traditionCover = (tradition: SutraTradition) =>
	TRADITION_COVERS[tradition] ?? 'bg-gold-deep';

/** Title in the visitor's locale when the catalogue has one, otherwise the Vietnamese one. */
export const sutraTitle = (titles: SutraSummary['titles'], locale: string) =>
	titles[locale] || titles.vi;

/** First other-language title (Pali, Sanskrit, Chinese, English) shown under the main one. */
export function sutraAltTitle(titles: SutraSummary['titles'], locale: string) {
	const main = sutraTitle(titles, locale);
	for (const lang of ['pli', 'sa', 'zh', 'en']) {
		if (titles[lang] && titles[lang] !== main) return titles[lang];
	}
	return '';
}

/** Collection and chanting time, e.g. `Bát Nhã · 4 phút tụng`; skips what the backend lacks. */
export const sutraMeta = (s: Pick<SutraSummary, 'collection' | 'duration_minutes'>) =>
	[s.collection, s.duration_minutes ? m.sutras_minutes({ minutes: s.duration_minutes }) : '']
		.filter(Boolean)
		.join(' · ');

/** `Tiếng Việt · Bản dịch`: language in the visitor's locale plus the variant when known. */
export function translationLabel(t: SutraTranslationSummary, locale: string) {
	let lang = t.lang;
	try {
		lang = new Intl.DisplayNames([locale], { type: 'language' }).of(t.lang) ?? t.lang;
	} catch {
		// Unknown language subtag: show the raw code.
	}
	return [lang, VARIANT_LABELS[t.variant]?.()].filter(Boolean).join(' · ');
}

/**
 * Translation to open when none is requested: Vietnamese before English before anything else;
 * within a language the plain translation before chant, meaning and verse versions.
 */
export function defaultTranslation<T extends SutraTranslationSummary>(translations: T[]) {
	const langRank = (t: T) => (t.lang === 'vi' ? 0 : t.lang === 'en' ? 1 : 2);
	const variantRank = (t: T) => (t.variant === 'translation' ? 0 : 1);
	return [...translations].sort(
		(a, b) => langRank(a) - langRank(b) || variantRank(a) - variantRank(b)
	)[0];
}

export interface SutraChapter {
	/** Part name; `null` for text before the first named part (or text with no parts). */
	title: string | null;
	/** One verse/line per `\n`. */
	text: string;
}

/** Splits consecutive lines into chapters wherever `section` changes. */
export function groupChapters(lines: SutraLine[]): SutraChapter[] {
	const chapters: { title: string | null; lines: string[] }[] = [];
	for (const line of lines) {
		const last = chapters.at(-1);
		if (last && last.title === line.section) last.lines.push(line.text);
		else chapters.push({ title: line.section, lines: [line.text] });
	}
	return chapters.map((c) => ({ title: c.title, text: c.lines.join('\n') }));
}
