<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import LampMark from '$lib/components/ui/LampMark.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-wrap font-sans text-ink">
	<aside
		data-keep-dark
		class="box-border flex min-h-[min(100vh,760px)] flex-[1_1_420px] flex-col justify-between gap-10 bg-[radial-gradient(circle_at_50%_44%,#2A241C,#100E0B_74%)] px-[clamp(20px,5vw,44px)] py-[clamp(24px,5vw,36px)] text-[#F5EEE0]"
	>
		<a href={resolve(localizeHref('/') as Pathname)} class="flex items-center gap-[11px]">
			<LampMark onDark />
			<span class="text-[13px] font-semibold tracking-[.2em]">{m.auth_brand()}</span>
		</a>
		<div class="text-center">
			<div
				class="mx-auto flex size-[220px] items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.28),transparent_66%)]"
				aria-hidden="true"
			>
				<LampMark onDark size={100} />
			</div>
			<p class="mt-6 font-serif text-[28px]/[1.5] italic">{m.auth_tagline()}</p>
		</div>
		<p class="font-serif text-[13px] text-[#F2EBDD]/40 italic">{m.auth_quote()}</p>
	</aside>
	<main
		class="box-border flex flex-[1_1_480px] items-center justify-center bg-linear-to-b from-[#FBF7EF] to-[#F1E8D8] px-6 py-12"
	>
		{@render children()}
	</main>
</div>
