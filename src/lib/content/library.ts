import { m } from '$lib/paraglide/messages';
import type { IconKind } from '$lib/components/ui/icon-shapes';

export type LibraryCategory = 'sutra' | 'meditation' | 'talk';

export interface LibraryItem {
	category: LibraryCategory;
	icon: IconKind;
	title: () => string;
	sub: () => string;
	duration: () => string;
	tint: string;
	tone: string;
}

export const LIBRARY_CATEGORIES: { id: LibraryCategory; label: () => string }[] = [
	{ id: 'sutra', label: () => m.lib_cat_sutra() },
	{ id: 'meditation', label: () => m.lib_cat_meditation() },
	{ id: 'talk', label: () => m.lib_cat_talk() }
];

const GOLD = { tint: 'rgba(184,134,47,.14)', tone: '#B8862F' };
const ROSE = { tint: 'rgba(194,133,127,.16)', tone: '#C2857F' };
const SAGE = { tint: 'rgba(110,143,122,.16)', tone: '#6E8F7A' };
const SLATE = { tint: 'rgba(34,30,25,.08)', tone: '#4A443C' };

/** Placeholder catalogue until the backend serves library content. */
export const LIBRARY_ITEMS: LibraryItem[] = [
	{
		category: 'sutra',
		icon: 'book',
		title: () => m.lib_item_1_title(),
		sub: () => m.lib_item_1_sub(),
		duration: () => m.lib_dur_chapters({ count: 26 }),
		...GOLD
	},
	{
		category: 'sutra',
		icon: 'book',
		title: () => m.lib_item_2_title(),
		sub: () => m.lib_item_2_sub(),
		duration: () => m.lib_dur_minutes({ count: 38 }),
		...ROSE
	},
	{
		category: 'sutra',
		icon: 'book',
		title: () => m.lib_item_3_title(),
		sub: () => m.lib_item_3_sub(),
		duration: () => m.lib_dur_minutes({ count: 24 }),
		...GOLD
	},
	{
		category: 'sutra',
		icon: 'book',
		title: () => m.lib_item_4_title(),
		sub: () => m.lib_item_4_sub(),
		duration: () => m.lib_dur_minutes({ count: 9 }),
		...GOLD
	},
	{
		category: 'meditation',
		icon: 'med',
		title: () => m.lib_item_5_title(),
		sub: () => m.lib_item_5_sub(),
		duration: () => m.lib_dur_minutes({ count: 20 }),
		...SAGE
	},
	{
		category: 'meditation',
		icon: 'med',
		title: () => m.lib_item_6_title(),
		sub: () => m.lib_item_6_sub(),
		duration: () => m.lib_dur_minutes({ count: 10 }),
		...SAGE
	},
	{
		category: 'talk',
		icon: 'talk',
		title: () => m.lib_item_7_title(),
		sub: () => m.lib_item_7_sub(),
		duration: () => m.lib_dur_minutes({ count: 46 }),
		...SLATE
	},
	{
		category: 'talk',
		icon: 'talk',
		title: () => m.lib_item_8_title(),
		sub: () => m.lib_item_8_sub(),
		duration: () => m.lib_dur_minutes({ count: 52 }),
		...SLATE
	}
];

export const LIBRARY_ENTRIES: {
	icon: IconKind;
	href: string;
	category: LibraryCategory | 'meditate';
	title: () => string;
	sub: () => string;
	tint: string;
	tone: string;
}[] = [
	{
		icon: 'book',
		href: '/library/sutras',
		category: 'sutra',
		title: () => m.lib_entry_sutras_title(),
		sub: () =>
			m.lib_entry_sutras_sub({ count: LIBRARY_ITEMS.filter((i) => i.category === 'sutra').length }),
		...GOLD
	},
	{
		icon: 'talk',
		href: '/library/talks',
		category: 'talk',
		title: () => m.lib_entry_talks_title(),
		sub: () =>
			m.lib_entry_talks_sub({ count: LIBRARY_ITEMS.filter((i) => i.category === 'talk').length }),
		...SLATE
	},
	{
		icon: 'med',
		href: '/practice/meditate',
		category: 'meditate',
		title: () => m.lib_entry_meditate_title(),
		sub: () => m.lib_entry_meditate_sub(),
		...SAGE
	}
];

export const CATEGORY_HREF: Record<LibraryCategory, string> = {
	sutra: '/library/sutras',
	meditation: '/practice/meditate',
	talk: '/library/talks'
};
