<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import TempleDetail from '$lib/components/sections/TempleDetail.svelte';

	let { data }: PageProps = $props();

	const description = $derived(
		m.temple_d_meta_description({
			name: data.temple.name,
			place: data.temple.location.province
		})
	);
</script>

<svelte:head>
	<title>{data.temple.name} · {m.app_name()}</title>
	<meta name="description" content={description} />
</svelte:head>

{#key data.temple.id}
	<TempleDetail
		temple={data.temple}
		events={data.events}
		sanghaTemple={data.sanghaTemple}
		isGuest={!data.user}
	/>
{/key}
