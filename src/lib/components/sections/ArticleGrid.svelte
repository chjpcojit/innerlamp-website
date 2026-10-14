<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { ARTICLES } from '$lib/content/home';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import ArticleCover from '$lib/components/ui/ArticleCover.svelte';
	import type { ArticleSummary } from '$lib/types/article';

	interface Props {
		/** Featured articles from the backend; when null/omitted the static catalogue is shown. */
		items?: ArticleSummary[] | null;
	}

	let { items = null }: Props = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<section id="articles" class="scroll-mt-24" aria-labelledby="articles-title">
	<SectionHeading id="articles-title" title={m.articles_title()} href="/articles" icon="article" />
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
		{#if items?.length}
			{#each items as a (a.id)}
				<li>
					<ArticleCover src={a.thumbnail_url} fallback={a.image_url} ratio="aspect-square" />
					<p class="mt-3.5 text-[10.5px] font-semibold tracking-[.12em] text-gold-deep">
						{a.category}
					</p>
					<h3 class="mt-1.5 font-serif text-lg/[1.4]">
						<a href={localizeHref(`/articles/${encodeURIComponent(a.id)}`)} class="hover:underline">
							{a.title}
						</a>
					</h3>
					<p class="mt-2 text-xs text-ink/50">
						{a.author} · {m.article_read_minutes({ minutes: a.read_minutes })}
					</p>
				</li>
			{/each}
		{:else}
			{#each ARTICLES as a (a.title())}
				<li>
					<div
						class="flex aspect-square items-center justify-center rounded-[18px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] font-mono text-[10.5px] text-ink/40"
						aria-hidden="true"
					>
						{m.article_photo_label()}
					</div>
					<p class="mt-3.5 text-[10.5px] font-semibold tracking-[.12em] text-gold-deep">
						{a.category()}
					</p>
					<h3 class="mt-1.5 font-serif text-lg/[1.4]">{a.title()}</h3>
					<p class="mt-2 text-xs text-ink/50">{a.meta()}</p>
				</li>
			{/each}
		{/if}
	</ul>
</section>
