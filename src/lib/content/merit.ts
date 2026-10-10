import { m } from '$lib/paraglide/messages';

/** Placeholder merit data (copied from the design mock) until the backend serves it. */

export interface MeritEntry {
	/** [day, month, year] */
	date: [number, number, number];
	temple: () => string;
	purpose: () => string;
	amount: number;
	confirmed: boolean;
	/** A "thỉnh đèn tại chùa" offering, counted in the lamp stat. */
	lamp?: boolean;
}

export const MERIT_ENTRIES: MeritEntry[] = [
	{
		date: [24, 9, 2026],
		temple: () => m.mr_temple_tuquang(),
		purpose: () => m.mr_purpose_meal(),
		amount: 500000,
		confirmed: true
	},
	{
		date: [3, 9, 2026],
		temple: () => m.mr_temple_tuquang(),
		purpose: () => m.mr_purpose_lamp(),
		amount: 100000,
		confirmed: true,
		lamp: true
	},
	{
		date: [21, 8, 2026],
		temple: () => m.mr_temple_vinhnghiem(),
		purpose: () => m.mr_purpose_kitchen(),
		amount: 200000,
		confirmed: true
	},
	{
		date: [10, 8, 2026],
		temple: () => m.mr_temple_tuquang(),
		purpose: () => m.mr_purpose_triple_gem(),
		amount: 200000,
		confirmed: true
	}
];

export const MERIT_YEAR = 2026;

export const MERIT_PROGRESS = { received: 186, goal: 400, offerings: 1240, spent: 92 };
