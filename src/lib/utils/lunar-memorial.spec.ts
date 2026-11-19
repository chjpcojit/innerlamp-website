import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lunarToSolarExact, solarToLunar } from './lunar';
import { nthLabel } from './memorial-format';
import { toPlainDate } from './memorial-validate';

type ConversionCase = {
	name: string;
	input: {
		solar?: string;
		lunar?: { day: number; month: number; year: number; leap_month: boolean };
	};
	expected: {
		lunar?: { day: number; month: number; year: number; leap_month: boolean };
		solar?: string;
		valid?: false;
	};
};

type OrdinalCase = {
	name: string;
	input: { ordinal: number | null };
	expected: { label: string };
};

const load = <T>(name: string): { cases: T[] } =>
	JSON.parse(
		readFileSync(new URL(`../../../tests/vectors/memorial/${name}`, import.meta.url), 'utf8')
	);

describe('death-date-conversion.json (BR-MEM-03, 04, 10)', () => {
	const vector = load<ConversionCase>('death-date-conversion.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		if (input.solar) {
			const [y, m, d] = input.solar.split('-').map(Number);
			const lunar = solarToLunar(new Date(y, m - 1, d));
			expect({
				day: lunar.day,
				month: lunar.month,
				year: lunar.year,
				leap_month: lunar.leap
			}).toEqual(expected.lunar);
			return;
		}

		const lunar = input.lunar;
		if (!lunar) throw new Error('vector case has neither solar nor lunar input');
		const solar = lunarToSolarExact(lunar.day, lunar.month, lunar.year, lunar.leap_month);
		if (expected.valid === false) {
			expect(solar).toBeNull();
		} else {
			expect(solar).not.toBeNull();
			expect(solar && toPlainDate(solar)).toBe(expected.solar);
		}
	});
});

describe('anniversary-ordinal.json (BR-MEM-09)', () => {
	const vector = load<OrdinalCase>('anniversary-ordinal.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		expect(nthLabel(input.ordinal)).toBe(expected.label);
	});
});
