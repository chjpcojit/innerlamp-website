<script lang="ts">
	import type { PageProps } from './$types';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import OfferForm from '$lib/components/sections/OfferForm.svelte';
	import OfferQr from '$lib/components/sections/OfferQr.svelte';
	import OfferDone from '$lib/components/sections/OfferDone.svelte';
	import { OFFER_PURPOSES, OFFER_TEMPLES } from '$lib/content/offer';
	import { merit } from '$lib/state/merit.svelte';
	import { OfferFlow } from '$lib/state/offer.svelte';

	let { data }: PageProps = $props();

	/** `?temple=<slug|index>&purpose=<slug|index>&wish=…` pre-fills the form (e.g. from "Thỉnh đèn"). */
	const params = page.url.searchParams;
	const indexOf = (value: string | null, slugs: string[]) => {
		if (value === null) return 0;
		const bySlug = slugs.indexOf(value);
		if (bySlug >= 0) return bySlug;
		const n = Number(value);
		return Number.isInteger(n) && n >= 0 && n < slugs.length ? n : 0;
	};

	const flow = new OfferFlow({
		temple: indexOf(
			params.get('temple'),
			OFFER_TEMPLES.map((t) => t.slug)
		),
		purpose: indexOf(
			params.get('purpose'),
			OFFER_PURPOSES.map((p) => p.slug)
		),
		// The form is pre-filled once; later edits must not be overwritten by data changes.
		name: untrack(() => data.user?.name ?? ''),
		wish: params.get('wish')?.slice(0, 500) ?? ''
	});

	function confirm() {
		merit.add({ temple: flow.temple, purpose: flow.purpose, amount: flow.amount }, flow.monthly);
		flow.finish();
	}

	let firstStep = true;
	$effect(() => {
		void flow.step;
		if (firstStep) firstStep = false;
		else window.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<title>{m.offer_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.offer_meta_description()} />
</svelte:head>

<div class="flex flex-col gap-7">
	<header class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<p class="text-[10.5px] font-semibold tracking-[.16em] text-gold-deep uppercase">
				{m.offer_eyebrow()}
			</p>
			<h1 class="mt-2.5 font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium text-pretty">
				{m.offer_title()}
			</h1>
			<p class="mt-2 max-w-[560px] text-sm/relaxed text-pretty text-ink/60">{m.offer_desc()}</p>
		</div>
		<Button href="/merit" variant="gold">{m.offer_my_book()}</Button>
	</header>

	{#if flow.step === 'form'}
		<OfferForm {flow} />
	{:else if flow.step === 'qr'}
		<OfferQr {flow} onconfirm={confirm} />
	{:else}
		<OfferDone {flow} />
	{/if}
</div>
