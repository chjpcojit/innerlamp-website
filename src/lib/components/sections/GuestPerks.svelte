<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { GUEST_PERKS } from '$lib/content/home';
</script>

<section class="flex flex-wrap items-center gap-7 rounded-[28px] bg-sand p-[clamp(22px,4vw,36px)]">
	<div class="min-w-0 flex-[1_1_260px]">
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-gold-deep">{m.perks_label()}</p>
		<h2 class="mt-2.5 font-serif text-[clamp(22px,4.4vw,28px)]/[1.25] text-pretty">
			{m.perks_title()}
		</h2>
		<div class="mt-[18px]">
			<Button href="/signup">{m.perks_cta()}</Button>
		</div>
	</div>
	<ul
		class="grid min-w-0 flex-[2_1_420px] grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3"
	>
		{#each GUEST_PERKS as perk (perk.title())}
			<li class="rounded-[18px] bg-paper px-[18px] py-4">
				<Icon kind={perk.icon} size={44} tone="#8A5A18" />
				<h3 class="mt-3.5 text-sm font-medium">{perk.title()}</h3>
				<p class="mt-1 text-xs/normal text-ink/55">{perk.desc()}</p>
			</li>
		{/each}
	</ul>
</section>
