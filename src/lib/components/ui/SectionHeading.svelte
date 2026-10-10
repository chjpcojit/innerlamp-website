<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from './Icon.svelte';
	import type { IconKind } from './icon-shapes';

	interface Props {
		id: string;
		title: string;
		/** Target of the "view all" link; omit to render the title only. */
		href?: string;
		/** Text of the link; defaults to "View all". */
		linkLabel?: string;
		/** Glyph shown before the title, on the transparent 36px tile. */
		icon?: IconKind;
	}

	let { id, title, href, linkLabel = m.view_all(), icon }: Props = $props();
</script>

<div class="mb-3.5 flex items-center justify-between gap-4">
	<div class="flex min-w-0 items-center gap-3">
		{#if icon}
			<Icon kind={icon} size={36} tint="transparent" />
		{/if}
		<h2 {id} class="font-serif text-[28px]">{title}</h2>
	</div>
	{#if href}
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
		<a
			href={localizeHref(href)}
			aria-describedby={id}
			class="text-[13px] font-medium whitespace-nowrap text-gold-deep hover:underline"
		>
			{linkLabel}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{/if}
</div>
