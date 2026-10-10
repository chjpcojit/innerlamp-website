import { m } from '$lib/paraglide/messages';

export interface NavItem {
	/** Locale-free path. */
	path: string;
	label: () => string;
	/** Other locale-free path prefixes that keep this item highlighted (prototype `act()`). */
	also?: string[];
}

/** Primary navigation, shared by the header (desktop) and the bottom bar (mobile). */
export const NAV_ITEMS: NavItem[] = [
	{ path: '/', label: () => m.nav_home() },
	{
		path: '/library',
		label: () => m.nav_library(),
		also: ['/library/buddhas', '/library/talks', '/articles', '/gallery']
	},
	{ path: '/practice', label: () => m.nav_practice() },
	{ path: '/sangha', label: () => m.nav_sangha() },
	{ path: '/lunar', label: () => m.nav_lunar(), also: ['/events'] }
];

const within = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + '/');

/**
 * Index of the item the locale-free `path` belongs to, or -1.
 * `/lunar/day` opened from the homepage (`?from=home`) keeps "Home" active (prototype `act()`).
 */
export function activeNavIndex(path: string, from?: string | null): number {
	if (path === '/lunar/day' && from === 'home') return 0;
	return NAV_ITEMS.findIndex((item) =>
		item.path === '/'
			? path === '/'
			: [item.path, ...(item.also ?? [])].some((p) => within(path, p))
	);
}
