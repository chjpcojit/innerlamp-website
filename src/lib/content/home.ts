import { m } from '$lib/paraglide/messages';
import type { IconKind } from '$lib/components/ui/icon-shapes';
import { BUDDHA_LIST } from './buddhas';
import { TEMPLE_LIST } from './temples';
import { PHOTO_LIST } from './photos';
import { ARTICLE_LIST } from './articles';

export interface RoutineItem {
	icon: IconKind;
	title: () => string;
	sub: () => string;
	tint: string;
	tone: string;
}

export const ROUTINES: RoutineItem[] = [
	{
		icon: 'med',
		title: () => m.routine_1_title(),
		sub: () => m.routine_1_sub(),
		tint: 'rgba(110,143,122,.16)',
		tone: '#6E8F7A'
	},
	{
		icon: 'book',
		title: () => m.routine_2_title(),
		sub: () => m.routine_2_sub(),
		tint: 'rgba(184,134,47,.14)',
		tone: '#B8862F'
	},
	{
		icon: 'lamp',
		title: () => m.routine_3_title(),
		sub: () => m.routine_3_sub(),
		tint: 'rgba(194,133,127,.16)',
		tone: '#C2857F'
	}
];

/** First entries of the full catalogues, shown on the home page. */
export const BUDDHAS = BUDDHA_LIST.slice(0, 6);

export const TEMPLES = TEMPLE_LIST.slice(0, 3);

export const ARTICLES = ARTICLE_LIST.slice(0, 4).map((a) => ({
	category: a.categoryLabel,
	title: a.title,
	meta: a.meta
}));

/** Placeholder practice stats for the logged-in home until the backend provides them. */
export const PLACEHOLDER_STATS = { streakDays: 42 };

export const GUEST_PERKS: { icon: IconKind; title: () => string; desc: () => string }[] = [
	{ icon: 'journal', title: () => m.perk_journal_title(), desc: () => m.perk_journal_desc() },
	{ icon: 'calendar', title: () => m.perk_memorial_title(), desc: () => m.perk_memorial_desc() },
	{ icon: 'tree', title: () => m.perk_tree_title(), desc: () => m.perk_tree_desc() },
	{ icon: 'temple', title: () => m.perk_sangha_title(), desc: () => m.perk_sangha_desc() }
];

export const PHOTOS = PHOTO_LIST.slice(0, 4);

/** Lunar month names, index 0 = month 1. */
export const LUNAR_MONTHS: (() => string)[] = [
	() => m.lunar_month_1(),
	() => m.lunar_month_2(),
	() => m.lunar_month_3(),
	() => m.lunar_month_4(),
	() => m.lunar_month_5(),
	() => m.lunar_month_6(),
	() => m.lunar_month_7(),
	() => m.lunar_month_8(),
	() => m.lunar_month_9(),
	() => m.lunar_month_10(),
	() => m.lunar_month_11(),
	() => m.lunar_month_12()
];
