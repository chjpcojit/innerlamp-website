import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isLit, remainingLabel } from './remaining';
import { validateLampInput } from './validation';

// Product vectors of innerlamp-be docs/product/lamp/rules, pinned by
// scripts/sync-lamp-vectors.mjs (never edited by hand). / Bản pin vector của product spec.
type Case = { name: string; input: Record<string, any>; expected: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
const load = (name: string): { cases: Case[] } =>
	JSON.parse(
		readFileSync(new URL(`../../../../tests/vectors/lamp/${name}`, import.meta.url), 'utf8')
	);

/** Expands `{ repeat, times }` and `{ concat }` values. / Giải các giá trị `repeat` và `concat`. */
type Value = string | null | { repeat: string; times: number } | { concat: Value[] };
const text = (v: Value): string | null => {
	if (v === null || typeof v === 'string') return v;
	if ('repeat' in v) return v.repeat.repeat(v.times);
	return v.concat.map((p) => text(p) ?? '').join('');
};

describe('lamp-input-validation.json (BR-LMP-01, 02, 06, 07)', () => {
	const vector = load('lamp-input-validation.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		const result = validateLampInput({
			lamp_type: input.lamp_type,
			intention: input.intention,
			recipient: text(input.recipient) ?? '',
			prayer: text(input.prayer),
			duration_days: input.duration_days
		});
		if (!expected.valid) {
			expect(result).toEqual({ valid: false, field: expected.field });
			return;
		}
		if (!result.valid) throw new Error(`rejected ${result.field}`);
		// The kept text is compared in NFC, the form the rule counts in. / So sánh ở dạng NFC.
		expect(result.recipient).toBe(text(expected.recipient)?.normalize('NFC') ?? null);
		expect(result.prayer).toBe(text(expected.prayer)?.normalize('NFC') ?? null);
		if (expected.dedicated_to === 'all_beings') expect(result.recipient).toBeNull();
	});
});

describe('lamp-remaining-label.json (BR-LMP-12)', () => {
	const vector = load('lamp-remaining-label.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		expect(remainingLabel(input.remaining_seconds)).toEqual(expected);
	});
});

describe('lamp-lifetime.json (BR-LMP-04)', () => {
	// The end moment is the backend's computation (BR-LMP-03); only `is_lit` runs here.
	// / Thời điểm tắt do backend tính; ở đây chỉ chạy `is_lit`.
	const vector = load('lamp-lifetime.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		expect(isLit(expected.end_at, Date.parse(input.now))).toBe(expected.is_lit);
	});
});
