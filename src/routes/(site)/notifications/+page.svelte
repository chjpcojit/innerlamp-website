<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import GuestPrompt from '$lib/components/ui/GuestPrompt.svelte';
	import NotificationList from '$lib/components/sections/NotificationList.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.notif_title()} · {m.app_name()}</title>
	<meta name="description" content={m.notif_meta_description()} />
</svelte:head>

{#if data.user}
	<NotificationList />
{:else}
	<GuestPrompt title={m.notif_guest_title()} desc={m.notif_guest_desc()} />
{/if}
