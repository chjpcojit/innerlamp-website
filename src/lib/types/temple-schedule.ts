/** DTOs for the backend temple practice schedule API (`/v1/temples/{id}/schedule`). */

/** One step of a session, e.g. a chant within the morning service. */
export interface TempleScheduleStep {
	/** 1-based; steps arrive sorted by it. */
	position: number;
	/** `HH:mm`, or null when the step has no fixed time. */
	time: string | null;
	text: string;
}

/**
 * A recurring practice session. Only active sessions are returned. Repeats by weekday only;
 * lunar-day sessions (1st & 15th…) are `LUNAR_MONTHLY` temple events instead.
 * Text fields are Vietnamese only and never null (may be empty).
 */
export interface TempleScheduleItem {
	id: string;
	name: string;
	/** `HH:mm`, 24h, zero-padded. */
	start_time: string;
	end_time: string | null;
	/** Go `time.Weekday` (0 = Sunday), sorted and unique; `[]` means every day. */
	weekdays: number[];
	description: string;
	instructor: string;
	location: string;
	preparation: string;
	steps: TempleScheduleStep[];
}

/** `GET /v1/temples/{id}/schedule`. Items are sorted by `start_time`; `[]` when none. */
export interface TempleSchedule {
	temple_id: string;
	items: TempleScheduleItem[];
}
