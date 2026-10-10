<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { findTemple } from '$lib/content/temples';
	import TempleDetail from '$lib/components/sections/TempleDetail.svelte';

	let { data }: PageProps = $props();

	const temple = $derived(findTemple(data.id)!);
</script>

<svelte:head>
	<title>{temple.name()} · {m.app_name()}</title>
	<meta
		name="description"
		content={m.temple_d_meta_description({ name: temple.name(), place: temple.place() })}
	/>
</svelte:head>

{#key temple.id}
	<TempleDetail {temple} />
{/key}
