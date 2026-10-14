<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import MalaChant from '$lib/components/sections/MalaChant.svelte';
</script>

<svelte:head>
	<title>{m.mala_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.mala_meta_description()} />
</svelte:head>

<MalaChant />
