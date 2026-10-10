<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Button from '$lib/components/ui/Button.svelte';
	import { OFFER_PURPOSES } from '$lib/content/offer';
	import type { OfferFlow } from '$lib/state/offer.svelte';
	import { formatVnd } from '$lib/utils/money';

	interface Props {
		flow: OfferFlow;
	}

	let { flow }: Props = $props();

	const locale = getLocale();
	const line = $derived(
		m.offer_done_line({
			amount: formatVnd(flow.amount, locale),
			temple: flow.templeInfo.name(),
			purpose: OFFER_PURPOSES[flow.purpose].label().toLocaleLowerCase(locale)
		})
	);
</script>

<div class="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 py-3 text-center">
	<div class="flex size-16 items-center justify-center rounded-full bg-gold/16" aria-hidden="true">
		<span class="size-[22px] -rotate-45 rounded-[50%_0_50%_50%] bg-gold"></span>
	</div>
	<h2 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium text-pretty">
		{m.offer_done_title()}
	</h2>
	<p class="max-w-[480px] text-[15px]/[1.65] text-pretty text-ink/62">{line}</p>
	<figure
		class="mt-1.5 box-border w-full rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px] text-start"
	>
		<figcaption class="text-[10.5px] font-semibold tracking-[.14em] text-ink/45 uppercase">
			{m.offer_done_wish_label()}
		</figcaption>
		<blockquote class="mt-2 font-serif text-[22px]/[1.55] font-medium italic">
			{flow.wish.trim() || m.lamp_dedication()}
		</blockquote>
	</figure>
	<div class="mt-1.5 flex flex-wrap justify-center gap-2.5">
		<Button href="/merit">{m.offer_view_book()}</Button>
		<button
			type="button"
			onclick={() => flow.reset()}
			class="cursor-pointer rounded-full border border-ink/16 px-[22px] py-3.5 text-sm font-medium hover:bg-sand/60"
		>
			{m.offer_more()}
		</button>
	</div>
</div>
