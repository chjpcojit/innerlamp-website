<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { ARTICLE_CATEGORIES, ARTICLE_LIST, type ArticleCategory } from '$lib/content/articles';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';

	let category = $state<ArticleCategory | null>(null);

	const options = $derived(ARTICLE_CATEGORIES.map((c) => ({ id: c.id, label: c.label() })));
	const visible = $derived(ARTICLE_LIST.filter((a) => !category || a.category === category));
	const featured = $derived(visible[0]);
	const rest = $derived(visible.slice(1));
	const formatDate = $derived((iso: string) =>
		new Date(`${iso}T00:00:00`).toLocaleDateString(getLocale(), {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
	);
</script>

{#snippet cover(ratio: string)}
	<div
		class="flex items-center justify-center rounded-[18px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] font-mono text-[10.5px] text-ink/40 {ratio}"
		aria-hidden="true"
	>
		{m.article_photo_label()}
	</div>
{/snippet}

<div class="flex flex-col gap-7">
	<PageHeader
		title={m.articles_title()}
		subtitle={m.articles_page_sub({ count: visible.length })}
	/>
	<FilterChips
		{options}
		bind:value={category}
		allLabel={m.articles_tab_all()}
		label={m.articles_filter_label()}
	/>

	{#if featured}
		<article
			class="flex flex-wrap items-center gap-8 rounded-[28px] border border-ink/8 bg-paper p-4"
		>
			<div class="min-w-0 flex-[1.3_1_320px]">
				{@render cover('aspect-16/10 rounded-[20px]')}
			</div>
			<div class="min-w-0 flex-[1_1_280px] p-2 sm:pr-4">
				<p class="text-[10.5px] font-semibold tracking-[.14em] text-gold-deep">
					{m.articles_featured()} · {featured.categoryLabel()}
				</p>
				<h2 class="mt-3 font-serif text-[clamp(28px,5.6vw,38px)]/tight text-pretty">
					{featured.title()}
				</h2>
				<p class="mt-3.5 text-[15px]/relaxed text-pretty text-ink/65">{featured.excerpt()}</p>
				<p class="mt-4 text-xs text-ink/50">{featured.meta()} · {formatDate(featured.date)}</p>
			</div>
		</article>
	{:else}
		<p class="py-10 text-center text-sm text-ink/55">{m.filter_empty()}</p>
	{/if}

	{#if rest.length}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-6 gap-y-8">
			{#each rest as a (a.id)}
				<li>
					<article class="flex flex-col">
						{@render cover('aspect-4/3')}
						<p class="mt-3.5 text-[10.5px] font-semibold tracking-[.14em] text-gold-deep">
							{a.categoryLabel()}
						</p>
						<h2 class="mt-1.5 font-serif text-[22px]/snug text-pretty">{a.title()}</h2>
						<p class="mt-2 text-[13px]/relaxed text-pretty text-ink/60">{a.excerpt()}</p>
						<p class="mt-2.5 text-xs text-ink/50">{a.meta()}</p>
					</article>
				</li>
			{/each}
		</ul>
	{/if}
</div>
