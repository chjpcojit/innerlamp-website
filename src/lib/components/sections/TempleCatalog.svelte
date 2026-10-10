<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { REGIONS, TEMPLE_LIST, type Region } from '$lib/content/temples';
	import { fold } from '$lib/utils/text';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';

	let query = $state('');
	let region = $state<Region | null>(null);

	const options = $derived(REGIONS.map((r) => ({ id: r.id, label: r.label() })));
	const needle = $derived(fold(query.trim()));
	const visible = $derived(
		TEMPLE_LIST.filter(
			(t) =>
				(!region || t.region === region) &&
				(!needle || fold(`${t.name()} ${t.place()}`).includes(needle))
		)
	);
	const subtitle = $derived(
		region
			? m.temples_page_sub_region({
					count: visible.length,
					region: REGIONS.find((r) => r.id === region)?.label() ?? ''
				})
			: m.temples_page_sub({ count: visible.length })
	);
</script>

<div class="flex flex-col gap-7">
	<PageHeader title={m.temples_title()} {subtitle}>
		<SearchField
			bind:value={query}
			label={m.temples_search_label()}
			placeholder={m.temples_search_placeholder()}
		/>
	</PageHeader>
	<FilterChips
		{options}
		bind:value={region}
		allLabel={m.region_all()}
		label={m.temples_region_label()}
	/>
	{#if visible.length}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
			{#each visible as t (t.id)}
				<li
					class="relative overflow-hidden rounded-[22px] border border-ink/8 bg-paper transition-colors focus-within:bg-white hover:bg-white"
				>
					<div
						class="flex h-40 items-center justify-center bg-[repeating-linear-gradient(135deg,#efe6d5_0_8px,#f4ede0_8px_16px)] font-mono text-[10.5px] text-ink/40"
						aria-hidden="true"
					>
						{m.temple_photo_label()}
					</div>
					<div class="px-[18px] pt-4 pb-[18px]">
						<div class="flex flex-wrap gap-1.5">
							<span
								class="rounded-full bg-gold/14 px-[9px] py-1 text-[10.5px] font-medium text-gold-deep"
							>
								{t.rank()}
							</span>
							<span
								class="rounded-full bg-sage/16 px-[9px] py-1 text-[10.5px] font-medium text-sage"
							>
								{t.sect()}
							</span>
						</div>
						<h2 class="mt-3 font-serif text-[22px]/snug">
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- locale-aware internal link -->
							<a href={localizeHref(`/temples/${t.id}`)} class="after:absolute after:inset-0">
								{t.name()}
							</a>
						</h2>
						<p class="mt-1 text-xs text-ink/50">{t.place()}</p>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="py-10 text-center text-sm text-ink/55">{m.filter_empty()}</p>
	{/if}
</div>
