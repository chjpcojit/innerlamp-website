/**
 * The book used to live in `localStorage['il-memorial']`. It is not migrated (product §2.7), so the
 * old key is removed once and nothing personal is ever written back (W5).
 * / Xoá key sổ giỗ cũ; không ghi PII xuống localStorage.
 */
const LEGACY_KEY = 'il-memorial';

export function clearLegacyMemorial(storage?: Pick<Storage, 'removeItem'>): void {
	try {
		(storage ?? globalThis.localStorage).removeItem(LEGACY_KEY);
	} catch {
		// storage unavailable — nothing to clean
	}
}
