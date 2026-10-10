import { m } from '$lib/paraglide/messages';
import type { IconKind } from '$lib/components/ui/icon-shapes';
import { memorial } from '$lib/state/memorial.svelte';

/** Placeholder profile data (copied from the design mock) until the backend serves it. */

export const PROFILE_STATS = { hours: '168', streakDays: '42', chants: '9.7k' };

/** Journal heat-map: 84 days (12 weeks), level 0 (none) to 3 (most), deterministic like the mock. */
export const JOURNAL_COLORS = ['#efe6d5', '#e2d4bb', '#cbb68f', '#b8862f'] as const;
export const JOURNAL_LEVELS: number[] = Array.from({ length: 84 }, (_, i) => {
	if (i > 78) return 0;
	const r = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
	return r < 0.15 ? 0 : r < 0.45 ? 1 : r < 0.8 ? 2 : 3;
});

export interface ProfileBadge {
	icon: IconKind;
	name: () => string;
	sub: () => string;
	tone: string;
	tint: string;
}

export const PROFILE_BADGES: ProfileBadge[] = [
	{
		icon: 'temple',
		name: () => m.pf_badge_1_name(),
		sub: () => m.pf_badge_1_sub(),
		tone: '#b8862f',
		tint: 'rgba(184,134,47,.16)'
	},
	{
		icon: 'med',
		name: () => m.pf_badge_2_name(),
		sub: () => m.pf_badge_2_sub(),
		tone: '#6e8f7a',
		tint: 'rgba(110,143,122,.16)'
	},
	{
		icon: 'beads',
		name: () => m.pf_badge_3_name(),
		sub: () => m.pf_badge_3_sub(),
		tone: '#c2857f',
		tint: 'rgba(194,133,127,.16)'
	}
];

/** Shortcut rows. Rows without `href` point at pages that don't exist yet (gia phả, chuông tỉnh thức). */
export interface ProfileRow {
	icon: IconKind;
	title: () => string;
	value: () => string;
	href?: '/sangha' | '/memorial' | '/notifications' | '/settings';
}

export const PROFILE_ROWS: ProfileRow[] = [
	{ icon: 'tree', title: () => m.pf_row_tree(), value: () => m.pf_row_tree_value() },
	{ icon: 'plus', title: () => m.pf_row_tree_new(), value: () => '' },
	{
		icon: 'calendar',
		title: () => m.pf_row_memorial(),
		value: () => m.pf_row_memorial_value({ count: memorial.entries.length }),
		href: '/memorial'
	},
	{ icon: 'bell', title: () => m.pf_row_bell(), value: () => m.pf_row_bell_value() },
	{ icon: 'notif', title: () => m.pf_row_notif(), value: () => '', href: '/notifications' },
	{ icon: 'gear', title: () => m.pf_row_settings(), value: () => '', href: '/settings' },
	{
		icon: 'temple',
		title: () => m.pf_row_sangha(),
		value: () => m.pf_row_sangha_value(),
		href: '/sangha'
	}
];
