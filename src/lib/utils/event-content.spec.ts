import { describe, expect, it } from 'vitest';
import { paragraphs, practices } from './event-content';

describe('paragraphs (BR-CAL-14)', () => {
	it('splits on line breaks only, trims and drops empty lines', () => {
		expect(paragraphs('Đoạn một\r\n  Đoạn hai  \n\n')).toEqual(['Đoạn một', 'Đoạn hai']);
	});

	it('never splits on commas or semicolons', () => {
		expect(paragraphs('Đi chùa, cúng dường; phóng sinh')).toEqual([
			'Đi chùa, cúng dường; phóng sinh'
		]);
	});

	it('returns nothing for empty text', () => {
		expect(paragraphs('')).toEqual([]);
		expect(paragraphs(' \n ')).toEqual([]);
	});
});

describe('practices (BR-CAL-14)', () => {
	it('gives one practice per line', () => {
		expect(practices('Đi chùa dự lễ tắm Phật\nCúng dường\nPhóng sinh\nĂn chay')).toEqual([
			'Đi chùa dự lễ tắm Phật',
			'Cúng dường',
			'Phóng sinh',
			'Ăn chay'
		]);
	});

	it('drops a leading -, • or * on each practice', () => {
		expect(practices('- Cúng dường\n• Phóng sinh\n*Ăn chay\nTụng kinh - sám hối')).toEqual([
			'Cúng dường',
			'Phóng sinh',
			'Ăn chay',
			'Tụng kinh - sám hối'
		]);
	});

	it('drops a line that is only a bullet', () => {
		expect(practices('-\nCúng dường')).toEqual(['Cúng dường']);
	});
});
