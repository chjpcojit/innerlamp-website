<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import PracticeSit from '$lib/components/sections/PracticeSit.svelte';
	import PracticeMala from '$lib/components/sections/PracticeMala.svelte';
	import PracticeTools from '$lib/components/sections/PracticeTools.svelte';
</script>

<svelte:head>
	<title>{m.practice_title()} · {m.app_name()}</title>
	<meta name="description" content={m.practice_description()} />
</svelte:head>

<div class="flex flex-col gap-8">
	<header>
		<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">{m.practice_title()}</h1>
		<p class="mt-2 text-sm text-ink/55">{m.practice_subtitle()}</p>
	</header>
	<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-6">
		<PracticeSit />
		<PracticeMala />
	</div>
	<PracticeTools />
</div>
