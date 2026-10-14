<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import {
		BELL_EVERY,
		BELL_PRESETS,
		bell,
		type BellMode,
		type BellPreset
	} from '$lib/state/bell.svelte';

	const presetLabel: Record<BellPreset['key'], () => string> = {
		chant: () => m.bell_preset_chant(),
		mala: () => m.bell_preset_mala(),
		prostrate: () => m.bell_preset_prostrate(),
		sit: () => m.bell_preset_sit(),
		mo: () => m.bell_preset_mo()
	};

	const modes: { mode: BellMode; label: () => string }[] = [
		{ mode: 0, label: () => m.bell_mode_mo() },
		{ mode: 1, label: () => m.bell_mode_bell() },
		{ mode: 2, label: () => m.bell_mode_both() }
	];

	const chip = (on: boolean) =>
		on ? 'border-amber/60 bg-amber/16 text-gold-deep' : 'border-ink/12 text-ink/80 hover:bg-ink/4';
</script>

<div class="flex max-w-[440px] flex-1 basis-[300px] flex-col gap-4">
	<div class="flex flex-wrap gap-2">
		{#each BELL_PRESETS as p, i (p.key)}
			<button
				type="button"
				aria-pressed={bell.preset === i}
				onclick={() => bell.applyPreset(i)}
				class="cursor-pointer rounded-full border px-[15px] py-[9px] text-xs font-medium transition-colors {chip(
					bell.preset === i
				)}"
			>
				{presetLabel[p.key]()}
			</button>
		{/each}
	</div>

	<div
		role="group"
		aria-label={m.bell_mode_aria()}
		class="flex rounded-full border border-ink/12 bg-ink/4 p-[3px]"
	>
		{#each modes as o (o.mode)}
			<button
				type="button"
				aria-pressed={bell.mode === o.mode}
				onclick={() => bell.setMode(o.mode)}
				class="h-[38px] flex-1 cursor-pointer rounded-full text-[13px] font-medium whitespace-nowrap transition-colors {bell.mode ===
				o.mode
					? 'bg-ink/12 text-ink'
					: 'text-ink/58'}"
			>
				{o.label()}
			</button>
		{/each}
	</div>

	<div class="rounded-[22px] border border-ink/12 bg-paper px-[18px] py-4">
		<div class="flex items-center gap-3">
			<div class="min-w-0 flex-1">
				<p class="text-xs text-ink/58">
					{bell.mode === 1 ? m.bell_rate_bell_label() : m.bell_rate_mo_label()}
				</p>
				<p class="mt-[3px] text-lg font-medium">
					{bell.mode === 1
						? m.bell_rate_bell_value({ secs: bell.secs })
						: m.bell_rate_mo_value({ bpm: bell.bpm })}
				</p>
			</div>
			{#each [{ dir: -1 as const, sign: '−', label: m.bell_tempo_decrease() }, { dir: 1 as const, sign: '+', label: m.bell_tempo_increase() }] as b (b.dir)}
				<button
					type="button"
					aria-label={b.label}
					onclick={() => bell.adjustTempo(bell.mode === 1 ? (-b.dir as 1 | -1) : b.dir)}
					class="flex size-[42px] cursor-pointer items-center justify-center rounded-full border border-ink/20 text-xl select-none hover:bg-sand/60"
				>
					{b.sign}
				</button>
			{/each}
		</div>

		{#if bell.mode === 2}
			<div class="my-3.5 h-px bg-ink/12"></div>
			<div class="flex items-center gap-2.5">
				<p class="min-w-0 flex-1 text-xs/snug text-ink/58">{m.bell_every_label()}</p>
				<div class="flex gap-1.5">
					{#each BELL_EVERY as v (v)}
						<button
							type="button"
							aria-pressed={bell.every === v}
							onclick={() => bell.setEvery(v)}
							class="h-8 min-w-[38px] cursor-pointer rounded-full border px-2.5 text-xs font-medium transition-colors {chip(
								bell.every === v
							)}"
						>
							{v ? v : m.bell_every_off()}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-1 flex items-center gap-2.5">
		<button
			type="button"
			onclick={() => (bell.mode === 1 ? bell.resetCounts() : bell.roll())}
			class="h-[50px] flex-1 cursor-pointer rounded-full border border-ink/20 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-ink/4"
		>
			{bell.mode === 1 ? m.bell_reset() : m.bell_roll()}
		</button>
		<button
			type="button"
			onclick={() => bell.togglePlay()}
			aria-label={bell.playing ? m.bell_pause() : m.bell_play()}
			class="flex size-[66px] flex-none cursor-pointer items-center justify-center rounded-full bg-amber shadow-[0_8px_24px_rgba(217,150,60,.28)]"
		>
			{#if bell.playing}
				<span class="flex gap-[5px]" aria-hidden="true">
					<span class="h-5 w-[5px] rounded-[2px] bg-[#1a1611]"></span>
					<span class="h-5 w-[5px] rounded-[2px] bg-[#1a1611]"></span>
				</span>
			{:else}
				<span
					class="ml-[5px] size-0 border-y-[11px] border-l-[17px] border-y-transparent border-l-[#1a1611]"
					aria-hidden="true"
				></span>
			{/if}
		</button>
		<button
			type="button"
			onclick={() => bell.ring()}
			class="h-[50px] flex-1 cursor-pointer rounded-full border border-amber/40 bg-amber/16 text-[13px] font-medium whitespace-nowrap text-gold-deep"
		>
			{m.bell_ring_now()}
		</button>
	</div>
</div>
