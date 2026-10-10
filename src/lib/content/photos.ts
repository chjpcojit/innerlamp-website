import { m } from '$lib/paraglide/messages';

export type PhotoCategory = 'temple' | 'statue' | 'bodhisattva' | 'festival' | 'life';

export interface PhotoItem {
	id: number;
	name: () => string;
	place: () => string;
	caption: () => string;
	category: PhotoCategory;
}

export const PHOTO_CATEGORIES: { id: PhotoCategory; label: () => string }[] = [
	{ id: 'temple', label: () => m.gallery_cat_temple() },
	{ id: 'statue', label: () => m.gallery_cat_statue() },
	{ id: 'bodhisattva', label: () => m.gallery_cat_bodhisattva() },
	{ id: 'festival', label: () => m.gallery_cat_festival() },
	{ id: 'life', label: () => m.gallery_cat_life() }
];

const CATEGORY_OF: PhotoCategory[] = [
	'temple',
	'statue',
	'bodhisattva',
	'festival',
	'temple',
	'statue',
	'life',
	'festival',
	'temple',
	'statue',
	'bodhisattva',
	'life',
	'life',
	'temple',
	'festival',
	'bodhisattva'
];

const NAMES = [
	() => m.photo_1_name(),
	() => m.photo_2_name(),
	() => m.photo_3_name(),
	() => m.photo_4_name(),
	() => m.photo_5_name(),
	() => m.photo_6_name(),
	() => m.photo_7_name(),
	() => m.photo_8_name(),
	() => m.photo_9_name(),
	() => m.photo_10_name(),
	() => m.photo_11_name(),
	() => m.photo_12_name(),
	() => m.photo_13_name(),
	() => m.photo_14_name(),
	() => m.photo_15_name(),
	() => m.photo_16_name()
];
const PLACES = [
	() => m.photo_1_place(),
	() => m.photo_2_place(),
	() => m.photo_3_place(),
	() => m.photo_4_place(),
	() => m.photo_5_place(),
	() => m.photo_6_place(),
	() => m.photo_7_place(),
	() => m.photo_8_place(),
	() => m.photo_9_place(),
	() => m.photo_10_place(),
	() => m.photo_11_place(),
	() => m.photo_12_place(),
	() => m.photo_13_place(),
	() => m.photo_14_place(),
	() => m.photo_15_place(),
	() => m.photo_16_place()
];
const CAPTIONS = [
	() => m.photo_1_cap(),
	() => m.photo_2_cap(),
	() => m.photo_3_cap(),
	() => m.photo_4_cap(),
	() => m.photo_5_cap(),
	() => m.photo_6_cap(),
	() => m.photo_7_cap(),
	() => m.photo_8_cap(),
	() => m.photo_9_cap(),
	() => m.photo_10_cap(),
	() => m.photo_11_cap(),
	() => m.photo_12_cap(),
	() => m.photo_13_cap(),
	() => m.photo_14_cap(),
	() => m.photo_15_cap(),
	() => m.photo_16_cap()
];

/** Placeholder catalogue until the backend serves photos. */
export const PHOTO_LIST: PhotoItem[] = NAMES.map((name, i) => ({
	id: i + 1,
	name,
	place: PLACES[i],
	caption: CAPTIONS[i],
	category: CATEGORY_OF[i]
}));
