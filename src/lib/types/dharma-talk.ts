/** DTOs for the backend Dharma talks API (`/v1/dharma-talks/*`). Content is Vietnamese only. */

/** Which player the detail page shows: YouTube embed, audio file, or text only. */
export type DharmaTalkMedia = 'youtube' | 'audio' | 'text';

export interface DharmaTalkSummary {
	/** Slug; the `{id}` of the detail endpoint. */
	id: string;
	title: string;
	speaker: string;
	speaker_initials: string;
	/** Free Vietnamese label (e.g. "Đời sống"), not an enum; the API cannot filter by it yet. */
	category: string;
	season: string | null;
	/** `YYYY-MM-DD`. */
	published_date: string | null;
	duration_minutes: number | null;
	summary: string;
	tags: string[];
	media_type: DharmaTalkMedia;
}

export interface DharmaTalkChapter {
	start_seconds: number;
	title: string;
}

export interface DharmaTalkFollowUp {
	title: string;
	minutes: number;
	meditation_id: string;
}

export interface DharmaTalkDetail extends DharmaTalkSummary {
	key_points: string[];
	quote: string;
	quote_source: string;
	/** Always `vi` for now. */
	language: string;
	/** 11-char video id, only when `media_type` is `youtube`. */
	youtube_id: string | null;
	/** Only when `media_type` is `audio`. */
	audio_url: string | null;
	/** Never `null`; empty when the talk has no chapters. */
	chapters: DharmaTalkChapter[];
	follow_up_meditation: DharmaTalkFollowUp | null;
	source_name: string;
	source_url: string;
	license: string;
}

export interface DharmaTalkPage {
	items: DharmaTalkSummary[];
	page: number;
	/** Fixed by the backend (10). */
	page_size: number;
	total: number;
	total_pages: number;
}
