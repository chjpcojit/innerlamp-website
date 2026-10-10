import { m } from '$lib/paraglide/messages';

/** Help centre: FAQ entries grouped by topic (from the prototype's `HELP` table). */

export type HelpCategory = 'account' | 'calendar' | 'practice' | 'support';

export const HELP_CATEGORIES: { id: HelpCategory; label: () => string }[] = [
	{ id: 'account', label: () => m.help_cat_account() },
	{ id: 'calendar', label: () => m.help_cat_calendar() },
	{ id: 'practice', label: () => m.help_cat_practice() },
	{ id: 'support', label: () => m.help_cat_support() }
];

export interface HelpEntry {
	id: number;
	category: HelpCategory;
	question: () => string;
	answer: () => string;
}

export const HELP_FAQ: HelpEntry[] = [
	{ id: 1, category: 'account', question: () => m.help_q_1(), answer: () => m.help_a_1() },
	{ id: 2, category: 'account', question: () => m.help_q_2(), answer: () => m.help_a_2() },
	{ id: 3, category: 'account', question: () => m.help_q_3(), answer: () => m.help_a_3() },
	{ id: 4, category: 'calendar', question: () => m.help_q_4(), answer: () => m.help_a_4() },
	{ id: 5, category: 'calendar', question: () => m.help_q_5(), answer: () => m.help_a_5() },
	{ id: 6, category: 'calendar', question: () => m.help_q_6(), answer: () => m.help_a_6() },
	{ id: 7, category: 'practice', question: () => m.help_q_7(), answer: () => m.help_a_7() },
	{ id: 8, category: 'practice', question: () => m.help_q_8(), answer: () => m.help_a_8() },
	{ id: 9, category: 'support', question: () => m.help_q_9(), answer: () => m.help_a_9() },
	{ id: 10, category: 'support', question: () => m.help_q_10(), answer: () => m.help_a_10() }
];
