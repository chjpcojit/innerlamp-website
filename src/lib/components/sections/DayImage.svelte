<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { CalendarDayImage } from '$lib/types/calendar';

	interface Props {
		/** `YYYY-MM-DD`. */
		date: string;
		/** Classes for the `<figure>` (size, radius). */
		class?: string;
		/** Extra classes for the credit line (alignment). */
		captionClass?: string;
	}

	let { date, class: className = '', captionClass = '' }: Props = $props();

	// Plain cache, not reactive state: only the effect below reads it.
	const fetched: Record<string, CalendarDayImage> = {};
	let image = $state<CalendarDayImage | null>(null);

	$effect(() => {
		const day = date;
		const cached = fetched[day];
		if (cached) {
			image = cached;
			return;
		}
		// Keep the previous picture until the next one arrives; a failure hides it.
		const controller = new AbortController();
		fetch(`/api/calendar/image?date=${day}`, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = (await res.json()) as CalendarDayImage;
				fetched[day] = data;
				image = data;
			})
			.catch((e: unknown) => {
				if (controller.signal.aborted) return;
				console.error('[lunar] day image', e);
				image = null;
			});
		return () => controller.abort();
	});
</script>

{#if image}
	<figure class="relative overflow-hidden bg-sand/60 {className}">
		<img
			src={image.image_url}
			alt={m.lunar_image_alt()}
			loading="lazy"
			decoding="async"
			class="size-full object-cover"
		/>
		<figcaption
			class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pt-6 pb-2 text-[10.5px] text-white/85 {captionClass}"
		>
			{m.lunar_image_credit({ author: image.author })} ·
			<!-- eslint-disable svelte/no-navigation-without-resolve -- external license link -->
			<a
				href={image.license_url}
				target="_blank"
				rel="noopener noreferrer"
				class="underline hover:text-white"
			>
				{image.license}
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</figcaption>
	</figure>
{/if}
