<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import MeritStats from '$lib/components/sections/MeritStats.svelte';
	import MeritHistory from '$lib/components/sections/MeritHistory.svelte';
	import MeritSide from '$lib/components/sections/MeritSide.svelte';

	import { merit } from '$lib/state/merit.svelte';

	let { data }: PageProps = $props();

	onMount(() => merit.init());
</script>

<svelte:head>
	<title>{m.mr_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.mr_meta_description()} />
</svelte:head>

{#if data.user}
	<div class="flex flex-col gap-[26px]">
		<header class="flex flex-wrap items-end justify-between gap-5">
			<div>
				<p class="text-[10.5px] font-semibold tracking-[.16em] text-gold-deep uppercase">
					{m.mr_eyebrow()}
				</p>
				<h1 class="mt-2.5 font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium text-pretty">
					{m.mr_title()}
				</h1>
			</div>
			<Button href="/offer">{m.mr_offer_cta()}</Button>
		</header>
		<MeritStats />
		<div class="flex flex-wrap items-start gap-6">
			<MeritHistory />
			<MeritSide />
		</div>
	</div>
{:else}
	<section
		class="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[28px] bg-sand p-[clamp(24px,5vw,48px)] text-center"
	>
		<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2] text-pretty">{m.mr_guest_title()}</h1>
		<p class="text-sm/relaxed text-ink/60">{m.mr_guest_desc()}</p>
		<Button href="/login">{m.header_login()}</Button>
	</section>
{/if}
