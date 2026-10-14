/** DTOs for the backend deities API (`/v1/deities/*`): Buddhas, Bodhisattvas and Devas. */
import type { SutraByDeity, SutraDeityRole } from './sutra';

/** Open enum: render unknown values like a regular entry instead of failing. */
export type DeityType = 'BUDDHA' | 'BODHISATTVA' | 'DEVA' | (string & {});

/** Type filter as it appears in the website URL (`?type=`); mapped to a `DeityType` server-side. */
export type DeityFilter = 'buddha' | 'bodhisattva';

/** Shared by `top` and the list; the first part of `DeityDetail`. */
export interface DeitySummary {
	/** Stable key, e.g. `bodhisattva_avalokiteshvara` (no separate slug). */
	id: string;
	type: DeityType;
	name_vi: string;
	name_sanskrit: string;
	name_chinese: string;
	title_honorific: string;
	/** WebP, absolute URL built from the backend host: use as returned. */
	thumbnail_url: string;
	image_url: string;
	core_virtue: string;
	pure_land: string;
}

/** A memorial day on the LUNAR calendar. */
export interface DeityMemorialDay {
	lunar_day: number;
	lunar_month: number;
	event_name: string;
}

export interface DeityIconography {
	posture: string;
	mount_or_throne: string;
	sacred_artifacts: string[];
	symbolic_meaning: string;
}

export interface DeityMantras {
	short_mantra_sanskrit: string;
	short_mantra_sino_vietnamese: string;
	long_dharani_name: string;
	dharani_phonetic_snippet: string;
}

export interface DeityDetail extends DeitySummary {
	canonical_source: string;
	/** `[]` when none; never null. */
	lunar_memorial_days: DeityMemorialDay[];
	iconography: DeityIconography;
	biography_summary: string;
	great_vows: string[];
	mantras: DeityMantras;
}

export interface DeityTop {
	/** Up to 10 featured entries. */
	items: DeitySummary[];
}

export interface DeityPage {
	items: DeitySummary[];
	page: number;
	/** Fixed by the backend (20). */
	page_size: number;
	total: number;
	total_pages: number;
}

export interface DeityListQuery {
	/** 1-based; defaults to 1. */
	page?: number;
	/** One exact, upper-case value; omit for all types. `total` / `total_pages` follow the filter. */
	type?: DeityType;
}

export interface DeitySutraQuery {
	page?: number;
	role?: SutraDeityRole;
}

export interface DeitySutraPage {
	items: SutraByDeity[];
	page: number;
	page_size: number;
	total: number;
	total_pages: number;
}
