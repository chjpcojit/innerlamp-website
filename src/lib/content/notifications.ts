import { m } from '$lib/paraglide/messages';

/** Placeholder notifications (copied from the design mock) until the backend serves them. */

export type NotificationKind = 'reminder' | 'sangha' | 'friends' | 'system';
export type NotificationGroup = 'today' | 'yesterday' | 'earlier';

export interface NotificationItem {
	id: string;
	group: NotificationGroup;
	kind: NotificationKind;
	title: () => string;
	body: () => string;
	time: () => string;
	/** Locale-free target path. */
	to: '/memorial' | '/sangha' | '/lunar' | '/profile' | '/library';
	/** Already read in the mock. */
	read?: boolean;
}

export const NOTIFICATION_GROUPS: { id: NotificationGroup; label: () => string }[] = [
	{ id: 'today', label: () => m.notif_group_today() },
	{ id: 'yesterday', label: () => m.notif_group_yesterday() },
	{ id: 'earlier', label: () => m.notif_group_earlier() }
];

/** Tint / text colour per kind (prototype `KIND`). */
export const NOTIFICATION_KINDS: Record<
	NotificationKind,
	{ label: () => string; tint: string; tone: string }
> = {
	reminder: { label: () => m.notif_kind_reminder(), tint: 'rgba(184,134,47,.16)', tone: '#8a5a18' },
	sangha: { label: () => m.notif_kind_sangha(), tint: 'rgba(110,143,122,.18)', tone: '#4e6c59' },
	friends: { label: () => m.notif_kind_friends(), tint: 'rgba(194,133,127,.18)', tone: '#9a5f58' },
	system: { label: () => m.notif_kind_system(), tint: 'rgba(34,30,25,.08)', tone: '#4a443c' }
};

export const NOTIFICATIONS: NotificationItem[] = [
	{
		id: 'n1',
		group: 'today',
		kind: 'reminder',
		title: () => m.notif_1_title(),
		body: () => m.notif_1_body(),
		time: () => m.notif_1_time(),
		to: '/memorial'
	},
	{
		id: 'n2',
		group: 'today',
		kind: 'sangha',
		title: () => m.notif_2_title(),
		body: () => m.notif_2_body(),
		time: () => m.notif_2_time(),
		to: '/sangha'
	},
	{
		id: 'n3',
		group: 'today',
		kind: 'friends',
		title: () => m.notif_3_title(),
		body: () => '',
		time: () => m.notif_3_time(),
		to: '/sangha'
	},
	{
		id: 'n4',
		group: 'yesterday',
		kind: 'reminder',
		title: () => m.notif_4_title(),
		body: () => m.notif_4_body(),
		time: () => m.notif_yesterday(),
		to: '/lunar'
	},
	{
		id: 'n5',
		group: 'yesterday',
		kind: 'sangha',
		title: () => m.notif_5_title(),
		body: () => m.notif_5_body(),
		time: () => m.notif_yesterday(),
		to: '/sangha'
	},
	{
		id: 'n6',
		group: 'yesterday',
		kind: 'friends',
		title: () => m.notif_6_title(),
		body: () => m.notif_6_body(),
		time: () => m.notif_yesterday(),
		to: '/sangha',
		read: true
	},
	{
		id: 'n7',
		group: 'earlier',
		kind: 'reminder',
		title: () => m.notif_7_title(),
		body: () => m.notif_7_body(),
		time: () => m.notif_7_time(),
		to: '/profile',
		read: true
	},
	{
		id: 'n8',
		group: 'earlier',
		kind: 'system',
		title: () => m.notif_8_title(),
		body: () => m.notif_8_body(),
		time: () => m.notif_8_time(),
		to: '/library',
		read: true
	}
];
