import { m } from '$lib/paraglide/messages';

/** Contact page: message topics and the side info cards (from the prototype's `TOP` / `ctInfo`). */

export const CONTACT_TOPICS: { id: string; label: () => string }[] = [
	{ id: 'feedback', label: () => m.contact_topic_1() },
	{ id: 'bug', label: () => m.contact_topic_2() },
	{ id: 'support', label: () => m.contact_topic_3() },
	{ id: 'temple', label: () => m.contact_topic_4() },
	{ id: 'other', label: () => m.contact_topic_5() }
];

export const CONTACT_MIN_MESSAGE = 10;

export const CONTACT_INFO: { label: () => string; value: () => string; hint: () => string }[] = [
	{
		label: () => m.contact_info_email_k(),
		value: () => m.contact_info_email_v(),
		hint: () => m.contact_info_email_s()
	},
	{
		label: () => m.contact_info_hours_k(),
		value: () => m.contact_info_hours_v(),
		hint: () => m.contact_info_hours_s()
	},
	{
		label: () => m.contact_info_temple_k(),
		value: () => m.contact_info_temple_v(),
		hint: () => m.contact_info_temple_s()
	}
];
