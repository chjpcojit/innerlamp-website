<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { SUPPORT_USES } from '$lib/content/support';
</script>

<section
	data-keep-dark
	aria-labelledby="support-uses"
	class="relative flex flex-col gap-[18px] overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#2a2620,#161310)] p-[clamp(20px,3vw,28px)] text-[#f5eee0]"
>
	<div
		class="pointer-events-none absolute -top-[60px] -right-[60px] size-[220px] rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.32),transparent_66%)]"
	></div>
	<h2
		id="support-uses"
		class="relative text-[10.5px] font-semibold tracking-[.14em] text-[#f3c673] uppercase"
	>
		{m.sup_uses_title()}
	</h2>
	<ol class="relative flex flex-col gap-[18px]">
		{#each SUPPORT_USES as u, i (i)}
			<li class="flex gap-3.5 border-t border-[#f2ebdd]/10 pt-4">
				<span class="w-[22px] flex-none font-serif text-xl font-medium text-[#f3c673]">
					{i + 1}
				</span>
				<div>
					<h3 class="text-sm font-medium">{u.title()}</h3>
					<p class="mt-[3px] text-[13px]/[1.55] text-[#f2ebdd]/62">{u.desc()}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
