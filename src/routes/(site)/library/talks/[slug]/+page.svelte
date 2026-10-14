<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import TalkDetail from '$lib/components/sections/TalkDetail.svelte';

	let { data }: PageProps = $props();

	const description = $derived(
		data.talk.summary ||
			m.talk_d_meta_description({ title: data.talk.title, speaker: data.talk.speaker })
	);
</script>

<svelte:head>
	<title>{data.talk.title} · {m.app_name()}</title>
	<meta name="description" content={description} />
</svelte:head>

{#key data.talk.id}
	<TalkDetail talk={data.talk} related={data.related} />
{/key}
