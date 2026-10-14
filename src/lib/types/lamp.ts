/** DTOs for the backend lamp offering API (`/v1/lamps`). */

export type LampTypeCode = 'OIL_LAMP' | 'LOTUS_CANDLE' | 'FLOWER_LANTERN';
export type LampIntention = 'PEACE' | 'SALVATION' | 'MERIT_DEDICATION' | 'GRATITUDE';
/** The only durations the backend accepts. */
export type LampDuration = 1 | 7 | 21 | 49;

/** `POST /v1/lamps` body. Unknown fields (id, lit_at, …) are rejected with 400. */
export interface LightLampInput {
	lamp_type: LampTypeCode;
	intention: LampIntention;
	/** 1–100 characters after trim; the backend has no "all beings" default. */
	recipient: string;
	/** ≤ 300 characters; omit or null for none. */
	prayer?: string | null;
	duration_days: LampDuration;
	is_anonymous?: boolean;
}

/** A lamp the user just lit. Times are RFC 3339 UTC; `end_at = lit_at + days × 24h`. */
export interface Lamp {
	id: number;
	lamp_type: LampTypeCode;
	intention: LampIntention;
	recipient: string;
	prayer: string | null;
	duration_days: LampDuration;
	is_anonymous: boolean;
	lighter_name: string;
	lit_at: string;
	end_at: string;
}

/** A burning lamp in the shared garden; other users' intention and prayer are not exposed. */
export interface GardenLamp {
	id: number;
	lamp_type: LampTypeCode;
	recipient: string;
	lighter_name: string;
	end_at: string;
}

export interface LampGardenQuery {
	lamp_type?: LampTypeCode;
	/** Opaque `next_cursor` from the previous page. */
	cursor?: string;
}

/** `GET /v1/lamps`. `total` and `counts` cover every burning lamp, regardless of the filter. */
export interface LampGardenPage {
	items: GardenLamp[];
	total: number;
	counts: Record<LampTypeCode, number>;
	has_more: boolean;
	next_cursor: string | null;
}
