/** DTOs for the backend temples API (`/v1/temples/*`). */

/**
 * Open enums: the backend may add values, so decode as string and tolerate unknown ones.
 * Known values are listed for reference only.
 */
export type TempleType =
	'CHUA' | 'THIEN_VIEN' | 'DAO_TRANG' | 'TINH_XA' | 'THIEN_XA' | (string & {});
export type TempleRegion = 'north' | 'central' | 'south';
export type TempleSect =
	| 'BẮC_TÔNG'
	| 'TRUC_LAM_YEN_TU'
	| 'KHAT_SI'
	| 'NAM_TONG_KHMER'
	| 'HOA_TONG'
	| 'NAM_TONG'
	| 'TIN_NGUONG_DANG_GIAN'
	| 'MINH_SU_DAO'
	| (string & {});
export type TempleHeritageRank =
	| 'DI_SAN_THE_GIOI'
	| 'DI_TICH_QUOC_GIA_DAC_BIET'
	| 'KHU_DU_LICH_QUOC_GIA'
	| 'DI_TICH_QUOC_GIA'
	| 'DANH_LAM_THANG_CANH'
	| 'DI_TICH_CAP_TINH'
	| 'DI_TICH_CAP_THANH_PHO'
	| 'CHUA_XEP_HANG'
	| (string & {});

export interface TempleLocation {
	lat: number;
	lng: number;
	/** Below ward level (house number, street…); may be "". */
	address: string;
	/** Province/city name (new 34-province system). */
	province: string;
	province_code: string | null;
	ward_code: string | null;
	ward: string | null;
	/** Ready-to-display address; use this in the UI. */
	full_address: string;
}

export interface TempleSummary {
	id: string;
	name: string;
	type: TempleType;
	region: TempleRegion;
	/** Null when the temple has no image yet. Use the URL verbatim (CDN in production). */
	thumbnail_url: string | null;
	/** Full-size JPEG (~1 MB); null when missing. */
	image_url: string | null;
	sect: TempleSect;
	heritage_rank: TempleHeritageRank;
	established_year: number;
	location: TempleLocation;
}

export interface TempleAmenities {
	parking_car: boolean;
	parking_motorcycle: boolean;
	vegetarian_meals: boolean;
	summer_retreat: boolean;
}

export interface TempleDetail extends TempleSummary {
	/** [] when none. */
	aliases: string[];
	founder: string;
	current_abbot: string;
	/** e.g. "07:00 - 18:00". */
	operating_hours: string;
	amenities: TempleAmenities;
	/** "" when not yet written (never null). */
	introduction: string;
	architecture_heritage: string;
	/** [] when none. */
	visiting_notes: string[];
}

export interface TempleTop {
	/** Up to 10 featured temples. */
	items: TempleSummary[];
}

export interface TemplePage {
	items: TempleSummary[];
	page: number;
	/** Fixed by the backend (20); do not hard-code. */
	page_size: number;
	total: number;
	total_pages: number;
}

export interface TempleListQuery {
	/** 1-based; defaults to 1. */
	page?: number;
}

export interface TempleOption {
	id: string;
	name: string;
	province: string;
	/** New-system province code; null for temples not yet re-seeded. */
	province_code: string | null;
}

export interface TempleOptionsPage {
	items: TempleOption[];
	page: number;
	/** Fixed by the backend (100). */
	page_size: number;
	total: number;
	total_pages: number;
}

export interface TempleOptionsQuery {
	/** 1-based; defaults to 1. */
	page?: number;
	/** Name search, 1–100 chars after trim (accent/case-insensitive). Omit to list all. */
	q?: string;
}

/**
 * A temple the visitor proposed during sign-up because theirs was not in the list.
 * Held client-side and submitted for review (`POST /v1/temple-suggestions`) once the
 * account is created.
 */
export interface PendingTemple {
	/** Display name, normalised to start with a temple prefix (e.g. "Chùa Phước Huệ"). */
	name: string;
	province_code: string;
	/** Full province name, e.g. "Thành phố Hồ Chí Minh". */
	province: string;
	/** Backend ward code; null when the ward was typed in because the list failed to load. */
	ward_code: string | null;
	/** Full ward name, e.g. "Phường Bến Nghé". */
	ward: string;
	/** Street address; empty when not given. */
	address: string;
}

/** Body of `POST /v1/temple-suggestions` (all fields required by the backend). */
export interface TempleSuggestionRequest {
	/** ≤ 255 characters. */
	name: string;
	/** New-system province code. */
	province_code: string;
	/** New-system ward code belonging to `province_code`. */
	ward_code: string;
	/** Below ward level (house number, street, hamlet); ≤ 500 characters. */
	address: string;
}
