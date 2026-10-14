import { DEFAULT_SIT_DURATION, SIT_DURATIONS } from '$lib/content/practice';
import { startAmbient, type AmbientKind } from '$lib/utils/ambient-audio';
import { playBell, playKhanh } from '$lib/utils/bell-audio';

export type SitPhase = 'idle' | 'settle' | 'run' | 'pause' | 'done';

/** Bell choices, in the order the chips are shown. 2 = no bell. */
export type SitBell = 0 | 1 | 2;
export const SIT_BELLS = [0, 1, 2] as const;
/** Index into {@link SIT_AMBIENTS}; 0 is silence. */
export const SIT_AMBIENTS: (AmbientKind | null)[] = [null, 'rain', 'stream', 'forest'];
/** Mid-session bell every N minutes; 0 = off. */
export const SIT_INTERVALS = [0, 5, 10, 15] as const;

/** Seconds to sit upright and close the eyes before the first bell. */
const SETTLE_SECONDS = 10;
/** The screen goes dark after this long without a touch. */
const DIM_AFTER_MS = 6000;
/** Gap between strikes of a multi-bell (the closing three). */
const BELL_GAP_MS = 2600;
/** One inhale or exhale, in seconds. */
export const BREATH_SECONDS = 4;

function strike(bell: SitBell) {
	if (bell === 0) playKhanh();
	else if (bell === 1) playBell();
}

/** A single sitting session. Everything lives for the visit; nothing is persisted. */
export class MeditationState {
	duration = $state<number>(DEFAULT_SIT_DURATION);
	bell = $state<SitBell>(0);
	ambient = $state(0);
	interval = $state(0);

	phase = $state<SitPhase>('idle');
	/** Seconds left on the clock while running; the settle countdown while settling. */
	left = $state(DEFAULT_SIT_DURATION * 60);
	settle = $state(SETTLE_SECONDS);
	dimmed = $state(false);

	readonly total = $derived(this.duration * 60);
	readonly elapsed = $derived(this.phase === 'idle' ? 0 : this.total - this.left);
	readonly progress = $derived(this.total ? this.elapsed / this.total : 0);
	/** True while the breath guide shows "in". */
	readonly breathingIn = $derived(Math.floor(this.elapsed / BREATH_SECONDS) % 2 === 0);

	#tick: ReturnType<typeof setInterval> | undefined;
	#lastTick = 0;
	#dimTimer: ReturnType<typeof setTimeout> | undefined;
	#bellTimers: ReturnType<typeof setTimeout>[] = [];
	#stopAmbient: (() => void) | undefined;

	/** Picks a duration; ignores values the picker does not offer (e.g. a stray `?d=`). */
	setDuration(minutes: number) {
		if (this.phase !== 'idle' || !(SIT_DURATIONS as readonly number[]).includes(minutes)) return;
		this.duration = minutes;
		this.left = minutes * 60;
	}

	/** Chips preview the sound so the choice is audible. */
	pickBell(bell: SitBell) {
		this.bell = bell;
		strike(bell);
	}

	start() {
		this.left = this.total;
		this.settle = SETTLE_SECONDS;
		this.phase = 'settle';
		this.#run();
	}

	togglePause() {
		if (this.phase === 'run') {
			this.phase = 'pause';
			this.dimmed = false;
			clearTimeout(this.#dimTimer);
			this.#stopSound();
		} else if (this.phase === 'pause') {
			this.phase = 'run';
			this.#lastTick = Date.now();
			this.#startSound();
			this.wake();
		}
	}

	/** Ends early with a single bell. */
	end() {
		this.#halt();
		this.ring(1);
		this.phase = 'done';
	}

	/** Back to the picker. */
	reset() {
		this.#halt();
		this.left = this.total;
		this.phase = 'idle';
	}

	/** Touch while the screen is dark: show it again and restart the dim countdown. */
	wake() {
		clearTimeout(this.#dimTimer);
		this.dimmed = false;
		this.#dimTimer = setTimeout(() => {
			if (this.phase === 'run') this.dimmed = true;
		}, DIM_AFTER_MS);
	}

	ring(times: number) {
		for (let i = 0; i < times; i++) {
			this.#bellTimers.push(setTimeout(() => strike(this.bell), i * BELL_GAP_MS));
		}
	}

	/** Releases timers and sound; call when leaving the page. */
	destroy() {
		this.#halt();
	}

	#run() {
		clearInterval(this.#tick);
		this.#lastTick = Date.now();
		this.#tick = setInterval(() => this.#step(), 1000);
	}

	#step() {
		// Count real seconds, so a throttled background tab does not stretch the sitting.
		const now = Date.now();
		const secs = Math.max(1, Math.round((now - this.#lastTick) / 1000));
		this.#lastTick = now;

		if (this.phase === 'settle') {
			this.settle -= secs;
			if (this.settle <= 0) {
				this.phase = 'run';
				this.ring(1);
				this.#startSound();
				this.wake();
			}
			return;
		}
		if (this.phase !== 'run') return;

		const before = this.total - this.left;
		this.left = Math.max(0, this.left - secs);
		if (this.left <= 0) {
			this.#halt();
			this.ring(3);
			this.phase = 'done';
			return;
		}
		const gap = SIT_INTERVALS[this.interval] * 60;
		const after = this.total - this.left;
		if (gap && Math.floor(after / gap) > Math.floor(before / gap)) this.ring(1);
	}

	#startSound() {
		this.#stopAmbient?.();
		const kind = SIT_AMBIENTS[this.ambient];
		this.#stopAmbient = kind ? startAmbient(kind) : undefined;
	}

	#stopSound() {
		this.#stopAmbient?.();
		this.#stopAmbient = undefined;
	}

	/** Stops the clock, the dim countdown and any ambient sound; pending bells are cleared. */
	#halt() {
		clearInterval(this.#tick);
		clearTimeout(this.#dimTimer);
		for (const t of this.#bellTimers) clearTimeout(t);
		this.#bellTimers = [];
		this.dimmed = false;
		this.#stopSound();
	}
}
