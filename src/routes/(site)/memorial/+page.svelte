<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import GuestPrompt from '$lib/components/ui/GuestPrompt.svelte';
	import MemorialBook from '$lib/components/sections/MemorialBook.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.mem_title()} · {m.app_name()}</title>
	<meta name="description" content={m.mem_meta_description()} />
</svelte:head>

{#if data.user}
	<MemorialBook />
{:else}
	<GuestPrompt title={m.mem_guest_title()} desc={m.mem_guest_desc()} />
{/if}
