<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/state';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { SIT_DURATIONS } from '$lib/content/practice';
	import {
		BREATH_SECONDS,
		MeditationState,
		SIT_BELLS,
		SIT_INTERVALS
	} from '$lib/state/meditation.svelte';

	const sit = new MeditationState();

	onMount(() => {
		const d = Number(page.url.searchParams.get('d'));
		if (d) sit.setDuration(d);
	});
	onDestroy(() => sit.destroy());

	const BELL_LABELS = [
		() => m.med_bell_khanh(),
		() => m.med_bell_giatri(),
		() => m.med_bell_none()
	];
	const AMBIENT_LABELS = [
		() => m.med_ambient_silent(),
		() => m.med_ambient_rain(),
		() => m.med_ambient_stream(),
		() => m.med_ambient_forest()
	];

	const idle = $derived(sit.phase === 'idle');
	const active = $derived(sit.phase === 'run' || sit.phase === 'pause' || sit.phase === 'settle');
	const done = $derived(sit.phase === 'done');
	const dimOn = $derived(sit.phase === 'run' && sit.dimmed);

	const clock = $derived.by(() => {
		if (sit.phase === 'settle') return String(Math.max(0, sit.settle));
		const s = sit.left;
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	});
	const phaseLabel = $derived(
		{
			idle: m.med_phase_idle(),
			settle: m.med_phase_settle(),
			run: sit.breathingIn ? m.med_phase_in() : m.med_phase_out(),
			pause: m.med_phase_pause(),
			done: m.med_phase_done()
		}[sit.phase]
	);
	const verse = $derived(
		{
			idle: m.med_verse_idle(),
			settle: m.med_verse_settle(),
			run: m.med_verse_run(),
			pause: m.med_verse_pause(),
			done: m.med_verse_done()
		}[sit.phase]
	);
	/** Breathing glow: small while settling or exhaling, full on the inhale. */
	const glowScale = $derived(
		sit.phase === 'settle' ? 0.9 : sit.phase === 'run' ? (sit.breathingIn ? 1 : 0.7) : 0.84
	);
	const sat = $derived(Math.max(1, Math.round(sit.elapsed / 60)));

	const MOTES = Array.from({ length: 12 }, (_, i) => ({
		x: (7 + i * 8.1) % 96,
		y: 55 + ((i * 37) % 40),
		size: 2 + (i % 3),
		dur: 9 + ((i * 5) % 8),
		delay: (i * 1.3) % 10
	}));
	const BLOBS = [
		{ l: '8%', t: '6%', w: '46%', c: 'rgba(243,198,115,.42)', dx: '40px', dy: '30px', d: 26 },
		{ l: '58%', t: '2%', w: '40%', c: 'rgba(217,138,128,.20)', dx: '-30px', dy: '40px', d: 32 },
		{ l: '20%', t: '62%', w: '56%', c: 'rgba(127,168,140,.26)', dx: '36px', dy: '-26px', d: 38 }
	];

	const GLOW =
		'radial-gradient(circle, rgba(243,198,115,.55), rgba(217,150,60,.12) 62%, transparent 72%)';

	const label = 'mb-2.5 block text-xs font-medium text-ink/55';
	const chip =
		'cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-colors';
	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/14 bg-paper text-ink hover:border-ink/30';
	const ghostBtn =
		'cursor-pointer rounded-full border border-ink/18 px-[26px] py-[13px] text-sm font-medium whitespace-nowrap transition-colors hover:border-ink/40';
	const solidBtn =
		'cursor-pointer rounded-full bg-ink px-[26px] py-[13px] text-sm font-medium whitespace-nowrap text-cream transition-opacity hover:opacity-85';
</script>

<section
	aria-labelledby="med-title"
	class="relative flex min-h-[680px] flex-col items-center gap-8 overflow-hidden rounded-[32px] border border-ink/6 bg-[linear-gradient(180deg,#f3e4cc_0%,#f8f0e3_46%,#eceee3_100%)] px-[clamp(20px,5vw,56px)] py-[clamp(36px,6vw,72px)] text-center text-ink"
>
	<div class="il-motion pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
		{#each BLOBS as b, i (i)}
			<div
				class="absolute aspect-square rounded-full blur-[10px]"
				style:left={b.l}
				style:top={b.t}
				style:width={b.w}
				style:background="radial-gradient(circle,{b.c},transparent 68%)"
				style:--dx={b.dx}
				style:--dy={b.dy}
				style:animation="il-drift {b.d}s ease-in-out infinite"
			></div>
		{/each}
		{#each MOTES as mote, i (i)}
			<div
				class="absolute rounded-full bg-amber-light shadow-[0_0_8px_rgba(243,198,115,.9)]"
				style:left="{mote.x}%"
				style:top="{mote.y}%"
				style:width="{mote.size}px"
				style:height="{mote.size}px"
				style:animation="il-mote {mote.dur}s ease-in-out {mote.delay}s infinite both"
			></div>
		{/each}
	</div>

	<header class="relative">
		<p class="text-[10.5px] font-semibold tracking-[.18em] text-gold-deep">{m.med_kicker()}</p>
		<h1 id="med-title" class="mt-2.5 font-serif text-[clamp(32px,6.4vw,40px)] font-medium">
			{m.med_title()}
		</h1>
		<p
			aria-live="polite"
			class="mt-2.5 min-h-8 font-serif text-[clamp(17px,2.4vw,20px)]/[1.6] font-medium text-ink/60 italic"
		>
			{#key verse}
				<span class="il-motion inline-block" style:animation="il-fadein 1.6s ease both"
					>{verse}</span
				>
			{/key}
		</p>
	</header>

	<div class="relative flex aspect-square w-[min(340px,72vw)] items-center justify-center">
		<div class="il-motion pointer-events-none absolute inset-0" aria-hidden="true">
			{#each [0, 1, 2] as i (i)}
				<div
					class="absolute inset-0 rounded-full border border-gold/35"
					style:animation="il-ripple 9s ease-out {i * 3}s infinite both"
				></div>
			{/each}
		</div>
		<div
			class="absolute inset-0 rounded-full border border-ink/8 bg-paper/35"
			aria-hidden="true"
		></div>
		<div
			class="absolute inset-0 rounded-full opacity-90"
			aria-hidden="true"
			style:background="conic-gradient(#b8862f {(sit.progress * 100).toFixed(2)}%, transparent 0)"
			style:mask="radial-gradient(circle, transparent 69.5%, #000 70%)"
			style:-webkit-mask="radial-gradient(circle, transparent 69.5%, #000 70%)"
		></div>
		<div
			class="il-motion absolute inset-[14%] rounded-full shadow-[0_0_80px_rgba(243,198,115,.35)] transition-transform ease-in-out"
			aria-hidden="true"
			style:background={GLOW}
			style:transform="scale({glowScale})"
			style:transition-duration="{BREATH_SECONDS}s"
		></div>
		<div class="relative">
			<p role="timer" class="font-serif text-[clamp(48px,12vw,64px)]/none font-medium tabular-nums">
				{clock}
			</p>
			<p class="mt-2.5 text-sm tracking-[.04em] text-ink/60">{phaseLabel}</p>
		</div>
	</div>

	{#if idle}
		<div class="relative flex w-full max-w-[560px] flex-col items-center gap-[22px]">
			<div role="radiogroup" aria-labelledby="med-duration">
				<p id="med-duration" class={label}>{m.med_duration()}</p>
				<div class="flex flex-wrap justify-center gap-2">
					{#each SIT_DURATIONS as d (d)}
						<button
							type="button"
							role="radio"
							aria-checked={sit.duration === d}
							onclick={() => sit.setDuration(d)}
							class="w-16 cursor-pointer rounded-2xl border py-3 transition-colors {sit.duration ===
							d
								? chipOn
								: chipOff}"
						>
							<span class="block font-serif text-[22px]/tight font-medium">{d}</span>
							<span class="block text-[10.5px] opacity-60">{m.practice_sit_minutes_unit()}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex flex-wrap justify-center gap-7">
				<div role="radiogroup" aria-labelledby="med-bell">
					<p id="med-bell" class={label}>{m.med_bell()}</p>
					<div class="flex flex-wrap justify-center gap-1.5">
						{#each SIT_BELLS as b (b)}
							<button
								type="button"
								role="radio"
								aria-checked={sit.bell === b}
								onclick={() => sit.pickBell(b)}
								class="{chip} {sit.bell === b ? chipOn : chipOff}"
							>
								{BELL_LABELS[b]()}
							</button>
						{/each}
					</div>
				</div>
				<div role="radiogroup" aria-labelledby="med-ambient">
					<p id="med-ambient" class={label}>{m.med_ambient()}</p>
					<div class="flex flex-wrap justify-center gap-1.5">
						{#each AMBIENT_LABELS as ambientLabel, i (i)}
							<button
								type="button"
								role="radio"
								aria-checked={sit.ambient === i}
								onclick={() => (sit.ambient = i)}
								class="{chip} {sit.ambient === i ? chipOn : chipOff}"
							>
								{ambientLabel()}
							</button>
						{/each}
					</div>
				</div>
				<div role="radiogroup" aria-labelledby="med-interval">
					<p id="med-interval" class={label}>{m.med_interval()}</p>
					<div class="flex flex-wrap justify-center gap-1.5">
						{#each SIT_INTERVALS as v, i (v)}
							<button
								type="button"
								role="radio"
								aria-checked={sit.interval === i}
								onclick={() => (sit.interval = i)}
								class="{chip} {sit.interval === i ? chipOn : chipOff}"
							>
								{v ? m.med_interval_minutes({ minutes: v }) : m.med_interval_none()}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<button
				type="button"
				onclick={() => sit.start()}
				class="cursor-pointer rounded-full bg-ink px-[34px] py-[15px] text-[15px] font-medium whitespace-nowrap text-cream transition-opacity hover:opacity-85"
			>
				{m.practice_sit_start({ minutes: sit.duration })}
			</button>
			<p class="max-w-[380px] text-xs/[1.55] text-pretty text-ink/55">{m.med_start_note()}</p>
		</div>
	{/if}

	{#if active}
		<div class="relative flex gap-2.5">
			<button
				type="button"
				onclick={() => sit.togglePause()}
				disabled={sit.phase === 'settle'}
				class="{ghostBtn} disabled:cursor-default disabled:opacity-40"
			>
				{sit.phase === 'pause' ? m.med_resume() : m.med_pause()}
			</button>
			<button type="button" onclick={() => sit.end()} class={solidBtn}>{m.med_end()}</button>
		</div>
	{/if}

	{#if done}
		<div class="relative flex flex-col items-center gap-4">
			<p class="max-w-[420px] font-serif text-[22px]/[1.6] font-medium text-ink/75 italic">
				{m.med_done_message({ minutes: sat })}
			</p>
			<div class="flex flex-wrap justify-center gap-2.5">
				<button type="button" onclick={() => sit.reset()} class={ghostBtn}>{m.med_again()}</button>
				<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
				<a href={localizeHref('/practice')} class="{solidBtn} text-cream hover:text-cream">
					{m.med_journal()}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		</div>
	{/if}
</section>

{#if dimOn}
	<button
		type="button"
		data-keep-dark="fixed"
		aria-label={m.med_dim_aria()}
		onclick={() => sit.wake()}
		class="fixed inset-0 z-[130] flex cursor-pointer flex-col items-center justify-center bg-[#0b0907]"
		style:animation="il-dawn 3s ease both"
	>
		<span
			class="il-motion size-2.5 rounded-full bg-gold shadow-[0_0_24px_6px_rgba(217,150,60,.35)]"
			style:animation="il-breathe 8s ease-in-out infinite"
		></span>
		<span class="absolute bottom-10 text-xs tracking-[.04em] text-[#f2ebdd]/22">
			{m.med_dim_hint()}
		</span>
	</button>
{/if}
