import { m } from '$lib/paraglide/messages';
import type { LampDuration, LampIntention, LampTypeCode } from '$lib/types/lamp';

/** Lamp offering: vessel styles and intentions, keyed by the backend's enum codes. */

export interface LampType {
	code: LampTypeCode;
	name: () => string;
	/** CSS background of the vessel. */
	cup: string;
	/** Width multiplier relative to the oil lamp. */
	width: number;
	radius: string;
	/** Extra decoration under the flame. */
	kind: 'oil' | 'lotus' | 'float';
}

export const LAMP_TYPES: LampType[] = [
	{
		code: 'OIL_LAMP',
		name: () => m.lamp_type_oil(),
		cup: 'linear-gradient(180deg,#C99A4A,#7A5320)',
		width: 1,
		radius: '0 0 60px 60px / 0 0 46px 46px',
		kind: 'oil'
	},
	{
		code: 'LOTUS_CANDLE',
		name: () => m.lamp_type_lotus(),
		cup: 'linear-gradient(180deg,#E9B8B0,#A86A62)',
		width: 0.82,
		radius: '42% 42% 20px 20px / 30% 30% 20px 20px',
		kind: 'lotus'
	},
	{
		code: 'FLOWER_LANTERN',
		name: () => m.lamp_type_float(),
		cup: 'linear-gradient(180deg,#F0C26A,#B5762A)',
		width: 1.15,
		radius: '50% 50% 50% 50% / 20% 20% 80% 80%',
		kind: 'float'
	}
];

export interface LampPurpose {
	code: LampIntention;
	name: () => string;
}

export const LAMP_PURPOSES: LampPurpose[] = [
	{ code: 'PEACE', name: () => m.lamp_for_0() },
	{ code: 'MERIT_DEDICATION', name: () => m.lamp_for_1() },
	{ code: 'SALVATION', name: () => m.lamp_for_2() },
	{ code: 'GRATITUDE', name: () => m.lamp_for_3() }
];

export const LAMP_DAYS: readonly LampDuration[] = [1, 7, 21, 49];
export const DEFAULT_LAMP_DAYS: LampDuration = 7;

/** Backend limits, counted in characters after trimming. */
export const RECIPIENT_MAX = 100;
export const PRAYER_MAX = 300;

/** Lookups from backend codes; unknown codes fall back to the first entry. */
export const lampType = (code: LampTypeCode) =>
	LAMP_TYPES.find((t) => t.code === code) ?? LAMP_TYPES[0];
export const lampPurpose = (code: LampIntention) =>
	LAMP_PURPOSES.find((p) => p.code === code) ?? LAMP_PURPOSES[0];
