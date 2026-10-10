import { m } from '$lib/paraglide/messages';

export type ArticleCategory = 'doctrine' | 'sutra' | 'meditation' | 'life' | 'filial';

export interface ArticleItem {
	id: number;
	category: ArticleCategory;
	categoryLabel: () => string;
	title: () => string;
	excerpt: () => string;
	/** Author and reading time, already localised. */
	meta: () => string;
	/** ISO date; formatted per locale at render time. */
	date: string;
}

export const ARTICLE_CATEGORIES: { id: ArticleCategory; label: () => string }[] = [
	{ id: 'doctrine', label: () => m.articles_tab_doctrine() },
	{ id: 'sutra', label: () => m.articles_tab_sutra() },
	{ id: 'meditation', label: () => m.articles_tab_meditation() },
	{ id: 'life', label: () => m.articles_tab_life() },
	{ id: 'filial', label: () => m.articles_tab_filial() }
];

const LABEL: Record<ArticleCategory, () => string> = {
	doctrine: () => m.article_cat_doctrine(),
	sutra: () => m.article_cat_sutra(),
	meditation: () => m.article_cat_meditation(),
	life: () => m.article_cat_life(),
	filial: () => m.article_cat_filial()
};

const TITLES = [
	() => m.article_1_title(),
	() => m.article_2_title(),
	() => m.article_3_title(),
	() => m.article_4_title(),
	() => m.article_5_title(),
	() => m.article_6_title(),
	() => m.article_7_title(),
	() => m.article_8_title()
];
const EXCERPTS = [
	() => m.article_1_ex(),
	() => m.article_2_ex(),
	() => m.article_3_ex(),
	() => m.article_4_ex(),
	() => m.article_5_ex(),
	() => m.article_6_ex(),
	() => m.article_7_ex(),
	() => m.article_8_ex()
];
const METAS = [
	() => m.article_1_meta(),
	() => m.article_2_meta(),
	() => m.article_3_meta(),
	() => m.article_4_meta(),
	() => m.article_5_meta(),
	() => m.article_6_meta(),
	() => m.article_7_meta(),
	() => m.article_8_meta()
];
const META: [ArticleCategory, string][] = [
	['meditation', '2026-09-28'],
	['sutra', '2026-09-24'],
	['life', '2026-09-20'],
	['filial', '2026-09-15'],
	['doctrine', '2026-09-10'],
	['meditation', '2026-09-05'],
	['life', '2026-09-01'],
	['doctrine', '2026-08-27']
];

/** Placeholder catalogue until the backend serves articles; newest first. */
export const ARTICLE_LIST: ArticleItem[] = META.map(([category, date], i) => ({
	id: i + 1,
	category,
	categoryLabel: LABEL[category],
	title: TITLES[i],
	excerpt: EXCERPTS[i],
	meta: METAS[i],
	date
}));
