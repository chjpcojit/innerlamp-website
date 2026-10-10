<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { PROFILE_ROWS } from '$lib/content/profile';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { memorial } from '$lib/state/memorial.svelte';

	onMount(() => memorial.init());
</script>

<aside class="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5">
	<a
		href={resolve(localizeHref('/merit') as '/merit')}
		data-keep-dark
		class="flex items-center gap-3.5 rounded-[22px] bg-[linear-gradient(150deg,#2a2620,#161310)] px-[22px] py-5 text-[#f5eee0]"
	>
		<Icon kind="lamp" tone="#f3c673" tint="rgba(243,198,115,.14)" size={42} />
		<div class="flex-1">
			<h2 class="text-sm font-medium">{m.pf_merit_title()}</h2>
			<p class="mt-[3px] text-xs text-[#f2ebdd]/60">{m.pf_merit_meta()}</p>
		</div>
		<span class="text-[17px] text-[#f2ebdd]/40" aria-hidden="true">›</span>
	</a>

	<a
		href={resolve(localizeHref('/support') as '/support')}
		class="flex items-center gap-3.5 rounded-[22px] border border-gold/45 bg-paper px-5 py-[18px]"
	>
		<Icon kind="lotus" tone="#b8862f" tint="rgba(184,134,47,.16)" size={42} />
		<div class="min-w-0 flex-1">
			<h2 class="text-sm font-medium">{m.pf_premium_title()}</h2>
			<p class="mt-[3px] text-xs text-ink/50">{m.pf_premium_meta()}</p>
		</div>
		<span class="text-[17px] text-ink/35" aria-hidden="true">›</span>
	</a>

	<ul class="overflow-hidden rounded-[22px] border border-ink/8 bg-paper">
		{#each PROFILE_ROWS as r, i (i)}
			{@const row = 'flex items-center gap-3 px-5 py-3 text-start'}
			<li class={i < PROFILE_ROWS.length - 1 ? 'border-b border-ink/6' : ''}>
				{#snippet content()}
					<Icon kind={r.icon} tone="#8a5a18" tint="rgba(184,134,47,.12)" size={34} />
					<span class="min-w-0 flex-1 text-sm font-medium">{r.title()}</span>
					<span class="min-w-0 text-end text-[13px] text-ink/50">{r.value()}</span>
					<span class="text-[17px] text-ink/35" aria-hidden="true">›</span>
				{/snippet}
				{#if r.href}
					<a
						href={resolve(localizeHref(r.href) as NonNullable<typeof r.href>)}
						class="{row} hover:bg-white"
					>
						{@render content()}
					</a>
				{:else}
					<div class={row}>{@render content()}</div>
				{/if}
			</li>
		{/each}
	</ul>
</aside>
