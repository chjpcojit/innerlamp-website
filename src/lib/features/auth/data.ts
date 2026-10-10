import { m } from '$lib/paraglide/messages';

export interface Country {
	iso: string;
	dial: string;
	/** National significant number length (without trunk prefix). */
	len: number;
	name: () => string;
}

export const COUNTRIES: Country[] = [
	{ iso: 'VN', dial: '+84', len: 9, name: () => m.country_vn() },
	{ iso: 'US', dial: '+1', len: 10, name: () => m.country_us() },
	{ iso: 'CA', dial: '+1', len: 10, name: () => m.country_ca() },
	{ iso: 'AU', dial: '+61', len: 9, name: () => m.country_au() },
	{ iso: 'JP', dial: '+81', len: 10, name: () => m.country_jp() },
	{ iso: 'KR', dial: '+82', len: 10, name: () => m.country_kr() },
	{ iso: 'CN', dial: '+86', len: 11, name: () => m.country_cn() },
	{ iso: 'TW', dial: '+886', len: 9, name: () => m.country_tw() },
	{ iso: 'SG', dial: '+65', len: 8, name: () => m.country_sg() },
	{ iso: 'TH', dial: '+66', len: 9, name: () => m.country_th() },
	{ iso: 'FR', dial: '+33', len: 9, name: () => m.country_fr() },
	{ iso: 'DE', dial: '+49', len: 11, name: () => m.country_de() }
];

export interface Temple {
	id: string;
	label: () => string;
	sub: () => string;
}

export const TEMPLES: Temple[] = [
	{ id: 'none', label: () => m.temple_none(), sub: () => m.temple_none_sub() },
	{ id: 'tu-quang', label: () => m.temple_tu_quang(), sub: () => m.temple_tu_quang_sub() },
	{ id: 'truc-lam', label: () => m.temple_truc_lam(), sub: () => m.temple_truc_lam_sub() },
	{ id: 'vinh-nghiem', label: () => m.temple_vinh_nghiem(), sub: () => m.temple_vinh_nghiem_sub() },
	{ id: 'tran-quoc', label: () => m.temple_tran_quoc(), sub: () => m.temple_tran_quoc_sub() },
	{ id: 'other', label: () => m.temple_other(), sub: () => m.temple_other_sub() }
];

export const DHARMA_NAMES: (() => string)[] = [
	() => m.dharma_name_1(),
	() => m.dharma_name_2(),
	() => m.dharma_name_3(),
	() => m.dharma_name_4(),
	() => m.dharma_name_5(),
	() => m.dharma_name_6(),
	() => m.dharma_name_7(),
	() => m.dharma_name_8(),
	() => m.dharma_name_9(),
	() => m.dharma_name_10()
];
