import { m } from '$lib/paraglide/messages';

/** Placeholder temple data (copied from the design mock) until the backend serves sangha content. */

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
