<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { formatArticleDate } from '$lib/utils/article';
	import ArticleCover from '$lib/components/ui/ArticleCover.svelte';
	import type { ArticleDetail } from '$lib/types/article';

	interface Props {
		article: ArticleDetail;
	}

	let { article }: Props = $props();

	const meta = $derived(
		[
			article.author,
			m.article_read_minutes({ minutes: article.read_minutes }),
			formatArticleDate(article.published_date)
		]
			.filter(Boolean)
			.join(' · ')
	);
	/** Only follow http(s) links from the source; anything else is shown as plain text. */
	const sourceHref = $derived(/^https?:\/\//i.test(article.source_url) ? article.source_url : null);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<article class="mx-auto flex max-w-[720px] flex-col gap-6" lang={article.language}>
	<a href={localizeHref('/articles')} class="text-[13px] font-medium text-ink/60 hover:underline">
		← {m.article_back()}
	</a>

	<header>
		<p class="text-[10.5px] font-semibold tracking-[.14em] text-gold-deep">{article.category}</p>
		<h1 class="mt-3 font-serif text-[clamp(30px,6vw,44px)]/tight text-pretty">{article.title}</h1>
		<p class="mt-3 text-[13px] text-ink/55">{meta}</p>
	</header>

	<ArticleCover
		src={article.image_url}
		fallback={article.thumbnail_url}
		ratio="aspect-16/9 rounded-[22px]"
		eager
	/>

	<p class="text-[17px]/relaxed text-pretty text-ink/75">{article.summary}</p>

	{#if article.body_paragraphs.length}
		<div class="flex flex-col gap-4 text-[16px]/[1.8] text-pretty text-ink/80">
			{#each article.body_paragraphs as paragraph, i (i)}
				<p>{paragraph}</p>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-ink/55">{m.article_no_body()}</p>
	{/if}

	{#if article.quote}
		<blockquote class="rounded-[22px] border border-ink/8 bg-paper p-[22px]">
			<p class="font-serif text-[22px]/snug text-pretty">“{article.quote}”</p>
			{#if article.quote_source}
				<footer class="mt-3 text-xs text-ink/55">— {article.quote_source}</footer>
			{/if}
		</blockquote>
	{/if}

	{#if article.tags.length}
		<ul class="flex flex-wrap gap-2" aria-label={m.article_tags_label()}>
			{#each article.tags as tag (tag)}
				<li
					class="rounded-full border border-ink/12 bg-paper px-3.5 py-1.5 text-[12.5px] text-ink/70"
				>
					{tag}
				</li>
			{/each}
		</ul>
	{/if}

	<footer
		class="rounded-[22px] border border-ink/8 bg-paper p-[22px] text-[13px]/relaxed text-ink/65"
	>
		<p>{m.article_summary_notice()}</p>
		{#if article.source_name || sourceHref}
			<p class="mt-2">
				{m.article_source_label()}:
				{#if sourceHref}
					<a
						href={sourceHref}
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-ink underline"
					>
						{article.source_name || m.article_read_original()}
					</a>
				{:else}
					{article.source_name}
				{/if}
			</p>
		{/if}
	</footer>
</article>
