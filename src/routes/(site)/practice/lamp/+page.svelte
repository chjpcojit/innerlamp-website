<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import LampOffering from '$lib/components/sections/LampOffering.svelte';
	import LampGarden from '$lib/components/sections/LampGarden.svelte';
	import { lamps } from '$lib/state/lamps.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	onMount(() => lamps.init());
</script>

<svelte:head>
	<title>{m.lamp_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.lamp_meta_description()} />
</svelte:head>

<div class="flex flex-col gap-6">
	<LampOffering isGuest={data.isGuest} />
	<LampGarden garden={data.garden} isGuest={data.isGuest} />
</div>
