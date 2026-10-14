import { playBell, playMo } from '$lib/utils/bell-audio';

/** 0 = wooden fish only, 1 = bell only, 2 = wooden fish with a bell every N knocks. */
export type BellMode = 0 | 1 | 2;

export interface BellPreset {
	key: 'chant' | 'mala' | 'prostrate' | 'sit' | 'mo';
	mode: BellMode;
	bpm?: number;
	secs?: number;
	every?: number;
}

export const BELL_PRESETS: BellPreset[] = [
	{ key: 'chant', mode: 2, bpm: 72, every: 27 },
	{ key: 'mala', mode: 2, bpm: 96, every: 108 },
	{ key: 'prostrate', mode: 1, secs: 12 },
	{ key: 'sit', mode: 1, secs: 60 },
	{ key: 'mo', mode: 0, bpm: 60 }
];

export const BELL_EVERY = [0, 10, 27, 108] as const;
export const BPM_RANGE = { min: 30, max: 180, step: 4 } as const;
export const SECS_RANGE = { min: 4, max: 120, step: 4 } as const;

/** Roll: knocks that speed up, hold, slow down, then a closing bell. */
const ROLL_GAPS = (() => {
	const gaps: number[] = [];
	for (let x = 950; x > 170; x *= 0.84) gaps.push(Math.round(x));
	for (let i = 0; i < 14; i++) gaps.push(160);
	for (let x = 180; x < 720; x *= 1.28) gaps.push(Math.round(x));
	gaps.push(950, 1100);
	return gaps;
})();

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Wooden fish + bell practice session. Counters and tempo live only for the visit. */
class BellState {
	mode = $state<BellMode>(0);
	preset = $state(4);
	bpm = $state(60);
	secs = $state(12);
	every = $state(0);
	moCount = $state(0);
	bellCount = $state(0);
	playing = $state(false);
	rolling = $state(false);
	/** Bumped on every strike so the stage can replay its animation. */
	moHit = $state(0);
	bellHit = $state(0);

	#auto: ReturnType<typeof setTimeout> | undefined;
	#rollTimers: ReturnType<typeof setTimeout>[] = [];

	knock(roll = false) {
		playMo();
		this.moHit++;
		this.moCount++;
		if (!roll && this.mode === 2 && this.every && this.moCount % this.every === 0) {
			setTimeout(() => this.ring(), 180);
		}
	}

	ring() {
		playBell();
		this.bellHit++;
		this.bellCount++;
	}

	/** Tap on the pad: bell in bell mode, otherwise the wooden fish. */
	tap() {
		if (this.rolling) return;
		if (this.mode === 1) this.ring();
		else this.knock();
	}

	togglePlay() {
		if (this.playing) this.stop();
		else this.start();
	}

	start() {
		this.stop();
		this.playing = true;
		const step = () => {
			if (!this.playing) return;
			this.tap();
			this.#auto = setTimeout(step, this.mode === 1 ? this.secs * 1000 : 60000 / this.bpm);
		};
		step();
	}

	stop() {
		this.playing = false;
		this.rolling = false;
		clearTimeout(this.#auto);
		this.#rollTimers.forEach(clearTimeout);
		this.#rollTimers = [];
	}

	roll() {
		if (this.rolling) return;
		this.stop();
		this.rolling = true;
		let at = 0;
		for (const gap of ROLL_GAPS) {
			this.#rollTimers.push(setTimeout(() => this.knock(true), at));
			at += gap;
		}
		this.#rollTimers.push(
			setTimeout(() => {
				this.ring();
				this.rolling = false;
			}, at)
		);
	}

	applyPreset(index: number) {
		const p = BELL_PRESETS[index];
		this.stop();
		this.preset = index;
		this.mode = p.mode;
		if (p.bpm) this.bpm = p.bpm;
		if (p.secs) this.secs = p.secs;
		if (p.every != null) this.every = p.every;
	}

	setMode(mode: BellMode) {
		this.stop();
		this.mode = mode;
		this.preset = -1;
	}

	setEvery(every: number) {
		this.every = every;
		this.preset = -1;
	}

	/** `dir` is +1 for faster / shorter gap, -1 for slower / longer gap. */
	adjustTempo(dir: 1 | -1) {
		this.preset = -1;
		if (this.mode === 1) {
			this.secs = clamp(this.secs - dir * SECS_RANGE.step, SECS_RANGE.min, SECS_RANGE.max);
		} else {
			this.bpm = clamp(this.bpm + dir * BPM_RANGE.step, BPM_RANGE.min, BPM_RANGE.max);
		}
		if (this.playing) this.start();
	}

	resetCounts() {
		this.stop();
		this.moCount = 0;
		this.bellCount = 0;
	}
}

export const bell = new BellState();
