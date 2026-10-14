<script lang="ts">
	import { onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import BellStage from '$lib/components/sections/BellStage.svelte';
	import BellControls from '$lib/components/sections/BellControls.svelte';
	import { bell } from '$lib/state/bell.svelte';

	onDestroy(() => bell.stop());

	const sub = $derived(
		bell.rolling ? m.bell_sub_rolling() : bell.playing ? m.bell_sub_playing() : ''
	);
</script>

<svelte:head>
	<title>{m.bell_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.bell_meta_description()} />
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		const el = e.target as HTMLElement | null;
		if (e.code !== 'Space' || el?.closest('button, a, input, textarea, select, [contenteditable]'))
			return;
		e.preventDefault();
		bell.tap();
	}}
/>

<div class="flex flex-col gap-6">
	<header>
		<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">{m.bell_title()}</h1>
		<p class="mt-2 min-h-5 text-sm text-ink/55" aria-live="polite">{sub}</p>
	</header>
	<div
		class="flex flex-wrap items-start justify-center gap-10 rounded-[28px] border border-ink/8 bg-[radial-gradient(circle_at_50%_32%,#fffdf8,#efe6d5_74%)] p-[clamp(24px,4vw,48px)]"
	>
		<BellStage />
		<BellControls />
	</div>
</div>
