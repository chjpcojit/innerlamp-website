<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import ArticleDetail from '$lib/components/sections/ArticleDetail.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.article.title} · {m.app_name()}</title>
	<meta name="description" content={data.article.summary} />
</svelte:head>

{#key data.article.id}
	<ArticleDetail article={data.article} />
{/key}
