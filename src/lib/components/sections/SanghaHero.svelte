<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import SanghaSettings from '$lib/features/sangha/components/SanghaSettings.svelte';

	interface Props {
		/** Ordination temple from the profile; a placeholder title is shown when unset. */
		temple?: { id: string; name: string };
		/** Temple photo; the gradient backdrop shows when null. */
		image?: string | null;
	}

	let { temple, image }: Props = $props();

	// Offering / directions / post have no target yet, so those actions are inert.
	const ACTIONS: { label: () => string; style: string; href?: string }[] = $derived([
		{
			label: () => m.sg_hero_temple(),
			style: 'bg-cream text-ink hover:bg-paper',
			href: temple ? `/temples/${encodeURIComponent(temple.id)}` : undefined
		},
		{
			label: () => m.sg_hero_directions(),
			style: 'border border-cream/45 text-cream hover:bg-cream/10'
		},
		{
			label: () => m.sg_hero_offer(),
			style: 'border border-cream/45 text-cream hover:bg-cream/10',
			href: '/offer?temple=tuquang'
		},
		{ label: () => m.sg_hero_share(), style: 'bg-amber text-[#1a1611] hover:bg-[#e6a94e]' }
	]);
</script>

<section
	data-keep-dark
	aria-labelledby="sg-title"
	class="relative flex min-h-[clamp(280px,36vw,380px)] flex-col justify-end overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_70%_20%,#4a3b25,#1c1813_70%)]"
>
	{#if image}
		<img src={image} alt="" class="absolute inset-0 size-full object-cover" />
	{/if}
	<div
		class="absolute inset-0 bg-[linear-gradient(0deg,rgba(22,19,16,.86)_0%,rgba(22,19,16,.35)_55%,transparent_100%)]"
	></div>
	<div
		class="relative flex flex-wrap items-end justify-between gap-5 px-[clamp(22px,4vw,44px)] py-[30px] text-cream"
	>
		<div>
			<p class="text-[10.5px] font-semibold tracking-[.18em] text-amber-light">{m.sg_kicker()}</p>
			<h1 id="sg-title" class="mt-2.5 font-serif text-[clamp(36px,4.8vw,50px)]/[1.1] font-medium">
				{temple?.name ?? m.sg_temple_unset()}
			</h1>
		</div>
		<div class="flex flex-wrap gap-2.5">
			{#each ACTIONS as a (a.label())}
				{#if a.href}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
					<a
						href={localizeHref(a.href)}
						class="rounded-full px-[18px] py-[11px] text-[13.5px] font-medium whitespace-nowrap transition-colors {a.style}"
					>
						{a.label()}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{:else}
					<button
						type="button"
						class="cursor-pointer rounded-full px-[18px] py-[11px] text-[13.5px] font-medium whitespace-nowrap transition-colors {a.style}"
					>
						{a.label()}
					</button>
				{/if}
			{/each}
			{#if temple}
				<SanghaSettings {temple} />
			{/if}
		</div>
	</div>
</section>
