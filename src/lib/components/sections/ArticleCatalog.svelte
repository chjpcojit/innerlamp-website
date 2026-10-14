<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { formatArticleDate } from '$lib/utils/article';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import ArticleCover from '$lib/components/ui/ArticleCover.svelte';
	import type { ArticlePage, ArticleSummary } from '$lib/types/article';

	interface Props {
		/** Current page from the backend; `null` when it could not be loaded. */
		articles: ArticlePage | null;
	}

	let { articles }: Props = $props();

	/** The backend puts its featured articles first, so page 1 leads with a large card. */
	const featured = $derived(articles && articles.page === 1 ? articles.items[0] : undefined);
	const rest = $derived(
		articles ? (featured ? articles.items.slice(1) : articles.items) : ([] as ArticleSummary[])
	);

	const href = (a: ArticleSummary) => localizeHref(`/articles/${encodeURIComponent(a.id)}`);
	const meta = (a: ArticleSummary) =>
		[
			a.author,
			m.article_read_minutes({ minutes: a.read_minutes }),
			formatArticleDate(a.published_date)
		]
			.filter(Boolean)
			.join(' · ');
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-7">
	<PageHeader
		title={m.articles_title()}
		subtitle={articles ? m.articles_page_sub({ count: articles.total }) : undefined}
	/>

	{#if !articles}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.articles_load_error()}
		</p>
	{:else if articles.items.length === 0}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.articles_empty()}
		</p>
	{:else}
		{#if featured}
			<article
				class="flex flex-wrap items-center gap-8 rounded-[28px] border border-ink/8 bg-paper p-4"
			>
				<div class="min-w-0 flex-[1.3_1_320px]">
					<ArticleCover
						src={featured.image_url}
						fallback={featured.thumbnail_url}
						ratio="aspect-16/10 rounded-[20px]"
						eager
					/>
				</div>
				<div class="min-w-0 flex-[1_1_280px] p-2 sm:pr-4">
					<p class="text-[10.5px] font-semibold tracking-[.14em] text-gold-deep">
						{m.articles_featured()} · {featured.category}
					</p>
					<h2 class="mt-3 font-serif text-[clamp(28px,5.6vw,38px)]/tight text-pretty">
						<a href={href(featured)} class="hover:underline">{featured.title}</a>
					</h2>
					<p class="mt-3.5 text-[15px]/relaxed text-pretty text-ink/65">{featured.summary}</p>
					<p class="mt-4 text-xs text-ink/50">{meta(featured)}</p>
				</div>
			</article>
		{/if}

		{#if rest.length}
			<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-6 gap-y-8">
				{#each rest as a (a.id)}
					<li>
						<article class="flex flex-col">
							<ArticleCover src={a.thumbnail_url} fallback={a.image_url} ratio="aspect-4/3" />
							<p class="mt-3.5 text-[10.5px] font-semibold tracking-[.14em] text-gold-deep">
								{a.category}
							</p>
							<h2 class="mt-1.5 font-serif text-[22px]/snug text-pretty">
								<a href={href(a)} class="hover:underline">{a.title}</a>
							</h2>
							<p class="mt-2 line-clamp-3 text-[13px]/relaxed text-pretty text-ink/60">
								{a.summary}
							</p>
							<p class="mt-2.5 text-xs text-ink/50">{meta(a)}</p>
						</article>
					</li>
				{/each}
			</ul>
		{/if}

		<Pagination page={articles.page} totalPages={articles.total_pages} />
	{/if}
</div>
