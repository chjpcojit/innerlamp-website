<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { sanghaErrorMessage } from '../errors';
	import type { SanghaError } from '../types';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		temple: { id: string; name: string };
		/** The user's practice temple; null when unset or unknown (guest / profile failed). */
		current: { id: string; name: string } | null;
		isGuest: boolean;
	}

	let { temple, current, isGuest }: Props = $props();

	let pending = $state(false);
	let error = $state<SanghaError | null>(null);

	const isMine = $derived(current?.id === temple.id);

	// Replaces any current temple immediately, as in the design (no confirm step).
	const submit: SubmitFunction = () => {
		pending = true;
		error = null;
		return async ({ result, update }) => {
			pending = false;
			if (result.type === 'failure') {
				error = (result.data?.sanghaError as SanghaError | undefined) ?? 'failed';
				return;
			}
			await update();
		};
	};

	const button =
		'rounded-full px-5 py-[11px] text-[13px] font-medium whitespace-nowrap transition-colors';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<section
	aria-labelledby="tp-sangha"
	class="flex flex-wrap items-center gap-4 rounded-[22px] border bg-paper px-[22px] py-[18px] {isMine
		? 'border-gold/45'
		: 'border-ink/8'}"
>
	<div class="min-w-0 flex-[1_1_280px]">
		<h2 id="tp-sangha" class="text-[15px] font-medium">
			{isMine ? m.temple_d_sangha_mine_title() : m.temple_d_sangha_title({ name: temple.name })}
		</h2>
		<p class="mt-[3px] text-[13px]/relaxed text-pretty text-ink/60">
			{#if isMine}
				{m.temple_d_sangha_mine_desc()}
			{:else if current}
				{m.temple_d_sangha_replace_desc({ current: current.name })}
			{:else}
				{m.temple_d_sangha_desc()}
			{/if}
		</p>
		{#if error}
			<p class="mt-1.5 text-[13px] text-[#a7443f]" role="alert">{sanghaErrorMessage(error)}</p>
		{/if}
	</div>
	{#if isMine}
		<a href={localizeHref('/sangha')} class="{button} bg-amber text-[#1a1611] hover:bg-[#e6a94e]">
			{m.temple_d_sangha_go()} <span aria-hidden="true">›</span>
		</a>
	{:else if isGuest}
		<a href={localizeHref('/login')} class="{button} bg-ink text-cream hover:bg-[#3a332b]">
			{m.temple_d_sangha_set()}
		</a>
	{:else}
		<form method="POST" action="?/setSangha" use:enhance={submit}>
			<input type="hidden" name="temple_id" value={temple.id} />
			<button
				type="submit"
				disabled={pending}
				class="{button} cursor-pointer bg-ink text-cream hover:bg-[#3a332b] disabled:opacity-60"
			>
				{m.temple_d_sangha_set()}
			</button>
		</form>
	{/if}
</section>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
