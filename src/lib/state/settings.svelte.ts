import { browser } from '$app/environment';
import { readJson, writeJson } from '$lib/utils/storage';

const STORAGE_KEY = 'il-settings';

export interface Settings {
	bell: boolean;
	fast: boolean;
	memorial: boolean;
	sangha: boolean;
	/** Reading size: 0 small, 1 medium, 2 large. */
	font: 0 | 1 | 2;
	/** Primary calendar: 0 lunar, 1 solar. */
	calFirst: 0 | 1;
	/** Reminder sound: 0 bell, 1 gong, 2 wooden fish. */
	sound: 0 | 1 | 2;
	vibrate: boolean;
	showProfile: boolean;
	showStreak: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	bell: true,
	fast: true,
	memorial: true,
	sangha: true,
	font: 1,
	calFirst: 0,
	sound: 0,
	vibrate: true,
	showProfile: true,
	showStreak: true
};

/** Per-device preferences (the theme lives in `theme.svelte.ts`). No backend yet, so localStorage. */
class SettingsState {
	value = $state<Settings>({ ...DEFAULT_SETTINGS });

	init() {
		if (!browser) return;
		this.value = { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(STORAGE_KEY, {}) };
	}

	set<K extends keyof Settings>(key: K, next: Settings[K]) {
		this.value[key] = next;
		writeJson(STORAGE_KEY, $state.snapshot(this.value));
	}
}

export const settings = new SettingsState();
