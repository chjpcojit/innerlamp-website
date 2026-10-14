<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import MalaRing from '$lib/components/ui/MalaRing.svelte';
	import { MALA_TOTAL } from '$lib/utils/mala';

	let { isGuest = false }: { isGuest?: boolean } = $props();

	let beads = $state(0);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<section
	id="practice"
	class="grid scroll-mt-24 grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5"
>
	<div class="flex items-center gap-5 rounded-3xl border border-ink/8 bg-paper p-[22px]">
		<MalaRing count={beads} onadvance={() => (beads = beads >= MALA_TOTAL ? 1 : beads + 1)} />
		<div>
			<h2 class="text-sm font-medium">{m.practice_bead_title()}</h2>
			<p class="mt-1.5 font-serif text-sm">{m.practice_bead_mantra()}</p>
			<div class="mt-3 flex items-center gap-4">
				<button
					type="button"
					onclick={() => (beads = 0)}
					class="text-xs font-medium text-gold-deep hover:text-gold"
				>
					{m.practice_bead_reset()}
				</button>
				<a
					href={localizeHref('/practice/mala')}
					class="text-xs font-medium text-gold-deep hover:text-gold"
				>
					{m.practice_bead_open()}
				</a>
			</div>
			{#if isGuest}
				<p class="mt-2.5 text-xs text-ink/45">{m.practice_bead_guest_hint()}</p>
			{/if}
		</div>
	</div>

	<a
		href={localizeHref('/practice')}
		class="flex flex-col justify-between rounded-3xl border border-ink/8 bg-paper p-[22px] transition-colors hover:bg-white"
	>
		<Icon kind="mo" size={64} tint="rgba(184,134,47,.12)" />
		<span>
			<span class="mt-4 block text-[15px] font-medium">{m.practice_bell_title()}</span>
			<span class="mt-1 block text-xs text-ink/50">{m.practice_bell_desc()}</span>
		</span>
	</a>

	<a
		href={localizeHref('/practice')}
		class="flex flex-col justify-between rounded-3xl border border-sage/25 bg-sage/12 p-[22px]"
	>
		<span class="text-[10.5px] font-semibold tracking-[.14em] text-sage"
			>{m.practice_suggest_label()}</span
		>
		<span>
			<span class="mt-4 block font-serif text-[22px]/[1.3]">{m.practice_suggest_title()}</span>
			<span class="mt-1.5 block text-xs text-ink/55">{m.practice_suggest_meta()}</span>
		</span>
	</a>
</section>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
