<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import SanghaHero from '$lib/components/sections/SanghaHero.svelte';
	import SanghaMain from '$lib/components/sections/SanghaMain.svelte';
	import SanghaSide from '$lib/components/sections/SanghaSide.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.sg_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.sg_meta_description()} />
</svelte:head>

{#if data.user}
	<div class="flex flex-col gap-7">
		<SanghaHero />
		<div class="flex flex-wrap items-start gap-7">
			<SanghaMain />
			<SanghaSide />
		</div>
	</div>
{:else}
	<section
		class="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[28px] bg-sand p-[clamp(24px,5vw,48px)] text-center"
	>
		<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2] text-pretty">{m.sg_guest_title()}</h1>
		<p class="text-sm/relaxed text-ink/60">{m.sg_guest_desc()}</p>
		<Button href="/login">{m.header_login()}</Button>
	</section>
{/if}
