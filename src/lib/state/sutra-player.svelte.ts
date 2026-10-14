const TICK_MS = 500;

/**
 * Chant player for one sutra. No audio files exist yet (prototype `sPlay`/`sPos`), so playback is
 * simulated: the position advances in real time until the sutra's chanting length is reached.
 */
export class SutraPlayer {
	playing = $state(false);
	/** Position in seconds. */
	pos = $state(0);
	readonly duration: number;

	private timer: ReturnType<typeof setInterval> | undefined;

	constructor(minutes: number) {
		this.duration = minutes * 60;
	}

	get percent() {
		return this.duration ? Math.min(100, (this.pos / this.duration) * 100) : 0;
	}

	toggle() {
		if (this.playing) this.pause();
		else this.play();
	}

	play() {
		if (this.pos >= this.duration) this.pos = 0;
		this.playing = true;
		this.timer = setInterval(() => {
			this.pos = Math.min(this.duration, this.pos + TICK_MS / 1000);
			if (this.pos >= this.duration) this.pause();
		}, TICK_MS);
	}

	pause() {
		this.playing = false;
		clearInterval(this.timer);
		this.timer = undefined;
	}

	/** Stop the timer when the page is left. */
	destroy() {
		this.pause();
	}
}

/** `m:ss` for a position in seconds. */
export function formatClock(seconds: number): string {
	const s = Math.floor(seconds);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
