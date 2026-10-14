<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import SutraCatalog from '$lib/components/sections/SutraCatalog.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.sutras_title()} · {m.app_name()}</title>
	<meta name="description" content={m.sutras_meta_description()} />
</svelte:head>

<SutraCatalog sutras={data.sutras} filter={data.filter} />
