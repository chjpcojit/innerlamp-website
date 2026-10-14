/** DTOs for the backend articles API (`/v1/articles/*`): the "good Dharma articles" library. */

/** Shared by `top` and the list; the first part of `ArticleDetail`. */
export interface ArticleSummary {
	/** Stable slug, e.g. `vuot-thoat-luoi-vo-minh`; also the detail-page key. */
	id: string;
	title: string;
	/** Free-form label (≈45 distinct values), not an enum: render as returned. */
	category: string;
	author: string;
	author_initials: string;
	/** `YYYY-MM-DD`; many articles have none. */
	published_date: string | null;
	read_minutes: number;
	summary: string;
	tags: string[];
	/** ~1200x630 original, hotlinked from the source site: may fail to load (403). */
	image_url: string | null;
	/** Small square WebP hosted by the backend. */
	thumbnail_url: string | null;
}

/** The text is a summary of someone else's article: show `source_name` + link to `source_url`. */
export interface ArticleDetail extends ArticleSummary {
	/** Plain-text paragraphs (not HTML/markdown); empty when there is none. */
	body_paragraphs: string[];
	quote: string;
	quote_source: string;
	/** Language of the article itself: `vi` | `en`. */
	language: string;
	source_name: string;
	source_url: string;
	license: string;
}

export interface ArticleTop {
	/** The featured articles (5 by default). */
	items: ArticleSummary[];
}

export interface ArticlePage {
	items: ArticleSummary[];
	page: number;
	/** Fixed by the backend (10); do not hard-code. */
	page_size: number;
	total: number;
	total_pages: number;
}

export interface ArticleListQuery {
	/** 1-based; defaults to 1. The only supported filter: no category, search or sort. */
	page?: number;
}
