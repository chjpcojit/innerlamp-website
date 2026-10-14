<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import TempleCatalog from '$lib/components/sections/TempleCatalog.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.temples_title()} · {m.app_name()}</title>
	<meta name="description" content={m.temples_meta_description()} />
</svelte:head>

<TempleCatalog temples={data.temples} />
