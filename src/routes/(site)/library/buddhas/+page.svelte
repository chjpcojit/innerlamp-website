<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import BuddhaCatalog from '$lib/components/sections/BuddhaCatalog.svelte';
</script>

<svelte:head>
	<title>{m.buddhas_title()} · {m.app_name()}</title>
	<meta name="description" content={m.buddhas_meta_description()} />
</svelte:head>

<BuddhaCatalog />
