<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import TalkCatalog from '$lib/components/sections/TalkCatalog.svelte';
</script>

<svelte:head>
	<title>{m.talks_title()} · {m.app_name()}</title>
	<meta name="description" content={m.talks_meta_description()} />
</svelte:head>

<TalkCatalog />
