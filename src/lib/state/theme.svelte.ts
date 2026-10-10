import { browser } from '$app/environment';

const STORAGE_KEY = 'il-theme';
const DARK_CLASS = 'il-dark';

export type ThemeMode = 'light' | 'dark' | 'system';

/** Light/dark theme. Follows the OS until the visitor picks one; the choice is persisted. */
class Theme {
	dark = $state(false);
	mode = $state<ThemeMode>('system');

	/** Sync from the DOM/storage (the class is set pre-paint by the inline script in `app.html`). */
	init() {
		if (!browser) return;
		this.dark = document.documentElement.classList.contains(DARK_CLASS);
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			this.mode = stored === 'dark' || stored === 'light' ? stored : 'system';
		} catch {
			this.mode = 'system';
		}
		matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (this.mode === 'system') this.apply();
		});
	}

	toggle() {
		this.setMode(this.dark ? 'light' : 'dark');
	}

	setMode(mode: ThemeMode) {
		this.mode = mode;
		try {
			if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
			else localStorage.setItem(STORAGE_KEY, mode);
		} catch {
			// storage unavailable (private mode) — the choice just won't persist
		}
		this.apply();
	}

	private apply() {
		this.dark =
			this.mode === 'dark' ||
			(this.mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.classList.toggle(DARK_CLASS, this.dark);
	}
}

export const theme = new Theme();
