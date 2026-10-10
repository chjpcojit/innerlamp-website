import { browser } from '$app/environment';
import { readJson, writeJson } from '$lib/utils/storage';
import type { MemorialEntry } from '$lib/types/memorial';

const STORAGE_KEY = 'il-memorial';

/** Memorial book, kept on-device until the backend serves it. */
class MemorialState {
	entries = $state<MemorialEntry[]>([]);
	/** False until storage has been read, so the SSR and first client render agree. */
	ready = $state(false);
	/** One-shot message shown on the list after a save / delete (message key + name). */
	flash = $state<{ kind: 'saved' | 'saved_reminder' | 'deleted'; name: string } | null>(null);

	private flashTimer: ReturnType<typeof setTimeout> | undefined;

	init() {
		if (!browser || this.ready) return;
		this.entries = readJson<MemorialEntry[]>(STORAGE_KEY, []);
		this.ready = true;
	}

	get(id: string) {
		return this.entries.find((e) => e.id === id);
	}

	/** Insert or replace by id. */
	save(entry: MemorialEntry) {
		const exists = this.entries.some((e) => e.id === entry.id);
		this.persist(
			exists ? this.entries.map((e) => (e.id === entry.id ? entry : e)) : [...this.entries, entry]
		);
		this.showFlash(entry.remind && entry.sync ? 'saved_reminder' : 'saved', entry.name);
	}

	remove(id: string) {
		const entry = this.get(id);
		this.persist(this.entries.filter((e) => e.id !== id));
		if (entry) this.showFlash('deleted', entry.name);
	}

	private persist(next: MemorialEntry[]) {
		this.entries = next;
		writeJson(STORAGE_KEY, $state.snapshot(next));
	}

	private showFlash(kind: 'saved' | 'saved_reminder' | 'deleted', name: string) {
		clearTimeout(this.flashTimer);
		this.flash = { kind, name };
		this.flashTimer = setTimeout(() => (this.flash = null), 3600);
	}
}

export const memorial = new MemorialState();
