import { m } from '$lib/paraglide/messages';

/** Placeholder temple data (copied from the design mock) until the backend serves sangha content. */

export interface SanghaEvent {
	id: string;
	date: Date;
	name: () => string;
	meta: () => string;
}

export const SANGHA_EVENTS: SanghaEvent[] = [
	{
		id: 'retreat',
		date: new Date(2026, 9, 11),
		name: () => m.sg_event_1_name(),
		meta: () => m.sg_event_1_meta()
	},
	{
		id: 'full-moon',
		date: new Date(2026, 9, 24),
		name: () => m.sg_event_2_name(),
		meta: () => m.sg_event_2_meta()
	},
	{
		id: 'quan-yin',
		date: new Date(2026, 9, 28),
		name: () => m.sg_event_3_name(),
		meta: () => m.sg_event_3_meta()
	},
	{
		id: 'kitchen',
		date: new Date(2026, 9, 31),
		name: () => m.sg_event_4_name(),
		meta: () => m.sg_event_4_meta()
	}
];

/** Events the visitor has already registered for (mock). */
export const REGISTERED_EVENT_IDS = ['retreat'];

export const SANGHA_SCHEDULE: { time: string; title: () => string; when: () => string }[] = [
	{ time: '4:30', title: () => m.sg_sched_1_title(), when: () => m.sg_sched_1_when() },
	{ time: '17:00', title: () => m.sg_sched_2_title(), when: () => m.sg_sched_2_when() },
	{ time: '19:30', title: () => m.sg_sched_3_title(), when: () => m.sg_sched_3_when() },
	{ time: '19:00', title: () => m.sg_sched_4_title(), when: () => m.sg_sched_4_when() },
	{ time: '8:00', title: () => m.sg_sched_5_title(), when: () => m.sg_sched_5_when() },
	{ time: '6:30', title: () => m.sg_sched_6_title(), when: () => m.sg_sched_6_when() }
];

export interface SanghaPost {
	id: number;
	initials: string;
	avatar: string;
	name: string;
	meta: () => string;
	body: () => string;
	likes: number;
	replies: number;
}

export const SANGHA_POSTS: SanghaPost[] = [
	{
		id: 1,
		initials: 'TA',
		avatar: '#D8E3DA',
		name: 'Tịnh An',
		meta: () => m.sg_post_1_meta(),
		body: () => m.sg_post_1_body(),
		likes: 24,
		replies: 5
	},
	{
		id: 2,
		initials: 'MĐ',
		avatar: '#EBDCC3',
		name: 'Minh Đăng',
		meta: () => m.sg_post_2_meta(),
		body: () => m.sg_post_2_body(),
		likes: 18,
		replies: 9
	},
	{
		id: 3,
		initials: 'DH',
		avatar: '#EAD6D3',
		name: 'Diệu Hạnh',
		meta: () => m.sg_post_3_meta(),
		body: () => m.sg_post_3_body(),
		likes: 61,
		replies: 14
	}
];

export const SANGHA_PROFILE: { label: () => string; value: () => string }[] = [
	{ label: () => m.sg_me_refuge(), value: () => m.sg_me_refuge_value() },
	{ label: () => m.sg_me_precepts(), value: () => m.sg_me_precepts_value() },
	{ label: () => m.sg_me_master(), value: () => m.sg_me_master_value() },
	{ label: () => m.sg_me_group(), value: () => m.sg_me_group_value() },
	{ label: () => m.sg_me_sessions(), value: () => m.sg_me_sessions_value() }
];

export const SANGHA_NOTES: { text: () => string; by: () => string }[] = [
	{ text: () => m.sg_note_1_text(), by: () => m.sg_note_1_by() },
	{ text: () => m.sg_note_2_text(), by: () => m.sg_note_2_by() }
];

export const SANGHA_BOARD: { role: () => string; name: () => string }[] = [
	{ role: () => m.sg_board_1_role(), name: () => m.sg_board_1_name() },
	{ role: () => m.sg_board_2_role(), name: () => m.sg_board_2_name() },
	{ role: () => m.sg_board_3_role(), name: () => m.sg_board_3_name() }
];
