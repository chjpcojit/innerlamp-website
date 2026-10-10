import { browser } from '$app/environment';
import { readJson, writeJson } from '$lib/utils/storage';

const STORAGE_KEY = 'il-lamps';
const DAY_MS = 86_400_000;

/** A lamp the visitor lit on the "Thắp đèn" page. */
export interface MyLamp {
	id: string;
	/** Index into `LAMP_TYPES`. */
	type: number;
	/** Index into `LAMP_PURPOSES`. */
	purpose: number;
	/** Person the lamp is for; empty means "all beings". */
	name: string;
	wish: string;
	days: number;
	/** ISO timestamp the lamp was lit. */
	litAt: string;
}

export const daysLeft = (lamp: MyLamp, now = Date.now()) =>
	Math.max(0, lamp.days - Math.floor((now - Date.parse(lamp.litAt)) / DAY_MS));

/** Lamps lit by the visitor, kept on-device until the backend exists. */
class LampState {
	items = $state<MyLamp[]>([]);
	/** False until storage has been read, so SSR and the first client render agree. */
	ready = $state(false);

	init() {
		if (!browser || this.ready) return;
		this.items = readJson<MyLamp[]>(STORAGE_KEY, []);
		this.ready = true;
	}

	/** Lamps that are still burning. */
	get active() {
		return this.items.filter((l) => daysLeft(l) > 0);
	}

	add(lamp: Omit<MyLamp, 'id' | 'litAt'>): MyLamp {
		const created: MyLamp = {
			...lamp,
			id: crypto.randomUUID(),
			litAt: new Date().toISOString()
		};
		this.items = [created, ...this.items];
		writeJson(STORAGE_KEY, $state.snapshot(this.items));
		return created;
	}
}

export const lamps = new LampState();
