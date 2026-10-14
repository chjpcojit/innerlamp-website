<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { bell } from '$lib/state/bell.svelte';

	let object = $state<HTMLElement>();
	let mallet = $state<HTMLElement>();
	let halo = $state(false);

	const isBell = $derived(bell.mode === 1);
	const hits = $derived(isBell ? bell.bellHit : bell.moHit);

	const reduceMotion = () =>
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Replay the strike animation whenever the visible instrument is hit.
	$effect(() => {
		if (!hits || reduceMotion()) return;
		mallet?.animate(
			[
				{ transform: 'rotate(-8deg)' },
				{ transform: 'rotate(2deg)', offset: 0.1 },
				{ transform: 'rotate(-37deg)', offset: isBell ? 0.15 : 0.27 },
				{ transform: 'rotate(-26deg)', offset: isBell ? 0.32 : 0.5 },
				{ transform: 'rotate(-8deg)' }
			],
			{ duration: isBell ? 480 : 260, easing: 'ease-out' }
		);
		object?.animate(
			isBell
				? [0, 1.8, -1.5, 1.2, -0.95, 0.75, -0.55, 0.4, 0].map((r, i, a) => ({
						transform: `rotate(${r}deg)`,
						offset: i / (a.length - 1)
					}))
				: [
						{ transform: 'scale(1)' },
						{ transform: 'scale(.962) translate(-2px,2px)', offset: 0.38 },
						{ transform: 'scale(1)' }
					],
			{ duration: isBell ? 2200 : 260, easing: 'ease-out' }
		);
		halo = true;
		const t = setTimeout(() => (halo = false), isBell ? 420 : 110);
		return () => clearTimeout(t);
	});

	const hint = $derived(
		bell.rolling
			? m.bell_hint_rolling()
			: bell.playing
				? m.bell_hint_playing()
				: isBell
					? m.bell_hint_tap_bell()
					: m.bell_hint_tap_mo()
	);
</script>

<div class="flex flex-1 basis-[300px] flex-col items-center">
	<div class="relative flex h-[300px] w-[min(100%,300px)] items-center justify-center">
		<div
			class="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.32),transparent_68%)] transition-[opacity,transform] duration-500 {halo
				? 'scale-110 opacity-100'
				: 'scale-95 opacity-45'}"
			aria-hidden="true"
		></div>

		<div
			bind:this={object}
			class="relative h-[200px] w-[200px] origin-[50%_30%]"
			aria-hidden="true"
		>
			{#if isBell}
				<span
					class="absolute top-1 left-1/2 h-4 w-9 -translate-x-1/2 rounded-t-full bg-linear-to-b from-[#8a5a18] to-[#5e3d10]"
				></span>
				<span
					class="absolute top-4 left-1/2 h-[132px] w-[150px] -translate-x-1/2 rounded-t-[75px] rounded-b-[18px] bg-[linear-gradient(90deg,#7a5320,#d6a74c_38%,#f1cf86_52%,#9c6e22)] shadow-[0_14px_16px_rgba(0,0,0,.3)]"
				></span>
				<span
					class="absolute top-[132px] left-1/2 h-3.5 w-[164px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#6b4410,#c8963a_45%,#8a5a18)]"
				></span>
			{:else}
				<span
					class="absolute top-[34px] left-1/2 h-[136px] w-[168px] -translate-x-1/2 rounded-[50%_50%_46%_46%/58%_58%_42%_42%] bg-[radial-gradient(circle_at_36%_30%,#d9a46a,#a8743c_45%,#5e3a1c_80%,#3e230f)] shadow-[0_14px_16px_rgba(0,0,0,.35)]"
				></span>
				<span
					class="absolute top-[98px] left-1/2 h-2.5 w-[104px] -translate-x-1/2 rounded-full bg-[#2e1808]/80"
				></span>
			{/if}
		</div>

		<div
			bind:this={mallet}
			class="absolute right-[18px] bottom-[26px] h-[110px] w-2.5 origin-bottom -rotate-8"
			aria-hidden="true"
		>
			<span
				class="absolute inset-0 rounded-[5px] bg-[linear-gradient(90deg,#4a2c14,#a8743c_40%,#c99560_55%,#5e3a1c)]"
			></span>
			<span
				class="absolute -top-3.5 -left-[9px] h-7 w-7 rounded-full bg-[radial-gradient(circle_at_34%_30%,#d9a46a,#8a5527_55%,#3e230f)] shadow-[0_3px_6px_rgba(0,0,0,.4)]"
			></span>
		</div>

		<button
			type="button"
			onclick={() => bell.tap()}
			aria-label={hint}
			class="absolute inset-0 cursor-pointer touch-manipulation rounded-full select-none focus-visible:outline-2 focus-visible:outline-amber"
		></button>
	</div>

	<div class="mt-2.5 flex flex-col items-center" aria-live="polite">
		<div class="flex items-baseline gap-2">
			<span class="text-[10.5px] font-semibold tracking-[.16em] text-gold">
				{isBell ? m.bell_pad_tag_bell() : m.bell_pad_tag_mo()}
			</span>
			<span class="text-[40px]/none font-light text-ink">
				{isBell ? bell.bellCount : bell.moCount}
			</span>
		</div>
		<p class="mt-2 text-xs text-ink/50">{hint} · {m.bell_hint_space()}</p>
	</div>

	<div class="mt-3.5 flex gap-5 text-[13px] text-ink/60">
		<span>{m.bell_count_mo()} <b class="font-medium text-ink">{bell.moCount}</b></span>
		<span>{m.bell_count_bell()} <b class="font-medium text-ink">{bell.bellCount}</b></span>
	</div>
</div>
