<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import GuestPrompt from '$lib/components/ui/GuestPrompt.svelte';
	import MemorialForm from '$lib/components/sections/MemorialForm.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.mem_form_add()} · {m.app_name()}</title>
</svelte:head>

{#if data.user}
	<MemorialForm />
{:else}
	<GuestPrompt title={m.mem_guest_title()} desc={m.mem_guest_desc()} />
{/if}
