<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { sutraTitle } from '$lib/utils/sutra';
	import SutraDetail from '$lib/components/sections/SutraDetail.svelte';

	let { data }: PageProps = $props();

	const locale = $derived(getLocale());
	const title = $derived(sutraTitle(data.sutra.titles, locale));
</script>

<svelte:head>
	<title>{title} · {m.app_name()}</title>
	<meta name="description" content={m.sutra_d_meta_description({ title })} />
</svelte:head>

{#key `${data.sutra.id}:${data.translation?.key}`}
	<SutraDetail
		sutra={data.sutra}
		translation={data.translation}
		chapters={data.chapters}
		related={data.related}
	/>
{/key}
