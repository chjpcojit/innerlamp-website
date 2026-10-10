import { browser } from '$app/environment';

/** Browser connectivity, kept in sync with the `online` / `offline` events. */
class Connectivity {
	offline = $state(false);
	/** Visitor chose to keep browsing the offline-capable parts. */
	useOffline = $state(false);
	checkedAt = $state<Date | null>(null);
	checking = $state(false);

	constructor() {
		if (!browser) return;
		this.offline = !navigator.onLine;
		window.addEventListener('online', () => {
			this.offline = false;
			this.useOffline = false;
		});
		window.addEventListener('offline', () => {
			this.offline = true;
			this.checkedAt = new Date();
		});
	}

	/** Real reachability probe — `navigator.onLine` alone can report true on a dead network. */
	async recheck(): Promise<boolean> {
		if (this.checking) return !this.offline;
		this.checking = true;
		let ok = navigator.onLine;
		if (ok) {
			try {
				await fetch('/robots.txt', { method: 'HEAD', cache: 'no-store' });
			} catch {
				ok = false;
			}
		}
		this.offline = !ok;
		if (ok) this.useOffline = false;
		this.checkedAt = new Date();
		this.checking = false;
		return ok;
	}
}

export const connectivity = new Connectivity();

export function formatClock(date: Date): string {
	return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
