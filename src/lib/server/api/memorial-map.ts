import type { Relation } from '$lib/content/memorial';
import type {
	MemorialDraft,
	MemorialDTO,
	MemorialEntry,
	MemorialRelationship,
	MemorialRequest
} from '$lib/types/memorial';
import { nearestReminderChoice } from '$lib/utils/memorial-reminder';
import { lunarToSolarExact, solarToLunar } from '$lib/utils/lunar';
import { toPlainDate } from '$lib/utils/memorial-validate';

/** Explicit two-way table (contract §2.2); never derived from a display label. */
const API_TO_RELATION: Record<MemorialRelationship, Relation> = {
	GRANDFATHER_PATERNAL: 'paternal_grandfather',
	GRANDMOTHER_PATERNAL: 'paternal_grandmother',
	GRANDFATHER_MATERNAL: 'maternal_grandfather',
	GRANDMOTHER_MATERNAL: 'maternal_grandmother',
	FATHER: 'father',
	MOTHER: 'mother',
	SPOUSE: 'spouse',
	SIBLING: 'sibling',
	CHILD: 'child',
	OTHER: 'other'
};

const RELATION_TO_API: Record<Relation, MemorialRelationship> = Object.fromEntries(
	Object.entries(API_TO_RELATION).map(([api, relation]) => [relation, api])
) as Record<Relation, MemorialRelationship>;

/** Unknown enum value: fail the decode instead of guessing `OTHER` (contract §2.2). */
export class MemorialDecodeError extends Error {
	constructor(field: string) {
		super(`cannot decode ${field}`);
		this.name = 'MemorialDecodeError';
	}
}

/** `YYYY-MM-DD` → local date parts (never parse as UTC instant). */
export function parsePlainDate(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}
	return date;
}

/** Backend DTO → view model (dates, enum, nearest reminder). */
export function toMemorialEntry(dto: MemorialDTO): MemorialEntry {
	const relation = API_TO_RELATION[dto.relationship];
	if (!relation) throw new MemorialDecodeError('relationship');

	let day: number;
	let month: number;
	let year: number | null;
	let leap = false;

	if (dto.death_date) {
		const date = parsePlainDate(dto.death_date);
		if (!date) throw new MemorialDecodeError('death_date');
		if (dto.death_calendar === 'lunar') {
			// A lunar entry stores the exact solar date; recover day/month/leap from it.
			const lunar = solarToLunar(date);
			day = lunar.day;
			month = lunar.month;
			year = lunar.year;
			leap = lunar.leap;
		} else {
			day = date.getDate();
			month = date.getMonth() + 1;
			year = date.getFullYear();
		}
	} else {
		if (dto.death_day == null || dto.death_month == null) {
			throw new MemorialDecodeError('death_day/death_month');
		}
		day = dto.death_day;
		month = dto.death_month;
		year = null;
		leap = dto.death_calendar === 'lunar' && dto.death_leap_month === true;
	}

	return {
		id: dto.id,
		name: dto.full_name,
		relation,
		calendar: dto.death_calendar,
		day,
		month,
		year,
		leap,
		note: dto.note ?? '',
		reminder: nearestReminderChoice(dto.reminder),
		hasPhoto: dto.photo_url !== null
	};
}

export function toMemorialDraft(entry: MemorialEntry): MemorialDraft {
	return {
		name: entry.name,
		relation: entry.relation,
		calendar: entry.calendar,
		day: entry.day,
		month: entry.month,
		year: entry.year,
		leap: entry.leap,
		note: entry.note,
		reminder: entry.reminder
	};
}

export type MemorialRequestBody =
	{ ok: true; body: MemorialRequest } | { ok: false; error: 'date_not_exist' | 'date_invalid' };

export function toMemorialRequest(draft: MemorialDraft): MemorialRequestBody {
	const body: MemorialRequest = {
		full_name: draft.name.trim(),
		relationship: RELATION_TO_API[draft.relation],
		death_calendar: draft.calendar,
		note: draft.note.trim() || null,
		reminder: draft.reminder
			? { days_before: draft.reminder.lead, time: draft.reminder.time }
			: null
	};

	if (draft.year === null) {
		body.death_day = draft.day;
		body.death_month = draft.month;
		if (draft.calendar === 'lunar') body.death_leap_month = draft.leap;
		return { ok: true, body };
	}

	if (draft.calendar === 'solar') {
		const date = new Date(draft.year, draft.month - 1, draft.day);
		if (
			date.getFullYear() !== draft.year ||
			date.getMonth() !== draft.month - 1 ||
			date.getDate() !== draft.day
		) {
			return { ok: false, error: 'date_invalid' };
		}
		body.death_date = toPlainDate(date);
		return { ok: true, body };
	}

	const solar = lunarToSolarExact(draft.day, draft.month, draft.year, draft.leap);
	if (!solar) return { ok: false, error: 'date_not_exist' };
	body.death_date = toPlainDate(solar);
	return { ok: true, body };
}
