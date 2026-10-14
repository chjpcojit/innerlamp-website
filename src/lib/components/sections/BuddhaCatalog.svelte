<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import type { DeityFilter, DeityPage } from '$lib/types/deity';

	interface Props {
		/** Current page from the backend; `null` when it could not be loaded. */
		deities: DeityPage | null;
		/** Active type filter, or `null` for all. */
		filter: DeityFilter | null;
	}

	let { deities, filter }: Props = $props();

	const chips = $derived([
		{ id: null, label: m.buddhas_tab_all(), href: localizeHref('/library/buddhas') },
		{ id: 'buddha', label: m.buddhas_tab_buddhas(), href: '?type=buddha' },
		{ id: 'bodhisattva', label: m.buddhas_tab_bodhisattvas(), href: '?type=bodhisattva' }
	]);

	const chip =
		'inline-flex items-center gap-1.5 rounded-full border px-4 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors';

	const kindLabel = (type: string) =>
		type === 'BUDDHA'
			? m.buddha_kind_buddha()
			: type === 'BODHISATTVA'
				? m.buddha_kind_bodhisattva()
				: m.buddha_kind_deva();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-6">
	<PageHeader
		title={m.buddhas_title()}
		subtitle={deities ? m.buddhas_page_sub({ count: deities.total }) : undefined}
	/>

	<nav class="flex flex-wrap gap-2" aria-label={m.buddhas_filter_label()}>
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

	{#if !deities}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.buddhas_load_error()}
		</p>
	{:else if deities.items.length === 0}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.buddhas_empty()}
		</p>
	{:else}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-5">
			{#each deities.items as d (d.id)}
				<li
					class="relative overflow-hidden rounded-[22px] border border-ink/8 bg-paper transition-shadow focus-within:ring-2 focus-within:ring-gold/60 hover:shadow-md"
				>
					<div class="relative h-60 bg-linear-to-b from-sand to-sand-deep">
						{#if d.thumbnail_url}
							<img
								src={d.thumbnail_url}
								alt={d.name_vi}
								loading="lazy"
								class="absolute inset-0 size-full object-cover"
							/>
						{/if}
						<span
							class="absolute top-3 left-3 rounded-full bg-night/60 px-2.5 py-1 text-[10.5px] font-medium text-[#f7f1e4]"
						>
							{kindLabel(d.type)}
						</span>
					</div>
					<div class="px-[18px] pt-4 pb-[18px]">
						<h2 class="font-serif text-[22px]/snug text-pretty">
							<a
								href={localizeHref(`/library/buddhas/${encodeURIComponent(d.id)}`)}
								class="after:absolute after:inset-0">{d.name_vi}</a
							>
						</h2>
						{#if d.core_virtue}
							<p class="mt-1.5 line-clamp-3 text-xs/normal text-pretty text-ink/55">
								{d.core_virtue}
							</p>
						{/if}
						{#if d.pure_land}
							<p class="mt-2.5 text-xs font-medium text-gold-deep">{d.pure_land}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		<Pagination
			page={deities.page}
			totalPages={deities.total_pages}
			params={filter ? { type: filter } : {}}
		/>
	{/if}
</div>
