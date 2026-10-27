import {
	LAMP_DAYS,
	LAMP_PURPOSES,
	LAMP_TYPES,
	PRAYER_MAX,
	RECIPIENT_MAX
} from '$lib/content/lamps';
import type { LampDuration, LampIntention, LampTypeCode } from '$lib/types/lamp';

/** Raw values of the lamp form. / Giá trị thô của form thắp đèn. */
export interface LampInput {
	lamp_type: string;
	intention: string;
	recipient: string;
	prayer: string | null;
	duration_days: number;
}

export type LampField = 'lamp_type' | 'intention' | 'recipient' | 'prayer' | 'duration_days';

/**
 * Validation result: the normalized values to send, or the first rejected field.
 * / Kết quả kiểm tra: giá trị đã chuẩn hoá để gửi, hoặc field đầu tiên bị từ chối.
 */
export type LampValidation =
	| {
			valid: true;
			lamp_type: LampTypeCode;
			intention: LampIntention;
			/** `null` when blank: the lamp is dedicated to all beings. / `null` khi trống: đèn cho tất cả chúng sanh. */
			recipient: string | null;
			prayer: string | null;
			duration_days: LampDuration;
	  }
	| { valid: false; field: LampField };

/**
 * Trims and NFC-normalizes free text, so "ệ" typed as e + combining marks counts as one character.
 * / Cắt khoảng trắng và chuẩn hoá NFC, để "ệ" gõ dạng tổ hợp vẫn được tính là một ký tự.
 */
export const normalizeText = (s: string) => s.normalize('NFC').trim();

/** Characters (code points), not UTF-16 units or bytes. / Đếm ký tự (code point), không đếm UTF-16 hay byte. */
export const charCount = (s: string) => [...s].length;

/**
 * Applies the product's input rules (BR-LMP-01, 02, 06, 07). Used by the form before the ignition
 * starts and again by the `light` action; the vector `lamp-input-validation.json` is the specification.
 * / Áp dụng luật nhập của product spec; dùng ở form (trước khi đốt đèn) và lại ở action `light`.
 */
export function validateLampInput(input: LampInput): LampValidation {
	const type = LAMP_TYPES.find((t) => t.code === input.lamp_type);
	if (!type) return { valid: false, field: 'lamp_type' };
	const purpose = LAMP_PURPOSES.find((p) => p.code === input.intention);
	if (!purpose) return { valid: false, field: 'intention' };

	const recipient = normalizeText(input.recipient);
	if (charCount(recipient) > RECIPIENT_MAX) return { valid: false, field: 'recipient' };
	const prayer = normalizeText(input.prayer ?? '');
	if (charCount(prayer) > PRAYER_MAX) return { valid: false, field: 'prayer' };

	const days = LAMP_DAYS.find((d) => d === input.duration_days);
	if (!days) return { valid: false, field: 'duration_days' };

	return {
		valid: true,
		lamp_type: type.code,
		intention: purpose.code,
		recipient: recipient || null,
		prayer: prayer || null,
		duration_days: days
	};
}
