import { m } from '$lib/paraglide/messages';

export interface Country {
	iso: string;
	dial: string;
	name: () => string;
}

export const COUNTRIES: Country[] = [
	{ iso: 'VN', dial: '+84', name: () => m.country_vn() },
	{ iso: 'US', dial: '+1', name: () => m.country_us() },
	{ iso: 'CA', dial: '+1', name: () => m.country_ca() },
	{ iso: 'AU', dial: '+61', name: () => m.country_au() },
	{ iso: 'JP', dial: '+81', name: () => m.country_jp() },
	{ iso: 'KR', dial: '+82', name: () => m.country_kr() },
	{ iso: 'MY', dial: '+60', name: () => m.country_my() },
	{ iso: 'TW', dial: '+886', name: () => m.country_tw() },
	{ iso: 'SG', dial: '+65', name: () => m.country_sg() },
	{ iso: 'TH', dial: '+66', name: () => m.country_th() },
	{ iso: 'FR', dial: '+33', name: () => m.country_fr() },
	{ iso: 'DE', dial: '+49', name: () => m.country_de() }
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
