<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { PROFILE_BADGES } from '$lib/content/profile';
	import Icon from '$lib/components/ui/Icon.svelte';
</script>

<section>
	<h2 class="mb-3 text-sm font-medium">{m.pf_badges_title()}</h2>
	<ul class="grid grid-cols-3 gap-3">
		{#each PROFILE_BADGES as b, i (i)}
			<li class="rounded-[20px] border border-ink/8 bg-paper px-3 py-[18px] text-center">
				<Icon kind={b.icon} tone={b.tone} tint={b.tint} size={44} class="mx-auto mb-2.5" />
				<p class="text-[13px]/snug font-medium">{b.name()}</p>
				<p class="mt-[3px] text-xs text-ink/45">{b.sub()}</p>
			</li>
		{/each}
	</ul>
</section>
