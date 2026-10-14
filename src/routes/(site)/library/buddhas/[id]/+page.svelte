<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import BuddhaDetail from '$lib/components/sections/BuddhaDetail.svelte';

	let { data }: PageProps = $props();

	const description = $derived(
		data.deity.core_virtue || data.deity.biography_summary || m.buddhas_meta_description()
	);
</script>

<svelte:head>
	<title>{data.deity.name_vi} · {m.app_name()}</title>
	<meta name="description" content={description} />
</svelte:head>

<BuddhaDetail deity={data.deity} />
