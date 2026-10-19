<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import EventDetail from '$lib/components/sections/EventDetail.svelte';

	let { data }: PageProps = $props();

	const description = $derived(data.detail.event.short_description || m.ev_meta_description());
</script>

<svelte:head>
	<title>{data.detail.event.name} · {m.app_name()}</title>
	<meta name="description" content={description} />
</svelte:head>

{#key `${data.detail.event.code}-${data.detail.solar_date}`}
	<EventDetail detail={data.detail} />
{/key}
