<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { DEFAULT_SIT_DURATION, SIT_DURATIONS } from '$lib/content/practice';

	let duration = $state<number>(DEFAULT_SIT_DURATION);
</script>

<section
	data-keep-dark
	aria-labelledby="practice-sit-title"
	class="flex flex-col gap-6 rounded-[28px] bg-[radial-gradient(circle_at_50%_30%,#2a241c,#100e0b_74%)] p-[clamp(22px,5vw,34px)] text-[#f5eee0] md:px-9"
>
	<p class="text-[10px] font-semibold tracking-[.16em] text-[#e8b061]">{m.practice_sit_kicker()}</p>
	<div>
		<h2 id="practice-sit-title" class="font-serif text-[33.6px]/tight">{m.practice_sit_title()}</h2>
		<p class="mt-2 text-[13px] text-[#f2ebdd]/60">{m.practice_sit_meta()}</p>
	</div>
	<div role="radiogroup" aria-labelledby="practice-sit-duration">
		<p id="practice-sit-duration" class="mb-2.5 text-[12.5px] font-medium text-[#f2ebdd]/60">
			{m.practice_sit_duration()}
		</p>
		<div class="flex flex-wrap gap-2">
			{#each SIT_DURATIONS as d (d)}
				<button
					type="button"
					role="radio"
					aria-checked={duration === d}
					onclick={() => (duration = d)}
					class="w-16 cursor-pointer rounded-2xl border py-3 text-center transition-colors {duration ===
					d
						? 'border-amber-light bg-amber-light text-[#1a1611]'
						: 'border-[#f2ebdd]/12 bg-[#f2ebdd]/5 text-[#f2ebdd] hover:bg-[#f2ebdd]/10'}"
				>
					<span class="block font-serif text-2xl/tight">{d}</span>
					<span class="block text-[10.5px] opacity-60">{m.practice_sit_minutes_unit()}</span>
				</button>
			{/each}
		</div>
		<p class="mt-3 font-serif text-[13px] text-[#f2ebdd]/50 italic">{m.practice_sit_habit()}</p>
	</div>
	<div class="mt-auto flex flex-wrap items-center justify-between gap-4">
		<p class="text-[12.5px] text-[#f2ebdd]/55">{m.practice_sit_bell_note()}</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
		<a
			href={localizeHref(`/practice/meditate?d=${duration}`)}
			class="rounded-full bg-amber px-7 py-3.5 text-sm font-medium whitespace-nowrap text-[#1a1611] transition-colors hover:bg-amber-light"
		>
			{m.practice_sit_start({ minutes: duration })}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
</section>
