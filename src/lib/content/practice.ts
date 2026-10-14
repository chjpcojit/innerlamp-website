import { m } from '$lib/paraglide/messages';
import type { IconKind } from '$lib/components/ui/icon-shapes';

export const SIT_DURATIONS = [5, 12, 20, 30, 45] as const;
export const DEFAULT_SIT_DURATION = 20;

export interface PracticeTool {
	icon: IconKind;
	title: () => string;
	sub: () => string;
	tint: string;
	tone: string;
	/** Locale-free target; tiles without one are not built yet and render as plain cards. */
	href?: string;
}

export const PRACTICE_TOOLS: PracticeTool[] = [
	{
		icon: 'mo',
		title: () => m.practice_tool_bell_title(),
		sub: () => m.practice_tool_bell_sub(),
		tint: 'rgba(184,134,47,.14)',
		tone: '#B8862F',
		href: '/practice/bell'
	},
	{
		icon: 'beads',
		title: () => m.practice_tool_mala_title(),
		sub: () => m.practice_tool_mala_sub(),
		tint: 'rgba(194,133,127,.16)',
		tone: '#C2857F',
		href: '/practice/mala'
	},
	{
		icon: 'book',
		title: () => m.practice_tool_sutra_title(),
		sub: () => m.practice_tool_sutra_sub(),
		tint: 'rgba(184,134,47,.14)',
		tone: '#8A5A18'
	},
	{
		icon: 'bell',
		title: () => m.practice_tool_reminder_title(),
		sub: () => m.practice_tool_reminder_sub(),
		tint: 'rgba(110,143,122,.16)',
		tone: '#6E8F7A'
	},
	{
		icon: 'journal',
		title: () => m.practice_tool_journal_title(),
		sub: () => m.practice_tool_journal_sub(),
		tint: 'rgba(194,133,127,.16)',
		tone: '#C2857F'
	},
	{
		icon: 'progress',
		title: () => m.practice_tool_progress_title(),
		sub: () => m.practice_tool_progress_sub(),
		tint: 'rgba(110,143,122,.16)',
		tone: '#4E6C59'
	},
	{
		icon: 'lamp',
		title: () => m.practice_tool_lamp_title(),
		sub: () => m.practice_tool_lamp_sub(),
		tint: 'rgba(194,133,127,.16)',
		tone: '#9A5F58',
		href: '/practice/lamp'
	}
];
