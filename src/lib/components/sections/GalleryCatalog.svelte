<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import PhotoLightbox from '$lib/components/sections/PhotoLightbox.svelte';
	import type { GalleryFilter, GalleryPage } from '$lib/types/gallery';

	interface Props {
		/** Current page from the backend; `null` when it could not be loaded. */
		gallery: GalleryPage | null;
		/** Active type filter, or `null` for all. */
		filter: GalleryFilter | null;
	}

	let { gallery, filter }: Props = $props();

	/** Mosaic spans (desktop only); mobile is a plain 2-column grid. */
	const SPANS = ['md:col-span-2 md:row-span-2', '', 'md:row-span-2', '', 'md:col-span-2', ''];

	let open = $state<number | null>(null);

	const chips = $derived([
		{ id: null, label: m.gallery_tab_all(), href: localizeHref('/gallery') },
		{ id: 'temple', label: m.gallery_cat_temple(), href: '?type=temple' },
		{ id: 'statue', label: m.gallery_cat_statue(), href: '?type=statue' },
		{ id: 'festival', label: m.gallery_cat_festival(), href: '?type=festival' },
		{ id: 'life', label: m.gallery_cat_life(), href: '?type=life' }
	]);

	const chip =
		'inline-flex items-center gap-1.5 rounded-full border px-4 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-6">
	<PageHeader
		title={m.gallery_title()}
		subtitle={gallery ? m.gallery_page_sub({ count: gallery.total }) : undefined}
	/>

	<nav class="flex flex-wrap gap-2" aria-label={m.gallery_filter_label()}>
		{#each chips as c (c.id)}
			<a
				href={c.href}
				class="{chip} {filter === c.id
					? 'border-ink bg-ink text-cream'
					: 'border-ink/12 bg-paper text-ink/70 hover:bg-white'}"
				aria-current={filter === c.id ? 'true' : undefined}
			>
				{c.label}
			</a>
		{/each}
	</nav>

	{#if !gallery}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.gallery_load_error()}
		</p>
	{:else if gallery.items.length === 0}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.gallery_empty()}
		</p>
	{:else}
		<ul
			class="grid grid-flow-dense auto-rows-[170px] grid-cols-2 gap-3.5 md:auto-rows-[150px] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
		>
			{#each gallery.items as p, i (p.id)}
				<li class="min-h-0 {SPANS[i % SPANS.length]}">
					<button
						type="button"
						class="relative block size-full cursor-pointer overflow-hidden rounded-[20px] bg-sand text-left"
						aria-label={m.gallery_open({ name: p.title })}
						onclick={() => (open = i)}
					>
						<span
							class="absolute inset-x-0 top-0 bottom-[52px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)]"
						>
							<img
								src={p.thumbnail_url}
								alt=""
								loading={i < 2 ? 'eager' : 'lazy'}
								class="size-full object-cover"
							/>
						</span>
						<span
							data-keep-dark
							class="absolute inset-x-0 bottom-0 flex h-[52px] flex-col justify-center bg-ink px-3.5 text-[#f5eee0]"
						>
							<span class="truncate font-serif text-[17px]/tight">{p.title}</span>
							<span class="mt-0.5 truncate text-xs text-[#f5eee0]/70">{p.location}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
		<Pagination
			page={gallery.page}
			totalPages={gallery.total_pages}
			params={filter ? { type: filter } : {}}
		/>
	{/if}
</div>

<PhotoLightbox photos={gallery?.items ?? []} bind:index={open} />
