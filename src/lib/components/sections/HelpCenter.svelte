<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { HELP_CATEGORIES, HELP_FAQ, type HelpCategory } from '$lib/content/help';
	import { fold } from '$lib/utils/text';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';

	let query = $state('');
	let category = $state<HelpCategory | null>(null);
	/** Open question, tied to the filter it was opened under (the first one starts open). */
	let opened = $state<{ id: number; filter: string } | null>({ id: HELP_FAQ[0].id, filter: '|' });

	const options = HELP_CATEGORIES.map((c) => ({ id: c.id, label: c.label() }));
	const needle = $derived(fold(query.trim()));
	const filterKey = $derived(`${needle}|${category ?? ''}`);
	// Changing the search or topic collapses any open answer (prototype `hpOpen: -1`).
	const openId = $derived(opened?.filter === filterKey ? opened.id : null);
	const visible = $derived(
		HELP_FAQ.filter(
			(f) =>
				(!category || f.category === category) &&
				(!needle || fold(`${f.question()} ${f.answer()}`).includes(needle))
		)
	);

	const catLabel = (id: HelpCategory) => HELP_CATEGORIES.find((c) => c.id === id)?.label() ?? '';
</script>

<div class="mx-auto flex w-full max-w-[880px] flex-col gap-7">
	<header class="flex flex-col items-center gap-3 text-center">
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-gold-deep">{m.help_eyebrow()}</p>
		<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.15] font-medium text-pretty">
			{m.help_title()}
		</h1>
		<div class="mt-2 flex w-full justify-center [&>label]:h-[52px] [&>label]:w-[min(100%,520px)]">
			<SearchField
				bind:value={query}
				label={m.help_search_label()}
				placeholder={m.help_search_placeholder()}
			/>
		</div>
	</header>

	<div class="flex justify-center">
		<FilterChips
			{options}
			bind:value={category}
			allLabel={m.help_cat_all()}
			label={m.help_cats_label()}
		/>
	</div>

	<section class="overflow-hidden rounded-[22px] border border-ink/8 bg-paper">
		{#if visible.length}
			<ul>
				{#each visible as f (f.id)}
					{@const open = openId === f.id}
					<li class="border-b border-ink/7 last:border-b-0">
						<h2>
							<button
								type="button"
								aria-expanded={open}
								aria-controls="help-a-{f.id}"
								onclick={() => (opened = open ? null : { id: f.id, filter: filterKey })}
								class="flex w-full cursor-pointer items-center gap-4 px-6 py-[18px] text-left transition-colors hover:bg-white"
							>
								<span class="min-w-0 flex-1">
									<span
										class="block text-[10.5px] font-semibold tracking-[.12em] text-ink/42 uppercase"
									>
										{catLabel(f.category)}
									</span>
									<span class="mt-1 block text-[15px]/[1.45] font-medium text-pretty">
										{f.question()}
									</span>
								</span>
								<span
									class="flex size-7 flex-none items-center justify-center rounded-full bg-ink/5 text-lg/none text-gold-deep"
									aria-hidden="true"
								>
									{open ? '−' : '+'}
								</span>
							</button>
						</h2>
						{#if open}
							<p
								id="help-a-{f.id}"
								class="max-w-[680px] px-6 pb-5 text-sm/[1.7] text-pretty text-ink/72"
							>
								{f.answer()}
							</p>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="px-6 py-8 text-center text-sm text-ink/55" role="status">
				{m.help_empty({ query: query.trim() })}
			</p>
		{/if}
	</section>

	<section
		class="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-sand p-[clamp(22px,4vw,32px)]"
	>
		<div>
			<h2 class="font-serif text-[22px] font-medium">{m.help_cta_title()}</h2>
			<p class="mt-1 text-[13px] text-ink/60">{m.help_cta_text()}</p>
		</div>
		<Button href="/contact">{m.help_cta_button()}</Button>
	</section>
</div>
