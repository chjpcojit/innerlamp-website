<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { PHOTO_CATEGORIES, PHOTO_LIST, type PhotoCategory } from '$lib/content/photos';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';
	import PhotoLightbox from '$lib/components/sections/PhotoLightbox.svelte';

	/** Mosaic spans (desktop only); mobile is a plain 2-column grid. */
	const SPANS = ['md:col-span-2 md:row-span-2', '', 'md:row-span-2', '', 'md:col-span-2', ''];

	let category = $state<PhotoCategory | null>(null);
	let open = $state<number | null>(null);

	const options = $derived(
		PHOTO_CATEGORIES.map((c) => ({
			id: c.id,
			label: c.label(),
			count: PHOTO_LIST.filter((p) => p.category === c.id).length
		}))
	);
	const visible = $derived(PHOTO_LIST.filter((p) => !category || p.category === category));
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title={m.gallery_title()}
		subtitle={m.gallery_page_sub({ count: PHOTO_LIST.length })}
	/>
	<FilterChips
		{options}
		bind:value={category}
		allLabel={m.gallery_tab_all()}
		allCount={PHOTO_LIST.length}
		label={m.gallery_filter_label()}
	/>
	<ul
		class="grid grid-flow-dense auto-rows-[170px] grid-cols-2 gap-3.5 md:auto-rows-[150px] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
	>
		{#each visible as p, i (p.id)}
			<li class="min-h-0 {SPANS[i % SPANS.length]}">
				<button
					type="button"
					class="relative block size-full cursor-pointer overflow-hidden rounded-[20px] bg-sand text-left"
					aria-label={m.gallery_open({ name: p.name() })}
					onclick={() => (open = PHOTO_LIST.indexOf(p))}
				>
					<span
						class="absolute inset-x-0 top-0 bottom-[52px] flex items-center justify-center bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] font-mono text-[10.5px] text-ink/40"
						aria-hidden="true"
					>
						{m.photo_label()}
					</span>
					<span
						data-keep-dark
						class="absolute inset-x-0 bottom-0 flex h-[52px] flex-col justify-center bg-ink px-3.5 text-[#f5eee0]"
					>
						<span class="truncate font-serif text-[17px]/tight">{p.name()}</span>
						<span class="mt-0.5 truncate text-xs text-[#f5eee0]/70">{p.place()}</span>
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<PhotoLightbox photos={PHOTO_LIST} bind:index={open} />
