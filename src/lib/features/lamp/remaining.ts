const DAY_SECONDS = 86_400;

/**
 * Remaining-time label kind (BR-LMP-12); the component maps it to a translated key.
 * / Loại nhãn thời gian còn lại; component đổi sang key dịch.
 */
export type RemainingLabel =
	{ kind: 'days'; days: number } | { kind: 'under_one_day' } | { kind: 'out' };

/**
 * Whole days rounded up for 24 hours or more, `under_one_day` below that, `out` at zero or less.
 * The vector `lamp-remaining-label.json` is the specification.
 * / Số ngày làm tròn lên khi còn từ 24 giờ, `under_one_day` khi ít hơn, `out` khi đã hết.
 */
export function remainingLabel(remainingSeconds: number): RemainingLabel {
	if (remainingSeconds <= 0) return { kind: 'out' };
	if (remainingSeconds < DAY_SECONDS) return { kind: 'under_one_day' };
	return { kind: 'days', days: Math.ceil(remainingSeconds / DAY_SECONDS) };
}

/**
 * Label of a lamp ending at `endAt` (RFC 3339, from the server) at the moment `now` (ms).
 * / Nhãn của đèn tắt lúc `endAt` (từ server) tại thời điểm `now` (ms).
 */
export const remainingUntil = (endAt: string, now: number) =>
	remainingLabel((Date.parse(endAt) - now) / 1000);

/**
 * A lamp is lit while `now` is earlier than its end moment; the end is exclusive (BR-LMP-04).
 * / Đèn còn sáng khi `now` còn trước thời điểm tắt; đúng thời điểm tắt là đã tắt.
 */
export const isLit = (endAt: string, now: number) => now < Date.parse(endAt);
