<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { LibraryCategory } from '$lib/content/library';
	import LibraryFilters from '$lib/components/sections/LibraryFilters.svelte';
	import LibraryFeatured from '$lib/components/sections/LibraryFeatured.svelte';
	import LibraryEntries from '$lib/components/sections/LibraryEntries.svelte';
	import LibraryList from '$lib/components/sections/LibraryList.svelte';
	import BuddhaGrid from '$lib/components/sections/BuddhaGrid.svelte';

	let query = $state('');
	let active = $state<LibraryCategory | null>(null);
</script>

<svelte:head>
	<title>{m.lib_title()} · {m.app_name()}</title>
	<meta name="description" content={m.lib_description()} />
</svelte:head>

<div class="flex flex-col gap-8">
	<LibraryFilters bind:query bind:active />
	<LibraryFeatured />
	<LibraryEntries />
	<BuddhaGrid title={m.lib_buddhas_title()} />
	<LibraryList {query} {active} />
</div>
