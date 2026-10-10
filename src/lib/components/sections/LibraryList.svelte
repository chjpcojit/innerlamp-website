<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import {
		CATEGORY_HREF,
		LIBRARY_CATEGORIES,
		LIBRARY_ITEMS,
		type LibraryCategory
	} from '$lib/content/library';

	interface Props {
		query: string;
		active: LibraryCategory | null;
	}

	let { query, active }: Props = $props();

	const needle = $derived(query.trim().toLocaleLowerCase());
	const visible = $derived(
		LIBRARY_ITEMS.filter(
			(i) =>
				(!active || i.category === active) &&
				(!needle || `${i.title()} ${i.sub()}`.toLocaleLowerCase().includes(needle))
		)
	);
	const heading = $derived(
		active ? (LIBRARY_CATEGORIES.find((c) => c.id === active)?.label() ?? '') : m.lib_all_content()
	);
</script>

<section aria-labelledby="library-list-title">
	<h2 id="library-list-title" class="mb-3.5 font-serif text-2xl">{heading}</h2>
	{#if visible.length}
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3.5">
			{#each visible as item (item.title())}
				<li>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- target routes are not built yet -->
					<a
						href={localizeHref(CATEGORY_HREF[item.category])}
						class="flex items-center gap-3.5 rounded-[20px] border border-ink/8 bg-paper px-[18px] py-4 transition-colors hover:bg-white"
					>
						<Icon kind={item.icon} tone={item.tone} tint={item.tint} size={46} />
						<span class="min-w-0 flex-1">
							<span class="block text-[14.5px] font-medium">{item.title()}</span>
							<span class="mt-[3px] block text-xs text-ink/50">{item.sub()}</span>
						</span>
						<span class="text-xs font-medium whitespace-nowrap text-ink/50">{item.duration()}</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>
	{:else}
		<p
			class="rounded-[20px] border border-ink/8 bg-paper px-5 py-8 text-center text-sm text-ink/50"
			role="status"
		>
			{m.lib_empty()}
		</p>
	{/if}
</section>
