import { audio } from '$lib/utils/bell-audio';

export type AmbientKind = 'rain' | 'stream' | 'forest';

const FADE_IN = 2;
const FADE_OUT = 1;

/** Two seconds of looping white noise; the filters below shape it into each scene. */
function noiseSource(ac: AudioContext): AudioBufferSourceNode {
	const n = ac.sampleRate * 2;
	const buf = ac.createBuffer(1, n, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
	const src = ac.createBufferSource();
	src.buffer = buf;
	src.loop = true;
	return src;
}

/** Slow oscillator that sweeps `param` by ±`depth` so the noise breathes like moving water or wind. */
function sweep(ac: AudioContext, param: AudioParam, hz: number, depth: number): OscillatorNode {
	const lfo = ac.createOscillator();
	const amount = ac.createGain();
	lfo.frequency.value = hz;
	amount.gain.value = depth;
	lfo.connect(amount).connect(param);
	lfo.start();
	return lfo;
}

/**
 * Synthesised background scene (no audio asset shipped). Returns a function that fades it out and
 * releases the nodes; calling it twice is harmless.
 */
export function startAmbient(kind: AmbientKind): () => void {
	const ac = audio();
	if (!ac) return () => {};

	const src = noiseSource(ac);
	const out = ac.createGain();
	const lfos: OscillatorNode[] = [];
	const filter = ac.createBiquadFilter();
	let level: number;

	if (kind === 'rain') {
		filter.type = 'highpass';
		filter.frequency.value = 900;
		const soften = ac.createBiquadFilter();
		soften.type = 'lowpass';
		soften.frequency.value = 7000;
		src.connect(filter).connect(soften).connect(out);
		level = 0.1;
	} else if (kind === 'stream') {
		filter.type = 'bandpass';
		filter.frequency.value = 800;
		filter.Q.value = 0.7;
		lfos.push(sweep(ac, filter.frequency, 0.35, 260));
		src.connect(filter).connect(out);
		level = 0.22;
	} else {
		filter.type = 'lowpass';
		filter.frequency.value = 420;
		lfos.push(sweep(ac, out.gain, 0.08, 0.04));
		src.connect(filter).connect(out);
		level = 0.3;
	}

	const t0 = ac.currentTime;
	out.gain.setValueAtTime(0.0001, t0);
	out.gain.linearRampToValueAtTime(level, t0 + FADE_IN);
	out.connect(ac.destination);
	src.start();

	let stopped = false;
	return () => {
		if (stopped) return;
		stopped = true;
		const t = ac.currentTime;
		out.gain.cancelScheduledValues(t);
		out.gain.setValueAtTime(out.gain.value, t);
		out.gain.linearRampToValueAtTime(0.0001, t + FADE_OUT);
		setTimeout(
			() => {
				src.stop();
				for (const l of lfos) l.stop();
				out.disconnect();
			},
			FADE_OUT * 1000 + 100
		);
	};
}
