/**
 * DTOs for the backend administrative-units API (`/v1/administrative-units/*`).
 * Two systems: `new` (2 levels: province → ward, since 2025-07-01) and `old`
 * (3 levels: province → district → ward). All codes are strings.
 */

export type AdministrativeSystem = 'new' | 'old';

export type ProvinceType = 'province' | 'city';

export interface Province {
	code: string;
	/** Short name, e.g. "Hồ Chí Minh". */
	name: string;
	/** Name with prefix, e.g. "Thành phố Hồ Chí Minh". */
	full_name: string;
	type: ProvinceType;
}

/** Ward of the new 2-level system. */
export interface NewWard {
	code: string;
	name: string;
	full_name: string;
	type: 'ward' | 'commune' | 'special_zone';
	province_code: string;
}

/** District of the old 3-level system. */
export interface OldDistrict {
	code: string;
	name: string;
	full_name: string;
	type: string;
	province_code: string;
}

/** Ward of the old 3-level system. */
export interface OldWard {
	code: string;
	name: string;
	full_name: string;
	type: string;
	district_code: string;
	province_code: string;
}

export interface ItemList<T> {
	items: T[];
}
