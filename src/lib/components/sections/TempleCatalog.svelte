<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { templeRankLabel, templeSectLabel } from '$lib/utils/temple-labels';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import type { TemplePage } from '$lib/types/temple';

	interface Props {
		/** Current page from the backend; `null` when it could not be loaded. */
		temples: TemplePage | null;
	}

	let { temples }: Props = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-7">
	<PageHeader
		title={m.temples_title()}
		subtitle={temples ? m.temples_page_sub({ count: temples.total }) : undefined}
	/>
	{#if !temples}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.temples_load_error()}
		</p>
	{:else if temples.items.length === 0}
		<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
			{m.temples_empty()}
		</p>
	{:else}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
			{#each temples.items as t (t.id)}
				{@const rank = templeRankLabel(t.heritage_rank)}
				{@const sect = templeSectLabel(t.sect)}
				<li
					class="relative overflow-hidden rounded-[22px] border border-ink/8 bg-paper transition-colors focus-within:bg-white hover:bg-white"
				>
					<div
						class="relative h-40 bg-[repeating-linear-gradient(135deg,#efe6d5_0_8px,#f4ede0_8px_16px)]"
					>
						{#if t.thumbnail_url}
							<img
								src={t.thumbnail_url}
								alt=""
								loading="lazy"
								class="absolute inset-0 size-full object-cover"
							/>
						{:else}
							<span
								class="absolute inset-0 flex items-center justify-center font-mono text-[10.5px] text-ink/40"
								aria-hidden="true">{m.temple_photo_label()}</span
							>
						{/if}
					</div>
					<div class="px-[18px] pt-4 pb-[18px]">
						{#if rank || sect}
							<div class="flex flex-wrap gap-1.5">
								{#if rank}
									<span
										class="rounded-full bg-gold/14 px-[9px] py-1 text-[10.5px] font-medium text-gold-deep"
									>
										{rank}
									</span>
								{/if}
								{#if sect}
									<span
										class="rounded-full bg-sage/16 px-[9px] py-1 text-[10.5px] font-medium text-sage"
									>
										{sect}
									</span>
								{/if}
							</div>
						{/if}
						<h2 class="mt-3 font-serif text-[22px]/snug">
							<a
								href={localizeHref(`/temples/${encodeURIComponent(t.id)}`)}
								class="after:absolute after:inset-0">{t.name}</a
							>
						</h2>
						<p class="mt-1 text-xs text-ink/50">{t.location.province}</p>
					</div>
				</li>
			{/each}
		</ul>
		<Pagination page={temples.page} totalPages={temples.total_pages} />
	{/if}
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
