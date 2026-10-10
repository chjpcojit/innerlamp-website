<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import GalleryCatalog from '$lib/components/sections/GalleryCatalog.svelte';
</script>

<svelte:head>
	<title>{m.gallery_title()} · {m.app_name()}</title>
	<meta name="description" content={m.gallery_meta_description()} />
</svelte:head>

<GalleryCatalog />
