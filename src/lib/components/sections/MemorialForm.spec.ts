import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import MemorialForm from './MemorialForm.svelte';

const values = {
	name: 'Nguyễn Văn An',
	relation: 'father',
	calendar: 'lunar',
	day: '15',
	month: '10',
	year: '',
	leap: 'false',
	note: '',
	reminder_on: 'true',
	lead: '1',
	time: '07:00'
};

describe('MemorialForm 401 state (QA P7.3)', () => {
	it('renders the draft values and the sign-in message instead of redirecting', () => {
		const { body } = render(MemorialForm, {
			props: {
				entry: null,
				isNew: true,
				values,
				formErrors: { form: 'auth' }
			}
		});
		expect(body).toContain('value="Nguyễn Văn An"');
		expect(body).toContain('Phiên đã hết hạn. Vui lòng đăng nhập lại.');
		expect(body).toContain('/login');
	});
});
