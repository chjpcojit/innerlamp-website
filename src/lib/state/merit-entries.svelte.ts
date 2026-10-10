import { MERIT_ENTRIES, type MeritEntry } from '$lib/content/merit';
import { OFFER_PURPOSES, OFFER_TEMPLES, LAMP_PURPOSE_INDEX } from '$lib/content/offer';
import { merit } from '$lib/state/merit.svelte';

export interface MeritRow extends MeritEntry {
	id: string;
	/** True for a "thỉnh đèn tại chùa" offering. */
	lamp: boolean;
}

/** The visitor's own offerings (newest first) followed by the placeholder history. */
export function meritEntries(): MeritRow[] {
	return [
		...merit.entries.map((o) => ({
			id: o.id,
			date: o.date,
			temple: OFFER_TEMPLES[o.temple].name,
			purpose: OFFER_PURPOSES[o.purpose].label,
			amount: o.amount,
			confirmed: o.confirmed,
			lamp: o.purpose === LAMP_PURPOSE_INDEX
		})),
		...MERIT_ENTRIES.map((e, i) => ({
			...e,
			id: `seed-${i}`,
			lamp: !!e.lamp
		}))
	];
}
