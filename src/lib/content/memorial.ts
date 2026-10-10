import { m } from '$lib/paraglide/messages';

export const RELATIONS = [
	'paternal_grandfather',
	'paternal_grandmother',
	'maternal_grandfather',
	'maternal_grandmother',
	'father',
	'mother',
	'spouse',
	'sibling',
	'child',
	'other'
] as const;
export type Relation = (typeof RELATIONS)[number];

export const RELATION_LABELS: Record<Relation, () => string> = {
	paternal_grandfather: () => m.mem_rel_paternal_grandfather(),
	paternal_grandmother: () => m.mem_rel_paternal_grandmother(),
	maternal_grandfather: () => m.mem_rel_maternal_grandfather(),
	maternal_grandmother: () => m.mem_rel_maternal_grandmother(),
	father: () => m.mem_rel_father(),
	mother: () => m.mem_rel_mother(),
	spouse: () => m.mem_rel_spouse(),
	sibling: () => m.mem_rel_sibling(),
	child: () => m.mem_rel_child(),
	other: () => m.mem_rel_other()
};

/** Days before the anniversary a reminder fires (0 = on the day). */
export const REMIND_LEADS = [0, 1, 3, 7] as const;
export const REMIND_TIMES = ['06:00', '07:00', '12:00', '19:00'] as const;

export const LUNAR_MONTH_LABELS: (() => string)[] = [
	() => m.mem_month_name_1(),
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
