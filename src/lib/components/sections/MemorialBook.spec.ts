import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import MemorialBook from './MemorialBook.svelte';
import type { MemorialEntry } from '$lib/types/memorial';

const entry = (id: number): MemorialEntry => ({
	id,
	name: `Người ${id}`,
	relation: 'father',
	calendar: 'lunar',
	day: 15,
	month: 10,
	year: null,
	leap: false,
	note: '',
	reminder: null,
	hasPhoto: false
});

const props = (total: number, entries: MemorialEntry[] = [], photoEnabled = false) => ({
	entries,
	total,
	loadError: false,
	flash: null,
	photoEnabled
});

describe('MemorialBook header (QA P7.2/P7.4)', () => {
	it('does not render the add link when total is 100', () => {
		const { body } = render(MemorialBook, { props: props(100) });
		expect(body).not.toContain('href="/memorial/new"');
		expect(body).toContain('Sổ giỗ đã đủ 100 người thân');
	});

	it('shows shown/total when items and total disagree', () => {
		const { body } = render(MemorialBook, {
			props: props(
				100,
				Array.from({ length: 20 }, (_, i) => entry(i + 1))
			)
		});
		expect(body).toContain('20/100');
		expect(body).not.toContain('href="/memorial/new"');
	});
});
