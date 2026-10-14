<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { DharmaTalkSummary } from '$lib/types/dharma-talk';
	import { talkMeta } from '$lib/utils/dharma-talk';

	interface Props {
		talk: DharmaTalkSummary;
		/** Heading level of the title; `h3` under a section heading. */
		titleTag?: 'h2' | 'h3';
	}

	let { talk, titleTag = 'h2' }: Props = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
<a
	href={localizeHref(`/library/talks/${encodeURIComponent(talk.id)}`)}
	class="flex items-center gap-4 rounded-[20px] border border-ink/8 bg-paper p-3.5 transition-colors hover:bg-white"
>
	<div
		class="flex size-18 flex-none items-center justify-center rounded-[14px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] font-serif text-2xl text-gold-deep/70"
		aria-hidden="true"
	>
		{talk.speaker_initials}
	</div>
	<div class="min-w-0 flex-1">
		{#if talk.category}
			<p class="text-[10.5px] font-semibold tracking-[.14em] text-gold-deep uppercase">
				{talk.category}
			</p>
		{/if}
		<svelte:element this={titleTag} class="mt-1 font-serif text-lg/snug text-pretty">
			{talk.title}
		</svelte:element>
		<p class="mt-1 text-xs text-ink/50">{talkMeta(talk)}</p>
	</div>
	{#if talk.duration_minutes}
		<p class="pr-1.5 text-xs font-medium whitespace-nowrap text-ink/50">
			{m.lib_dur_minutes({ count: talk.duration_minutes })}
		</p>
	{/if}
</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
