<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { TALK_LIST, TALK_TOPICS, type TalkTopic } from '$lib/content/talks';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';

	let topic = $state<TalkTopic | null>(null);

	const options = $derived(TALK_TOPICS.map((t) => ({ id: t.id, label: t.label() })));
	const visible = $derived(TALK_LIST.filter((t) => !topic || t.topic === topic));
</script>

<div class="flex flex-col gap-7">
	<PageHeader title={m.talks_title()} subtitle={m.talks_page_sub({ count: visible.length })} />
	<FilterChips
		{options}
		bind:value={topic}
		allLabel={m.talks_tab_all()}
		label={m.talks_filter_label()}
	/>
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-3.5">
		{#each visible as t (t.id)}
			<li>
				<article
					class="flex items-center gap-4 rounded-[20px] border border-ink/8 bg-paper p-3.5 transition-colors hover:bg-white"
				>
					<div
						class="flex size-18 flex-none items-center justify-center rounded-[14px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] font-mono text-[10px] text-ink/40"
						aria-hidden="true"
					>
						{m.photo_label()}
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-[10.5px] font-semibold tracking-[.14em] text-gold-deep">
							{t.topicLabel()}
						</p>
						<h2 class="mt-1 font-serif text-lg/snug text-pretty">{t.title()}</h2>
						<p class="mt-1 text-xs text-ink/50">
							{t.speaker()} · {m.talk_listens({ plays: t.plays })}
						</p>
					</div>
					<p class="pr-1.5 text-xs font-medium whitespace-nowrap text-ink/50">
						{m.lib_dur_minutes({ count: t.minutes })}
					</p>
				</article>
			</li>
		{:else}
			<li class="col-span-full py-10 text-center text-sm text-ink/55">{m.filter_empty()}</li>
		{/each}
	</ul>
</div>
