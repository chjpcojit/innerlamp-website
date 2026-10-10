<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import HomeHero from '$lib/components/sections/HomeHero.svelte';
	import PracticeRow from '$lib/components/sections/PracticeRow.svelte';
	import EventsRoutines from '$lib/components/sections/EventsRoutines.svelte';
	import BuddhaGrid from '$lib/components/sections/BuddhaGrid.svelte';
	import TempleGrid from '$lib/components/sections/TempleGrid.svelte';
	import PhotoGallery from '$lib/components/sections/PhotoGallery.svelte';
	import ArticleGrid from '$lib/components/sections/ArticleGrid.svelte';
	import GuestPerks from '$lib/components/sections/GuestPerks.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.app_name()}</title>
	<meta name="description" content={m.home_description()} />
</svelte:head>

<div class="flex flex-col gap-11">
	<HomeHero user={data.user} />
	<PracticeRow isGuest={!data.user} />
	{#if !data.user}
		<GuestPerks />
	{/if}
	<EventsRoutines />
	<BuddhaGrid />
	<TempleGrid />
	<PhotoGallery />
	<ArticleGrid />
</div>
