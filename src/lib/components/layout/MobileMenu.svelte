<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		open: boolean;
		links: { href: string; label: () => string }[];
		onclose: () => void;
	}

	let { open, links, onclose }: Props = $props();

	// Skip motion for visitors who ask for less of it.
	const reduced =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const t = (ms: number) => (reduced ? 0 : ms);

	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => (document.body.style.overflow = previous);
	});
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && onclose()} />

{#if open}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- internal links and hash anchors -->
	<div
		class="fixed inset-0 z-90 bg-night/40 backdrop-blur-[2px] md:hidden"
		role="presentation"
		onclick={onclose}
		transition:fade={{ duration: t(200) }}
	>
		<div
			id="mobile-menu"
			role="dialog"
			aria-modal="true"
			aria-label={m.nav_aria()}
			tabindex="-1"
			class="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col bg-cream-soft shadow-[12px_0_40px_rgba(0,0,0,.18)]"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			transition:fly={{ x: -340, duration: t(280), easing: cubicOut, opacity: 1 }}
		>
			<div class="flex h-16 flex-none items-center justify-between border-b border-ink/8 pr-4 pl-5">
				<span class="text-[13px] font-semibold tracking-[.2em]">INNERLAMP</span>
				<button
					type="button"
					onclick={onclose}
					aria-label={m.header_menu_close()}
					class="group relative size-10 cursor-pointer rounded-xl hover:bg-sand/60"
				>
					<span
						class="absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-1/2 rotate-45 bg-ink transition-transform duration-200 group-hover:rotate-135"
					></span>
					<span
						class="absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-1/2 -rotate-45 bg-ink transition-transform duration-200 group-hover:rotate-45"
					></span>
				</button>
			</div>
			<nav class="flex-1 overflow-y-auto px-3 pt-2.5 pb-6" aria-label={m.nav_aria()}>
				{#each links as link, i (link.href)}
					<a
						href={link.href}
						in:fly={{ x: -14, duration: t(260), delay: t(120 + i * 45), easing: cubicOut }}
						onclick={onclose}
						class="block rounded-xl border-b border-ink/6 px-2.5 py-3 text-[15px] font-medium text-ink/80 transition-[background-color,padding] duration-150 hover:bg-sand hover:pl-4"
					>
						{link.label()}
					</a>
				{/each}
			</nav>
			<a
				href={localizeHref('/practice/lamp')}
				onclick={onclose}
				data-keep-dark
				class="mx-4 mb-5 rounded-full bg-ink p-3.5 text-center text-sm font-medium text-cream"
			>
				{m.header_lamp()}
			</a>
		</div>
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
