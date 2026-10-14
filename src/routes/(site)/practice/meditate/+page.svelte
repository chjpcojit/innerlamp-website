<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import MeditationSession from '$lib/components/sections/MeditationSession.svelte';
</script>

<svelte:head>
	<title>{m.med_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.med_meta_description()} />
</svelte:head>

<MeditationSession />
