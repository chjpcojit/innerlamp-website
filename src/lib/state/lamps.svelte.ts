import { browser } from '$app/environment';
import { readJson, writeJson } from '$lib/utils/storage';

const STORAGE_KEY = 'il-lamps';
const DAY_MS = 86_400_000;

/** A lamp the visitor lit, remembered so the garden can mark it as theirs. */
interface MyLamp {
	id: number;
	/** RFC 3339 time the lamp goes out. */
	endAt: string;
}

/** Whole days until `endAt`, counting a partial day as one. */
export const daysLeft = (endAt: string, now = Date.now()) =>
	Math.max(0, Math.ceil((Date.parse(endAt) - now) / DAY_MS));

/**
 * Ids of lamps lit on this device. The backend has no "my lamps" endpoint yet (v1), so this
 * stays on-device and only drives the "you" highlight in the shared garden.
 */
class LampState {
	items = $state<MyLamp[]>([]);
	/** False until storage has been read, so SSR and the first client render agree. */
	ready = $state(false);

	init() {
		if (!browser || this.ready) return;
		const stored = readJson<unknown>(STORAGE_KEY, []);
		// Drops expired lamps and entries in the pre-backend local format.
		this.items = (Array.isArray(stored) ? (stored as MyLamp[]) : []).filter(
			(l) => typeof l?.id === 'number' && daysLeft(l.endAt) > 0
		);
		this.ready = true;
	}

	has(id: number) {
		return this.items.some((l) => l.id === id);
	}

	add(id: number, endAt: string) {
		if (this.has(id)) return;
		this.items = [{ id, endAt }, ...this.items];
		writeJson(STORAGE_KEY, $state.snapshot(this.items));
	}
}

export const lamps = new LampState();
