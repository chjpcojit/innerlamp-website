<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import TalkRow from '$lib/components/ui/TalkRow.svelte';
	import type { DharmaTalkPage } from '$lib/types/dharma-talk';

	interface Props {
		/** Current page from the backend; `null` when it could not be loaded. */
		talks: DharmaTalkPage | null;
	}

	let { talks }: Props = $props();

	const notice = 'rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60';
</script>

<div class="flex flex-col gap-7">
	<PageHeader
		title={m.talks_title()}
		subtitle={talks ? m.talks_page_sub({ count: talks.total }) : undefined}
	/>

	{#if !talks}
		<p class={notice}>{m.talks_load_error()}</p>
	{:else if talks.items.length === 0}
		<p class={notice}>{m.talks_empty()}</p>
	{:else}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-3.5">
			{#each talks.items as t (t.id)}
				<li><TalkRow talk={t} /></li>
			{/each}
		</ul>
		<Pagination page={talks.page} totalPages={talks.total_pages} />
	{/if}
</div>
