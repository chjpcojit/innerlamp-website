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

/** Seconds a generated QR stays valid before the page shows it as expired. */
export const SUPPORT_QR_TTL = 600;
/** Account holder shown next to the QR (bank format: unaccented, upper case). */
export const SUPPORT_RECIPIENT = 'CONG TY INNERLAMP';
const SUPPORT_MEMO_PREFIX = 'ILUH';
const SUPPORT_MEMO_SUFFIX = 'UNG HO INNERLAMP';

export const SUPPORT_PAYMENTS: { slug: string; label: () => string; hint: () => string }[] = [
	{ slug: 'qr', label: () => m.sup_pay_qr(), hint: () => m.sup_qr_hint_qr() },
	{ slug: 'momo', label: () => m.sup_pay_momo(), hint: () => m.sup_qr_hint_momo() },
	{ slug: 'zalopay', label: () => m.sup_pay_zalopay(), hint: () => m.sup_qr_hint_zalopay() }
];

/** Transfer note the backend will match, e.g. `ILUH01234 UNG HO INNERLAMP`. */
export function supportMemo(amount: number, payment: number): string {
	const n = (amount * 7 + payment * 131) % 99991;
	return `${SUPPORT_MEMO_PREFIX}${String(n).padStart(5, '0')} ${SUPPORT_MEMO_SUFFIX}`;
}

export const SUPPORT_USES: { title: () => string; desc: () => string }[] = [
	{ title: () => m.sup_use_1_title(), desc: () => m.sup_use_1_desc() },
	{ title: () => m.sup_use_2_title(), desc: () => m.sup_use_2_desc() },
	{ title: () => m.sup_use_3_title(), desc: () => m.sup_use_3_desc() },
	{ title: () => m.sup_use_4_title(), desc: () => m.sup_use_4_desc() }
];
