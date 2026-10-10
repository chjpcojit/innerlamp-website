import { fail } from '@sveltejs/kit';
import { CONTACT_MIN_MESSAGE, CONTACT_TOPICS } from '$lib/content/contact';
import { isValidReach } from '$lib/utils/contact';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '')
			.trim()
			.slice(0, 100);
		const reach = String(data.get('reach') ?? '')
			.trim()
			.slice(0, 120);
		const message = String(data.get('message') ?? '')
			.trim()
			.slice(0, 2000);
		const topicRaw = String(data.get('topic') ?? '');
		const topic = CONTACT_TOPICS.some((t) => t.id === topicRaw) ? topicRaw : CONTACT_TOPICS[0].id;

		if (!isValidReach(reach)) return fail(400, { error: 'reach', name, reach, message, topic });
		if (message.length < CONTACT_MIN_MESSAGE) {
			return fail(400, { error: 'message', name, reach, message, topic });
		}

		// TODO: forward to the backend once a contact endpoint exists ($lib/server/api/contact.ts).
		// Until then the message is validated and acknowledged but not delivered anywhere.
		return { sent: true, name, reach, topic };
	}
};
