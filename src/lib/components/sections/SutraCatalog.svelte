<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import SutraCover from '$lib/components/ui/SutraCover.svelte';
	import type { SutraFilter, SutraPage } from '$lib/types/sutra';
	import { sutraMeta } from '$lib/utils/sutra';

	interface Props {
		/** Current page from the backend; `null` when it could not be loaded. */
		sutras: SutraPage | null;
		/** Active filter, or `null` for all. */
		filter: SutraFilter | null;
	}

	let { sutras, filter }: Props = $props();

	const chips = $derived([
		{ id: null, label: m.sutras_tab_all(), href: localizeHref('/library/sutras') },
		{ id: 'mahayana', label: m.sutras_tab_mahayana(), href: '?filter=mahayana' },
		{ id: 'theravada', label: m.sutras_tab_theravada(), href: '?filter=theravada' },
		{ id: 'vajrayana', label: m.sutras_tab_vajrayana(), href: '?filter=vajrayana' },
		{ id: 'daily', label: m.sutras_tab_daily(), href: '?filter=daily' }
	]);

	const chip =
		'inline-flex items-center gap-1.5 rounded-full border px-4 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors';
	const notice = 'rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-7">
	<PageHeader
		title={m.sutras_title()}
		subtitle={sutras ? m.sutras_page_sub({ count: sutras.total }) : undefined}
	/>

	<nav class="flex flex-wrap gap-2" aria-label={m.sutras_filter_label()}>
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

	{#if !sutras}
		<p class={notice}>{m.sutras_load_error()}</p>
	{:else if sutras.items.length === 0}
		<p class={notice}>{m.sutras_empty()}</p>
	{:else}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-x-[22px] gap-y-8">
			{#each sutras.items as s (s.id)}
				<li>
					<article>
						<a
							href={localizeHref(`/library/sutras/${encodeURIComponent(s.id)}`)}
							class="block rounded-[18px] transition-transform hover:-translate-y-0.5"
						>
							<SutraCover sutra={s} titleTag="h2" />
						</a>
						{#if s.summary}
							<p class="mt-3 line-clamp-3 text-xs/[1.55] text-pretty text-ink/62">{s.summary}</p>
						{/if}
						{#if sutraMeta(s)}
							<p class="mt-2 text-xs font-medium text-ink/45">{sutraMeta(s)}</p>
						{/if}
					</article>
				</li>
			{/each}
		</ul>
		<Pagination
			page={sutras.page}
			totalPages={sutras.total_pages}
			params={filter ? { filter } : {}}
		/>
	{/if}
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
