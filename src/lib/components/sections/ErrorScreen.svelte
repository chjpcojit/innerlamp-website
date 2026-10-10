<script lang="ts">
	import type { Snippet } from 'svelte';
	import LampStatus from '$lib/components/ui/LampStatus.svelte';

	interface Props {
		/** Big gold "404"-style code. Omit for the muted error variant. */
		code?: string;
		tag?: string;
		title: string;
		body: string;
		/** Feedback line under the buttons (e.g. a failed retry). */
		message?: string;
		tipsTitle?: string;
		tips?: string[];
		footnote?: string;
		actions: Snippet;
	}

	let {
		code,
		tag,
		title,
		body,
		message,
		tipsTitle,
		tips = [],
		footnote,
		actions
	}: Props = $props();
</script>

<section
	class="flex min-h-[min(70vh,640px)] flex-col items-center justify-center gap-4 py-5 text-center"
>
	<LampStatus state={code ? 'lit' : 'out'} />
	{#if code}
		<p class="font-serif text-[clamp(64px,16vw,112px)] leading-none tracking-[.04em] text-gold">
			{code}
		</p>
	{/if}
	{#if tag}
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-[#9a5f58]">{tag}</p>
	{/if}
	<h1 class="font-serif text-[clamp(26px,5vw,34px)] leading-tight text-balance">{title}</h1>
	<p class="max-w-[480px] text-[15px] leading-[1.65] text-pretty text-ink/60">{body}</p>
	<div class="mt-1.5 flex flex-wrap justify-center gap-2.5">{@render actions()}</div>
	{#if message}
		<p class="text-[13px] font-medium text-[#9a5f58]" role="status">{message}</p>
	{/if}
	{#if tips.length > 0}
		<div
			class="mt-4 box-border w-[min(100%,460px)] rounded-[20px] border border-ink/8 bg-paper px-5 py-[18px] text-left"
		>
			{#if tipsTitle}
				<h2 class="text-[10px] font-semibold tracking-[.14em] text-ink/40">{tipsTitle}</h2>
			{/if}
			<ul class="mt-2.5 flex flex-col gap-2">
				{#each tips as tip (tip)}
					<li class="flex gap-2.5 text-[13.5px] leading-[1.55] text-ink/75">
						<span class="mt-2 size-[5px] flex-none rounded-full bg-gold"></span>
						{tip}
					</li>
				{/each}
			</ul>
			{#if footnote}
				<p class="mt-3.5 text-xs text-ink/40">{footnote}</p>
			{/if}
		</div>
	{/if}
</section>
