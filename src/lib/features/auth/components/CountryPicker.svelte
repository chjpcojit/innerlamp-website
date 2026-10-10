<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { COUNTRIES } from '../data';

	interface Props {
		selected: number;
		onselect: (index: number) => void;
		onclose: () => void;
	}

	let { selected, onselect, onclose }: Props = $props();
	let query = $state('');

	const fold = (x: string) =>
		x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

	const items = $derived.by(() => {
		const q = fold(query.trim());
		return COUNTRIES.map((c, index) => ({ c, index })).filter(
			({ c }) => !q || fold(c.name()).includes(q) || fold(c.iso).includes(q) || c.dial.includes(q)
		);
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div
	class="fixed inset-0 z-100 flex items-center justify-center bg-[#14120F]/40 p-6"
	role="presentation"
	onclick={onclose}
>
	<div
		class="flex max-h-[min(560px,90vh)] w-[min(100%,400px)] flex-col overflow-hidden rounded-3xl bg-[#FBF7EF] shadow-[0_30px_80px_rgba(0,0,0,.3)]"
		role="dialog"
		aria-modal="true"
		aria-labelledby="country-picker-title"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<div class="px-5 pt-5 pb-3">
			<div class="flex items-center justify-between">
				<h2 id="country-picker-title" class="font-serif text-[22px]">{m.country_picker_title()}</h2>
				<button
					type="button"
					class="flex size-[34px] cursor-pointer items-center justify-center rounded-full text-ink/60 hover:bg-[#F1E8D8]"
					aria-label={m.country_picker_close()}
					onclick={onclose}>✕</button
				>
			</div>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:value={query}
				autofocus
				placeholder={m.country_picker_search()}
				aria-label={m.country_picker_search()}
				class="mt-3.5 box-border h-12 w-full rounded-[14px] border border-ink/14 bg-paper px-4 text-[14.5px] outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,134,47,.16)]"
			/>
		</div>
		<ul class="overflow-y-auto px-2.5 pb-3">
			{#each items as { c, index } (index)}
				<li>
					<button
						type="button"
						class="flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left hover:bg-[#F3ECDE] {index ===
						selected
							? 'bg-gold/8'
							: ''}"
						onclick={() => onselect(index)}
					>
						<span
							class="w-[34px] rounded-md bg-[#EFE6D5] py-[3px] text-center text-[10.5px] font-semibold tracking-[.06em]"
							>{c.iso}</span
						>
						<span class="flex-1 text-sm">{c.name()}</span>
						<span class="text-[13px] font-medium text-ink/55">{c.dial}</span>
						<span class="flex w-4 flex-none justify-end {index === selected ? '' : 'opacity-0'}">
							<span
								class="mt-[-2px] h-[4.5px] w-2 -rotate-45 border-b-[1.8px] border-l-[1.8px] border-gold-deep"
							></span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
		{#if items.length === 0}
			<p class="px-3 pt-7 pb-7 text-center text-[13.5px] text-ink/50">{m.country_picker_empty()}</p>
		{/if}
	</div>
</div>
