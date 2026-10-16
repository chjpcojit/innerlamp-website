/**
 * Expiry and resend countdowns for an emailed code. Deadlines are wall-clock so a throttled
 * background tab still counts down correctly; the values come from the backend response.
 * / Đồng hồ hết hạn và gửi lại mã; giá trị lấy từ phản hồi của backend.
 */
export class OtpTimers {
	now = $state(Date.now());
	expiresAt = $state(0);
	resendAt = $state(0);
	totalMs = $state(1);

	left = $derived(Math.max(0, Math.ceil((this.expiresAt - this.now) / 1000)));
	wait = $derived(Math.max(0, Math.ceil((this.resendAt - this.now) / 1000)));
	expired = $derived(this.left === 0);
	pct = $derived(Math.min(100, (this.left * 1000 * 100) / this.totalMs));

	constructor(expiresIn: number, resendAfter: number) {
		this.reset(expiresIn, resendAfter);
	}

	reset(expiresIn: number, resendAfter: number) {
		const at = Date.now();
		this.now = at;
		this.totalMs = Math.max(1, expiresIn * 1000);
		this.expiresAt = at + this.totalMs;
		this.resendAt = at + resendAfter * 1000;
	}

	/** `OTP_RESEND_TOO_SOON` carries the remaining wait. */
	delayResend(seconds: number) {
		this.resendAt = Date.now() + seconds * 1000;
	}

	/** Start ticking; returns the stop function (use as an `onMount` callback result). */
	start() {
		const timer = setInterval(() => (this.now = Date.now()), 1000);
		return () => clearInterval(timer);
	}
}

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
