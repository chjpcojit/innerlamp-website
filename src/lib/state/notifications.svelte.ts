import { browser } from '$app/environment';
import { NOTIFICATIONS } from '$lib/content/notifications';
import { readJson, writeJson } from '$lib/utils/storage';

const STORAGE_KEY = 'il-notifications-read';

/** Ids already read in the design mock; the rest start unread. */
const DEFAULT_READ = NOTIFICATIONS.filter((n) => n.read).map((n) => n.id);

/** Read/unread state of notifications, kept on-device until the backend serves it. */
class NotificationState {
	readIds = $state<string[]>(DEFAULT_READ);
	/** False until storage has been read, so the SSR and first client render agree. */
	ready = $state(false);

	unread = $derived(
		this.ready ? NOTIFICATIONS.filter((n) => !this.readIds.includes(n.id)).length : 0
	);

	init() {
		if (!browser || this.ready) return;
		this.readIds = readJson<string[]>(STORAGE_KEY, DEFAULT_READ);
		this.ready = true;
	}

	isRead(id: string) {
		return this.readIds.includes(id);
	}

	markRead(id: string) {
		if (this.isRead(id)) return;
		this.save([...this.readIds, id]);
	}

	markAllRead() {
		this.save(NOTIFICATIONS.map((n) => n.id));
	}

	private save(ids: string[]) {
		this.readIds = ids;
		writeJson(STORAGE_KEY, ids);
	}
}

export const notifications = new NotificationState();
