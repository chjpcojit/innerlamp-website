<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import GuestPrompt from '$lib/components/ui/GuestPrompt.svelte';
	import MemorialForm from '$lib/components/sections/MemorialForm.svelte';
	import type { MemorialActionErrors } from '$lib/types/memorial';

	let { data, params, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.mem_form_edit()} · {m.app_name()}</title>
</svelte:head>

{#if data.user}
	{#key params.id}
		<MemorialForm
			isNew={false}
			entry={data.entry}
			notFound={data.notFound}
			loadError={data.loadError}
			photoEnabled={data.photoEnabled}
			values={form?.values}
			formErrors={form?.errors as MemorialActionErrors | undefined}
		/>
	{/key}
{:else}
	<GuestPrompt title={m.mem_guest_title()} desc={m.mem_guest_desc()} />
{/if}
