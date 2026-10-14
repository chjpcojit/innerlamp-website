<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import type { SutraSummary } from '$lib/types/sutra';
	import { sutraAltTitle, sutraTitle, traditionCover, traditionLabel } from '$lib/utils/sutra';

	interface Props {
		sutra: Pick<SutraSummary, 'titles' | 'tradition'>;
		/** Element used for the title; `p` when the page already owns the heading. */
		titleTag?: 'h2' | 'h3' | 'p';
	}

	let { sutra, titleTag = 'p' }: Props = $props();

	const locale = $derived(getLocale());
	const alt = $derived(sutraAltTitle(sutra.titles, locale));
</script>

<div
	class="flex aspect-3/4 flex-col justify-between rounded-[18px] p-[18px] text-[#f5eee0] shadow-[inset_6px_0_0_rgba(0,0,0,.14)] {traditionCover(
		sutra.tradition
	)}"
>
	<p class="text-[10.5px] font-semibold tracking-[.16em] uppercase opacity-70">
		{traditionLabel(sutra.tradition) ?? ''}
	</p>
	<div>
		<svelte:element this={titleTag} class="font-serif text-[22px]/[1.25] text-balance">
			{sutraTitle(sutra.titles, locale)}
		</svelte:element>
		{#if alt}
			<p class="mt-1.5 font-serif text-xs italic opacity-70">{alt}</p>
		{/if}
	</div>
</div>
