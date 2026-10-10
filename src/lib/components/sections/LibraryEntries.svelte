<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { LIBRARY_ENTRIES } from '$lib/content/library';
</script>

<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
	{#each LIBRARY_ENTRIES as e (e.href)}
		<li>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- target routes are not built yet -->
			<a
				href={localizeHref(e.href)}
				class="flex items-center gap-3.5 rounded-[22px] border border-ink/8 bg-paper p-5 transition-colors hover:bg-white"
			>
				<Icon kind={e.icon} tone={e.tone} tint={e.tint} size={44} />
				<span class="min-w-0 flex-1">
					<span class="block font-serif text-[21px]">{e.title()}</span>
					<span class="mt-[3px] block text-[12.5px] text-ink/50">{e.sub()}</span>
				</span>
				<span class="text-lg text-ink/35" aria-hidden="true">›</span>
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</li>
	{/each}
</ul>
