<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ArticleCatalog from '$lib/components/sections/ArticleCatalog.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.articles_title()} · {m.app_name()}</title>
	<meta name="description" content={m.articles_meta_description()} />
</svelte:head>

<ArticleCatalog articles={data.articles} />
