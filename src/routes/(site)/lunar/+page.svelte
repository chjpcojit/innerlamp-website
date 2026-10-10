<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import LunarCalendar from '$lib/components/sections/LunarCalendar.svelte';
</script>

<svelte:head>
	<title>{m.lunar_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.lunar_meta_description()} />
</svelte:head>

<LunarCalendar />
