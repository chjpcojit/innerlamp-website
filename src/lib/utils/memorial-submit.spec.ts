import { describe, expect, it } from 'vitest';
import { canStartMemorialSubmit } from './memorial-submit';

describe('canStartMemorialSubmit', () => {
	it('sends exactly one POST when the form is submitted twice in a row', () => {
		const state = { pending: false, valid: true };
		let posts = 0;
		const submit = () => {
			if (!canStartMemorialSubmit(state)) return;
			state.pending = true;
			posts += 1;
		};

		submit();
		submit();

		expect(posts).toBe(1);
		state.pending = false;
		submit();
		expect(posts).toBe(2);
	});

	it('refuses an invalid form', () => {
		expect(canStartMemorialSubmit({ pending: false, valid: false })).toBe(false);
	});
});
