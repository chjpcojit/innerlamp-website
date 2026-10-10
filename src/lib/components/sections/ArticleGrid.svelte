<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { ARTICLES } from '$lib/content/home';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
</script>

<section id="articles" class="scroll-mt-24" aria-labelledby="articles-title">
	<SectionHeading id="articles-title" title={m.articles_title()} href="/articles" icon="article" />
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
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
	</ul>
</section>
