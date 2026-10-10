<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import HelpCenter from '$lib/components/sections/HelpCenter.svelte';
</script>

<svelte:head>
	<title>{m.help_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.help_meta_description()} />
</svelte:head>

<HelpCenter />
