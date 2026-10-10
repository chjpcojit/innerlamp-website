import { m } from '$lib/paraglide/messages';

/**
 * Resolve a message by a key built at runtime (e.g. `act_${slug}`), for tables whose entries
 * are indexed by computed values. Prefer a direct `m.key()` call whenever the key is static.
 */
export function msg(key: string, params?: Record<string, string | number>): string {
	const fn = (m as unknown as Record<string, (p?: Record<string, string | number>) => string>)[key];
	return fn(params);
}
