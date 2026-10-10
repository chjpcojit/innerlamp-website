<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import SettingsForm from '$lib/components/sections/SettingsForm.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.set_title()} · {m.app_name()}</title>
	<meta name="description" content={m.set_meta_description()} />
</svelte:head>

<SettingsForm loggedIn={!!data.user} />
