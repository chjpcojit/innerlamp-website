<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { CONTACT_INFO } from '$lib/content/contact';
</script>

<aside class="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5">
	{#each CONTACT_INFO as c, i (i)}
		<section class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-5">
			<h2 class="text-[10.5px] font-semibold tracking-[.14em] text-ink/45">{c.label()}</h2>
			<p class="mt-1.5 font-serif text-[22px] font-medium">{c.value()}</p>
			<p class="mt-1 text-xs/[1.55] text-pretty text-ink/55">{c.hint()}</p>
		</section>
	{/each}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
	<a
		href={localizeHref('/help')}
		class="flex items-center gap-3 rounded-[22px] border border-ink/8 bg-paper px-[22px] py-[18px] transition-colors hover:border-gold/45"
	>
		<span class="flex-1">
			<span class="block text-sm font-medium">{m.contact_faq_title()}</span>
			<span class="mt-0.5 block text-xs text-ink/55">{m.contact_faq_hint()}</span>
		</span>
		<span class="text-lg text-ink/35" aria-hidden="true">›</span>
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</aside>
