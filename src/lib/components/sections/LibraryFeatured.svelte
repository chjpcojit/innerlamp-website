<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<section
	data-keep-dark
	class="relative flex min-h-[200px] flex-wrap items-end justify-between gap-6 overflow-hidden rounded-[28px] bg-linear-to-br from-[#2a2620] to-night p-[clamp(22px,5vw,36px)] text-[#f5eee0] md:px-10"
	aria-labelledby="library-featured-title"
>
	<div
		class="pointer-events-none absolute -top-25 -right-20 h-80 w-95 rounded-full bg-[radial-gradient(ellipse,rgba(217,150,60,.28),transparent_66%)]"
		aria-hidden="true"
	></div>
	<div class="relative max-w-[560px]">
		<p class="text-[10px] font-semibold tracking-[.16em] text-[#e8b061]">
			{m.lib_featured_kicker()}
		</p>
		<h2 id="library-featured-title" class="mt-3 font-serif text-[clamp(26px,4vw,35.8px)]/tight">
			{m.lib_featured_title()}
		</h2>
		<p class="mt-2.5 text-[13px] text-[#f2ebdd]/60">{m.lib_featured_meta()}</p>
	</div>
	<!-- eslint-disable svelte/no-navigation-without-resolve -- target routes are not built yet -->
	<a
		href={localizeHref('/library/talks')}
		class="relative rounded-full bg-amber px-[22px] py-[13px] text-sm font-medium whitespace-nowrap text-[#1a1611] transition-colors hover:bg-amber-light"
	>
		{m.lib_featured_cta()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</section>
