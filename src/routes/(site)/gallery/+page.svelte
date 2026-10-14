<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import GalleryCatalog from '$lib/components/sections/GalleryCatalog.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.gallery_title()} · {m.app_name()}</title>
	<meta name="description" content={m.gallery_meta_description()} />
</svelte:head>

<GalleryCatalog gallery={data.gallery} filter={data.filter} />
