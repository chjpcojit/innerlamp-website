import { m } from '$lib/paraglide/messages';

/** Support (ủng hộ) page: suggested amounts, payment methods and what the money is used for. */

/** Sentinel for the "other amount" chip, which reveals the free-text field. */
export const SUPPORT_CUSTOM = -1;
export const SUPPORT_DEFAULT_AMOUNT = 50_000;
export const SUPPORT_MIN_AMOUNT = 10_000;

export const SUPPORT_AMOUNTS: number[] = [
	20_000,
	50_000,
	100_000,
	200_000,
	500_000,
	SUPPORT_CUSTOM
];

export const SUPPORT_PAYMENTS: { slug: string; label: () => string }[] = [
	{ slug: 'qr', label: () => m.sup_pay_qr() },
	{ slug: 'momo', label: () => m.sup_pay_momo() },
	{ slug: 'zalopay', label: () => m.sup_pay_zalopay() },
	{ slug: 'card', label: () => m.sup_pay_card() }
];

export const SUPPORT_USES: { title: () => string; desc: () => string }[] = [
	{ title: () => m.sup_use_1_title(), desc: () => m.sup_use_1_desc() },
	{ title: () => m.sup_use_2_title(), desc: () => m.sup_use_2_desc() },
	{ title: () => m.sup_use_3_title(), desc: () => m.sup_use_3_desc() },
	{ title: () => m.sup_use_4_title(), desc: () => m.sup_use_4_desc() }
];
