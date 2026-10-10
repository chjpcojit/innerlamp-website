<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import GuestPrompt from '$lib/components/ui/GuestPrompt.svelte';
	import MemorialForm from '$lib/components/sections/MemorialForm.svelte';

	let { data, params }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.mem_form_edit()} · {m.app_name()}</title>
</svelte:head>

{#if data.user}
	{#key params.id}
		<MemorialForm id={params.id} />
	{/key}
{:else}
	<GuestPrompt title={m.mem_guest_title()} desc={m.mem_guest_desc()} />
{/if}
