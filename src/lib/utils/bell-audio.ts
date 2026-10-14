let ctx: AudioContext | null = null;

/** Shared `AudioContext`; created lazily so it is only built after a user gesture. */
export function audio(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!ctx) {
		const Ctor =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
	}
	if (ctx.state === 'suspended') void ctx.resume();
	return ctx;
}

function tone(
	ac: AudioContext,
	freq: number,
	gain: number,
	dur: number,
	type: OscillatorType,
	t0: number,
	bend?: number
) {
	const osc = ac.createOscillator();
	const amp = ac.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	if (bend) osc.frequency.exponentialRampToValueAtTime(freq * bend, t0 + dur);
	amp.gain.setValueAtTime(0.0001, t0);
	amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	osc.connect(amp).connect(ac.destination);
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

function noise(
	ac: AudioContext,
	t0: number,
	dur: number,
	gain: number,
	type: BiquadFilterType,
	freq: number,
	q: number
) {
	const n = Math.ceil(ac.sampleRate * dur);
	const buf = ac.createBuffer(1, n, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
	const src = ac.createBufferSource();
	const filter = ac.createBiquadFilter();
	const amp = ac.createGain();
	src.buffer = buf;
	filter.type = type;
	filter.frequency.value = freq;
	filter.Q.value = q;
	amp.gain.value = gain;
	src.connect(filter).connect(amp).connect(ac.destination);
	src.start(t0);
}

/** Wooden-fish knock, synthesised so no audio asset is shipped. */
export function playMo() {
	const ac = audio();
	if (!ac) return;
	const t0 = ac.currentTime + 0.07;
	noise(ac, t0, 0.05, 0.9, 'bandpass', 1250, 5);
	tone(ac, 480, 0.5, 0.2, 'sine', t0, 0.9);
	tone(ac, 940, 0.16, 0.09, 'sine', t0, 0.95);
	tone(ac, 1630, 0.05, 0.04, 'triangle', t0);
}

/** Temple bell strike: inharmonic partials with a long decay. */
export function playBell() {
	const ac = audio();
	if (!ac) return;
	const t0 = ac.currentTime + 0.07;
	noise(ac, t0, 0.03, 0.35, 'highpass', 2500, 0.7);
	const partials: [number, number, number][] = [
		[1, 0.26, 11],
		[1.0045, 0.12, 10],
		[2.71, 0.13, 7],
		[2.717, 0.06, 7],
		[5.15, 0.07, 4],
		[5.163, 0.03, 4],
		[8.43, 0.03, 2],
		[12.1, 0.015, 1]
	];
	for (const [mult, gain, dur] of partials) tone(ac, 174 * mult, gain, dur, 'sine', t0);
}

/** Khánh: a small, bright bowl bell, higher and shorter than the temple bell. */
export function playKhanh() {
	const ac = audio();
	if (!ac) return;
	const t0 = ac.currentTime + 0.07;
	const partials: [number, number][] = [
		[1, 0.3],
		[2.76, 0.125],
		[5.4, 0.06],
		[8.9, 0.025]
	];
	for (const [mult, gain] of partials)
		tone(ac, 520 * mult, gain, 3.5 / Math.sqrt(mult), 'sine', t0);
}
