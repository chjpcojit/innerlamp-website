import { browser } from '$app/environment';
import { readJson, writeJson } from '$lib/utils/storage';

const STORAGE_KEY = 'il-temple-follow';

/** Temples the visitor follows, per device (no backend yet), keyed by temple id. */
class TempleFollowState {
	ids = $state<string[]>([]);

	init() {
		if (!browser) return;
		this.ids = readJson<string[]>(STORAGE_KEY, []);
	}

	has(id: string) {
		return this.ids.includes(id);
	}

	toggle(id: string) {
		this.ids = this.has(id) ? this.ids.filter((x) => x !== id) : [...this.ids, id];
		writeJson(STORAGE_KEY, $state.snapshot(this.ids));
	}
}

export const templeFollow = new TempleFollowState();
