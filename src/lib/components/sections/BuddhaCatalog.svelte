<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { BUDDHA_LIST, type BuddhaGroup } from '$lib/content/buddhas';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';

	let group = $state<BuddhaGroup | null>(null);

	const options = $derived([
		{ id: 'buddha' as const, label: m.buddhas_tab_buddhas() },
		{ id: 'bodhisattva' as const, label: m.buddhas_tab_bodhisattvas() }
	]);
	const visible = $derived(BUDDHA_LIST.filter((b) => !group || b.group === group));
</script>

<div class="flex flex-col gap-6">
	<PageHeader title={m.buddhas_title()} subtitle={m.buddhas_page_sub({ count: visible.length })} />
	<FilterChips
		{options}
		bind:value={group}
		allLabel={m.buddhas_tab_all()}
		label={m.buddhas_filter_label()}
	/>
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-5">
		{#each visible as b (b.id)}
			<li class="overflow-hidden rounded-[22px] border border-ink/8 bg-paper">
				<div class="relative h-60 bg-linear-to-b from-sand to-sand-deep" aria-hidden="true">
					<span
						class="absolute top-3 left-3 rounded-full bg-night/60 px-2.5 py-1 text-[10.5px] font-medium text-[#f7f1e4]"
					>
						{b.kind()}
					</span>
					<span
						class="absolute inset-x-0 bottom-[18%] mx-auto block h-16 w-11 rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-linear-to-b from-amber-light to-amber opacity-80 shadow-[0_0_36px_rgba(217,150,60,.7)]"
					></span>
				</div>
				<div class="px-[18px] pt-4 pb-[18px]">
					<h2 class="font-serif text-[22px]/snug text-pretty">{b.name()}</h2>
					<p class="mt-1.5 text-xs/normal text-pretty text-ink/55">{b.role()}</p>
					<p class="mt-2.5 text-xs font-medium text-gold-deep">{m.buddha_via({ date: b.via })}</p>
				</div>
			</li>
		{/each}
	</ul>
</div>
