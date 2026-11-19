import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { MemorialFlashData } from '$lib/types/memorial';

export const FLASH_COOKIE = 'il_mem_flash';
const MAX_AGE = 60;

export type MemorialFlash = MemorialFlashData;

/** One-shot message after a save/delete; httpOnly because the name is personal data (NFR-MEM-02). */
export function setMemorialFlash(cookies: Cookies, flash: MemorialFlash): void {
	cookies.set(FLASH_COOKIE, JSON.stringify(flash), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: MAX_AGE
	});
}

/** Reads and clears the flash so a reload does not show it twice. */
export function takeMemorialFlash(cookies: Cookies): MemorialFlash | null {
	const raw = cookies.get(FLASH_COOKIE);
	if (!raw) return null;
	cookies.delete(FLASH_COOKIE, { path: '/' });
	try {
		const parsed = JSON.parse(raw) as MemorialFlash;
		if (parsed.kind === 'saved' || parsed.kind === 'deleted' || parsed.kind === 'gone') {
			return { kind: parsed.kind };
		}
	} catch {
		// A corrupt cookie is just dropped.
	}
	return null;
}
