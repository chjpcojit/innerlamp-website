<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { playBell } from '$lib/utils/bell-audio';

	const TARGETS = [21, 54, 108] as const;
	const GAP = 52;
	const VISIBLE = 4;

	let target = $state<(typeof TARGETS)[number]>(108);
	let count = $state(0);
	let round = $state(1);
	let done = $state(false);
	let drag: { y: number; fired: boolean } | null = null;

	const pct = $derived((count / target) * 100);
	// Beads keyed by absolute index so advancing slides each one up a slot via CSS transition.
	const strand = $derived(
		Array.from({ length: VISIBLE * 2 + 1 }, (_, i) => {
			const k = i - VISIBLE;
			return { index: count + k, k };
		}).filter((b) => b.index >= 0)
	);

	function advance() {
		if (done) return;
		count += 1;
		if (count >= target) {
			playBell();
			setTimeout(() => (done = true), 260);
		}
	}

	function setTarget(v: (typeof TARGETS)[number]) {
		target = v;
		count = 0;
		done = false;
	}

	function next() {
		count = 0;
		round += 1;
		done = false;
	}

	function onpointerdown(e: PointerEvent) {
		drag = { y: e.clientY, fired: false };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onpointermove(e: PointerEvent) {
		if (!drag || drag.fired || Math.abs(e.clientY - drag.y) < 22) return;
		drag.fired = true;
		advance();
	}

	function onpointerup() {
		if (drag && !drag.fired) advance();
		drag = null;
	}

	let wheel = 0;
	function onwheel(e: WheelEvent) {
		wheel += e.deltaY;
		if (Math.abs(wheel) < 60) return;
		wheel = 0;
		advance();
	}

	const beadSize = (k: number) => 58 - Math.abs(k) * 7;
</script>

<svelte:window
	onkeydown={(e) => {
		const el = e.target as HTMLElement | null;
		if (e.code !== 'Space' || el?.closest('button, a, input, textarea, select, [contenteditable]'))
			return;
		e.preventDefault();
		advance();
	}}
/>

<div class="flex flex-col gap-6">
	<header class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">{m.mala_title()}</h1>
			<p class="mt-2 text-sm text-ink/55" aria-live="polite">
				{m.mala_round_label({ round, count, target })}
			</p>
		</div>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
		<a
			href={localizeHref('/practice')}
			class="rounded-full bg-ink px-[22px] py-[11px] text-[13px] font-medium text-cream transition-colors hover:bg-[#3a342c]"
		>
			{m.mala_finish()}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</header>

	<section
		aria-label={m.mala_title()}
		class="relative flex flex-col items-center overflow-hidden rounded-[28px] border border-ink/8 bg-[radial-gradient(circle_at_50%_32%,#fffdf8,#efe6d5_74%)] px-6 pt-7 pb-8"
	>
		<div class="flex gap-1.5">
			{#each TARGETS as v (v)}
				<button
					type="button"
					aria-pressed={target === v}
					onclick={() => setTarget(v)}
					class="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors {target ===
					v
						? 'border-amber/60 bg-amber/16 text-gold-deep'
						: 'border-ink/12 text-ink/80 hover:bg-ink/4'}"
				>
					{m.mala_target_chip({ n: v })}
				</button>
			{/each}
		</div>

		<div class="mt-3.5 h-0.5 w-[180px] overflow-hidden rounded-full bg-ink/12" aria-hidden="true">
			<div class="h-full bg-gold transition-[width] duration-200" style:width="{pct}%"></div>
		</div>

		<div
			{onpointerdown}
			{onpointermove}
			{onpointerup}
			onpointercancel={onpointerup}
			{onwheel}
			role="button"
			tabindex="-1"
			aria-label={m.mala_strand_aria()}
			class="relative mt-3.5 h-[440px] w-[min(100%,420px)] cursor-grab touch-none overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_16%,#000_84%,transparent)] select-none"
		>
			<span
				class="absolute top-0 bottom-0 left-1/2 w-[3px] -translate-x-1/2 rounded-[2px] bg-[repeating-linear-gradient(180deg,#7a2a1c_0_3px,#a33a26_3px_5px,#5e1f14_5px_7px)]"
				aria-hidden="true"
			></span>
			<span
				class="absolute top-[220px] left-1/2 size-[74px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/60"
				aria-hidden="true"
			></span>
			{#each strand as b (b.index)}
				<span
					class="absolute left-1/2 rounded-full bg-[radial-gradient(circle_at_34%_28%,#c98a52,#7a4a24_55%,#3a1f0c)] shadow-[0_6px_12px_rgba(8,6,4,.45),inset_0_-4px_9px_rgba(0,0,0,.5),inset_0_2px_3px_rgba(255,236,200,.22)] transition-[top,width,height,margin,opacity] duration-200 ease-out"
					style:top="{220 + b.k * GAP}px"
					style:width="{beadSize(b.k)}px"
					style:height="{beadSize(b.k)}px"
					style:margin-left="{-beadSize(b.k) / 2}px"
					style:margin-top="{-beadSize(b.k) / 2}px"
					style:opacity={1 - Math.abs(b.k) * 0.16}
					aria-hidden="true"
				></span>
			{/each}
		</div>

		<p class="mt-4 max-w-[560px] text-center font-serif text-[28px]/snug font-medium text-balance">
			{m.practice_bead_mantra()}
		</p>
		<p class="mt-2 text-center text-xs text-ink/50">{m.mala_gesture_hint()}</p>
		<button
			type="button"
			onclick={() => {
				count = 0;
				done = false;
			}}
			class="mt-5 h-12 w-60 cursor-pointer rounded-full border border-ink/20 text-[13px] font-medium transition-colors hover:bg-ink/4"
		>
			{m.practice_bead_reset()}
		</button>

		{#if done}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="mala-done-title"
				class="absolute inset-0 z-10 flex items-center justify-center bg-[#080604]/40 p-7"
			>
				<div
					class="w-[min(100%,380px)] rounded-[26px] border border-gold/30 bg-paper px-6 py-[30px] text-center shadow-[0_30px_70px_rgba(0,0,0,.25)]"
				>
					<h2 id="mala-done-title" class="font-serif text-[28px]/snug font-medium">
						{m.mala_complete_title({ target })}
					</h2>
					<p class="mt-2 text-[13px]/relaxed text-ink/60">{m.mala_complete_body({ round })}</p>
					<div class="mt-[22px] flex gap-2.5">
						<button
							type="button"
							onclick={next}
							class="h-12 flex-1 cursor-pointer rounded-full bg-amber text-[13px] font-medium text-[#1a1611]"
						>
							{m.mala_continue()}
						</button>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
						<a
							href={localizeHref('/practice')}
							class="flex h-12 flex-1 items-center justify-center rounded-full border border-ink/20 text-[13px] font-medium"
						>
							{m.mala_finish()}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>
