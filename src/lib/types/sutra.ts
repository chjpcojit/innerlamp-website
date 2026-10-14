/** DTOs for the backend sutras API (`/v1/sutras/*`) and sutras embedded in `/v1/deities/{id}/sutras`. */

/** `CAU_AN` cầu an, `CAU_SIEU` cầu siêu, `TRI_CHU` trì chú, … Labels are mapped client-side. */
export type SutraPurpose =
	| 'CAU_AN'
	| 'CAU_SIEU'
	| 'TRI_CHU'
	| 'SAM_HOI'
	| 'HOI_HUONG'
	| 'PHAT_NGUYEN'
	| 'BAO_HIEU'
	| 'THIEN_DINH'
	| 'HOC_GIAO_LY'
	| 'QUY_Y_THO_GIOI';

/** Role a deity plays in a text: `SPEAKER` preaches it, `SUBJECT` it is about, `MENTIONED` named. */
export type SutraDeityRole = 'SPEAKER' | 'SUBJECT' | 'MENTIONED';

/** A deity linked to a sutra, with enough to render a chip without another call. */
export interface SutraDeity {
	deity_id: string;
	role: SutraDeityRole;
	name_vi: string;
	/** May be empty. */
	thumbnail_url: string;
}

/** Nam Tông / Bắc Tông / Kim Cang Thừa. Open enum: render unknown values like a regular entry. */
export type SutraTradition = 'THERAVADA' | 'MAHAYANA' | 'VAJRAYANA' | (string & {});

export type SutraKind = 'SUTRA' | 'VERSE' | 'DHARANI' | (string & {});

export interface SutraTranslationSummary {
	/** Unique within the sutra; the `translation` argument of the lines endpoint. */
	key: string;
	/** `vi`, `pli`, `en`, `zh`, `sa`, `bo`. */
	lang: string;
	variant: 'translation' | 'chant' | 'meaning' | 'poem' | (string & {});
	translator: string;
	license: 'CC0-1.0' | 'CC-BY-NC-4.0' | 'PUBLIC_DOMAIN' | 'COPY_ALLOWED' | 'UNKNOWN';
	line_count: number;
}

/** One catalogue entry (sutra, verse or dharani) without its lines. */
export interface SutraSummary {
	/** Stable slug. */
	id: string;
	tradition: SutraTradition;
	kind: SutraKind;
	collection: string;
	/** Citation code only (e.g. `Taishō T0251`); empty when unknown. */
	reference: string;
	/** AI-written, unreviewed; empty when absent. */
	summary: string;
	/** Always has `vi`. */
	titles: { vi: string } & Record<string, string>;
	daily_chant: boolean;
	purposes: SutraPurpose[];
	/** Estimated reading/chanting time; null when not estimated. */
	duration_minutes: number | null;
	/** Empty string when there is no audio. */
	audio_url: string;
	deities: SutraDeity[];
	translations: SutraTranslationSummary[];
}

/** A sutra seen from one deity: adds that deity's role in it. */
export interface SutraByDeity extends SutraSummary {
	role: SutraDeityRole;
}

/** A part (phẩm/chương) of one translation. `start_n` is the first line number. */
export interface SutraSection {
	name: string;
	start_n: number;
	line_count: number;
}

export interface SutraTranslationDetail extends SutraTranslationSummary {
	source_name: string;
	source_url: string;
	license_url: string;
	license_note: string;
	note: string;
	/** `[]` when the text is not divided into parts. */
	sections: SutraSection[];
}

/** `GET /v1/sutras/{id}`: the summary plus provenance and the table of contents per translation. */
export interface SutraDetail extends Omit<SutraSummary, 'translations'> {
	review_status: string;
	/** Original-language title; may be empty. */
	original_title: string;
	author: string;
	han_translator: string;
	han_translation_year: number | null;
	reference_note: string;
	translations: SutraTranslationDetail[];
}

export interface SutraPage {
	items: SutraSummary[];
	page: number;
	/** Fixed by the backend (20). */
	page_size: number;
	total: number;
	total_pages: number;
}

/** Filters of `GET /v1/sutras`; combined with AND. Page size is fixed at 20 and there is no sort. */
export interface SutraListQuery {
	/** 1-based; defaults to 1. */
	page?: number;
	tradition?: 'THERAVADA' | 'MAHAYANA' | 'VAJRAYANA';
	kind?: 'SUTRA' | 'VERSE' | 'DHARANI';
	/** Exact match, e.g. `Bát Nhã`. */
	collection?: string;
	purpose?: SutraPurpose;
	/** Daily-chant texts (kinh nhật tụng). */
	daily?: boolean;
	/** Keep texts with `duration_minutes` up to this many minutes. */
	max_minutes?: number;
	/** At least one translation in this language. */
	lang?: string;
	/** 1–100 characters; accent- and case-insensitive substring over titles, collection, reference. */
	q?: string;
}

/** Filter as it appears in the website URL (`?filter=`); mapped to a `SutraListQuery` server-side. */
export type SutraFilter = 'mahayana' | 'theravada' | 'vajrayana' | 'daily';

export interface SutraLine {
	/** 1-based and contiguous within a translation. */
	n: number;
	text: string;
	/** Name of the part this line belongs to; null when the text has no parts. */
	section: string | null;
}

export interface SutraLinesPage {
	translation: string;
	items: SutraLine[];
	page: number;
	page_size: number;
	total: number;
	total_pages: number;
}
