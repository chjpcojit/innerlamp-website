import { browser } from '$app/environment';
import { readJson, writeJson } from '$lib/utils/storage';

const STORAGE_KEY = 'il-merit';

/** An offering the visitor made through `/offer`. Temple / purpose are indices into `$lib/content/offer`. */
export interface MyOffering {
	id: string;
	/** [day, month, year] */
	date: [number, number, number];
	temple: number;
	purpose: number;
	amount: number;
	confirmed: boolean;
}

export interface MonthlySupport {
	temple: number;
	amount: number;
}

interface Stored {
	entries: MyOffering[];
	monthly: MonthlySupport | null;
}

/** Merit book (sổ công đức), kept on-device until the backend records offerings. */
class MeritState {
	entries = $state<MyOffering[]>([]);
	monthly = $state<MonthlySupport | null>(null);
	/** False until storage has been read, so SSR and the first client render agree. */
	ready = $state(false);

	init() {
		if (!browser || this.ready) return;
		const stored = readJson<Stored>(STORAGE_KEY, { entries: [], monthly: null });
		this.entries = stored.entries;
		this.monthly = stored.monthly;
		this.ready = true;
	}

	add(offering: Omit<MyOffering, 'id' | 'date' | 'confirmed'>, monthly: boolean) {
		this.init();
		const now = new Date();
		this.entries = [
			{
				...offering,
				id: crypto.randomUUID(),
				date: [now.getDate(), now.getMonth() + 1, now.getFullYear()],
				confirmed: false
			},
			...this.entries
		];
		if (monthly) this.monthly = { temple: offering.temple, amount: offering.amount };
		this.persist();
	}

	stopMonthly() {
		this.monthly = null;
		this.persist();
	}

	private persist() {
		writeJson(STORAGE_KEY, $state.snapshot({ entries: this.entries, monthly: this.monthly }));
	}
}

export const merit = new MeritState();
