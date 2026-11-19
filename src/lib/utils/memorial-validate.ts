import { REMIND_LEADS, REMIND_TIMES, RELATIONS } from '$lib/content/memorial';
import type { MemorialCalendar, MemorialDraft } from '$lib/types/memorial';
import { lunarToSolarExact, solarToLunar } from '$lib/utils/lunar';

import type { MemorialActionErrors } from '$lib/types/memorial';

export interface MemorialFormInput {
	name: string;
	relation: string;
	calendar: string;
	day: number;
	month: number;
	year: number | null;
	leap: boolean;
	note: string;
	reminderOn: boolean;
	lead: number;
	time: string;
}

export interface MemorialValidation {
	valid: boolean;
	errors: MemorialActionErrors;
	/** Trimmed, normalised draft; valid only when `valid` is true. */
	draft: MemorialDraft;
}

const NAME_MAX = 100;
const NOTE_MAX = 1000;
const YEAR_MIN = 1900;

const VIETNAM = 'Asia/Ho_Chi_Minh';

/** Calendar date in Vietnam (not the server's zone), as `{ year, month, day }`. */
export function todayInVietnam(now = new Date()): { year: number; month: number; day: number } {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: VIETNAM,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(now);
	const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
	return { year: get('year'), month: get('month'), day: get('day') };
}

const daysInSolarMonth = (year: number, month: number): number =>
	new Date(year, month, 0).getDate();

/** `true` when a solar date exists (29 February only in a leap year). */
function solarExists(year: number, month: number, day: number): boolean {
	if (month < 1 || month > 12 || day < 1) return false;
	return day <= daysInSolarMonth(year, month);
}

/** `YYYY-MM-DD` from local calendar parts (never `toISOString`, which shifts the day). */
export function toPlainDate(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isFuture(date: Date, today: { year: number; month: number; day: number }): boolean {
	const y = date.getFullYear();
	const m = date.getMonth() + 1;
	const d = date.getDate();
	if (y !== today.year) return y > today.year;
	if (m !== today.month) return m > today.month;
	return d > today.day;
}

/**
 * The single form rule set, used in the browser and again in the server action. Each failure is
 * one code (never a backend message). / Bộ luật form dùng chung browser + action.
 */
export function validateMemorialForm(
	input: MemorialFormInput,
	now = new Date()
): MemorialValidation {
	const errors: MemorialActionErrors = {};
	const name = input.name.trim();
	const note = input.note.trim();
	const calendar: MemorialCalendar = input.calendar === 'solar' ? 'solar' : 'lunar';
	const leap = calendar === 'lunar' && input.leap === true;
	const relation = (RELATIONS as readonly string[]).includes(input.relation)
		? (input.relation as MemorialDraft['relation'])
		: 'other';

	const day = Math.trunc(input.day);
	const month = Math.trunc(input.month);
	const year =
		input.year === null || Number.isNaN(Number(input.year)) ? null : Math.trunc(Number(input.year));
	const today = todayInVietnam(now);

	if (!name) errors.name = 'empty';
	else if (name.length > NAME_MAX) errors.name = 'long';
	if (note.length > NOTE_MAX) errors.note = 'note_long';

	if (!errors.date) {
		if (!Number.isInteger(day) || !Number.isInteger(month)) {
			errors.date = 'invalid';
		} else if (year !== null) {
			if (year < YEAR_MIN) errors.date = 'year_min';
			else if (year > today.year) errors.date = 'future';
			else if (calendar === 'solar') {
				if (!solarExists(year, month, day)) errors.date = 'invalid';
				else if (isFuture(new Date(year, month - 1, day), today)) errors.date = 'future';
			} else if (leap && !lunarToSolarExact(1, month, year, true)) {
				// A leap month the year does not have (BR-MEM-04).
				errors.date = 'not_exist';
			} else {
				const solar = lunarToSolarExact(day, month, year, leap);
				if (!solar) errors.date = 'invalid';
				else if (isFuture(solar, today)) errors.date = 'future';
			}
		} else if (calendar === 'solar') {
			// No year: a valid day of the month; February may be 29 (contract §2.3).
			const max = (month === 2 ? 29 : daysInSolarMonth(2024, month)) || 0;
			if (month < 1 || month > 12 || day < 1 || day > max) errors.date = 'invalid';
		} else if (month < 1 || month > 12 || day < 1 || day > 30) {
			errors.date = 'invalid';
		}
	}

	const lead = Math.trunc(Number(input.lead));
	const time = input.time;
	if (input.reminderOn) {
		if (!(REMIND_LEADS as readonly number[]).includes(lead)) errors.reminder = 'invalid';
		else if (!(REMIND_TIMES as readonly string[]).includes(time)) errors.reminder = 'invalid';
	}

	const draft: MemorialDraft = {
		name,
		relation,
		calendar,
		day,
		month,
		year,
		leap,
		note,
		reminder: input.reminderOn ? { lead, time } : null
	};

	return { valid: Object.keys(errors).length === 0, errors, draft };
}

/** Read the posted form into the validation input (browser and server use the same names). */
export function readMemorialForm(form: FormData): MemorialFormInput {
	const text = (name: string) => String(form.get(name) ?? '');
	const yearRaw = text('year');
	return {
		name: text('name'),
		relation: text('relation'),
		calendar: text('calendar'),
		day: Number(text('day')),
		month: Number(text('month')),
		year: yearRaw === '' ? null : Number(yearRaw),
		leap: text('leap') === 'true',
		note: text('note'),
		reminderOn: text('reminder_on') === 'true',
		lead: Number(text('lead')),
		time: text('time')
	};
}

/** Lunar parts of a stored solar date of death (for an entry entered in the lunar calendar). */
export function lunarPartsOf(solar: Date): {
	day: number;
	month: number;
	year: number;
	leap: boolean;
} {
	return solarToLunar(solar);
}
