import { m } from '$lib/paraglide/messages';

/** Offering (cúng dường) catalogue: placeholder temples, bank details and purposes from the design mock. */

export interface OfferTemple {
	slug: string;
	name: () => string;
	sub: () => string;
	bank: string;
	account: string;
	holder: string;
}

export const OFFER_TEMPLES: OfferTemple[] = [
	{
		slug: 'tuquang',
		name: () => m.mr_temple_tuquang(),
		sub: () => m.offer_temple_tuquang_sub(),
		bank: 'Vietcombank',
		account: '0071 0004 18266',
		holder: 'CHUA TU QUANG'
	},
	{
		slug: 'vinhnghiem',
		name: () => m.mr_temple_vinhnghiem(),
		sub: () => m.offer_temple_vinhnghiem_sub(),
		bank: 'VietinBank',
		account: '1180 2266 0099',
		holder: 'CHUA VINH NGHIEM'
	},
	{
		slug: 'truclam',
		name: () => m.offer_temple_truclam(),
		sub: () => m.offer_temple_truclam_sub(),
		bank: 'BIDV',
		account: '5100 2014 6688',
		holder: 'THIEN VIEN TRUC LAM'
	},
	{
		slug: 'tranquoc',
		name: () => m.offer_temple_tranquoc(),
		sub: () => m.offer_temple_tranquoc_sub(),
		bank: 'Agribank',
		account: '0021 0006 3388',
		holder: 'CHUA TRAN QUOC'
	}
];

export interface OfferPurpose {
	slug: string;
	label: () => string;
	note: () => string;
	/** ASCII transfer-memo suffix. */
	memo: string;
}

export const OFFER_PURPOSES: OfferPurpose[] = [
	{
		slug: 'triple-gem',
		label: () => m.mr_purpose_triple_gem(),
		note: () => m.offer_purpose_note_0(),
		memo: 'CUNG DUONG'
	},
	{
		slug: 'meal',
		label: () => m.mr_purpose_meal(),
		note: () => m.offer_purpose_note_1(),
		memo: 'TRAI TANG'
	},
	{
		slug: 'lamp',
		label: () => m.mr_purpose_lamp(),
		note: () => m.offer_purpose_note_2(),
		memo: 'THINH DEN'
	},
	{
		slug: 'restore',
		label: () => m.mr_purpose_restore(),
		note: () => m.offer_purpose_note_3(),
		memo: 'TRUNG TU'
	},
	{
		slug: 'kitchen',
		label: () => m.mr_purpose_kitchen(),
		note: () => m.offer_purpose_note_4(),
		memo: 'BEP COM'
	},
	{
		slug: 'release',
		label: () => m.mr_purpose_release(),
		note: () => m.offer_purpose_note_5(),
		memo: 'PHONG SINH'
	}
];

export const LAMP_PURPOSE_INDEX = OFFER_PURPOSES.findIndex((p) => p.slug === 'lamp');
export const RESTORE_PURPOSE_INDEX = OFFER_PURPOSES.findIndex((p) => p.slug === 'restore');

/** Preset amounts in đồng; `CUSTOM_AMOUNT` selects the free-form field. */
export const CUSTOM_AMOUNT = -1;
export const OFFER_AMOUNTS = [50_000, 100_000, 200_000, 500_000, CUSTOM_AMOUNT] as const;
export const DEFAULT_OFFER_AMOUNT = 100_000;
/** The bank's minimum for a transfer to be processed. */
export const MIN_OFFER_AMOUNT = 10_000;

export interface OfferCampaign {
	name: () => string;
	daysLeft: number;
	percent: number;
	received: number;
	goal: number;
	offerings: number;
}

/** Public restoration campaign shown when the "restore" purpose is chosen (per temple index). */
export const OFFER_CAMPAIGNS: Record<number, OfferCampaign> = {
	0: {
		name: () => m.mr_public_project(),
		daysLeft: 52,
		percent: 46,
		received: 186,
		goal: 400,
		offerings: 1240
	}
};
export const FALLBACK_CAMPAIGN: OfferCampaign = {
	name: () => m.offer_camp_ancestors(),
	daysLeft: 90,
	percent: 28,
	received: 84,
	goal: 300,
	offerings: 512
};
