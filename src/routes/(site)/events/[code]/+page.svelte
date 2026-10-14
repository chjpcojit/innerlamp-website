<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import EventDetail from '$lib/components/sections/EventDetail.svelte';

	let { data }: PageProps = $props();

	const title = $derived(data.detail?.event.name ?? m.ev_d_crumb());
	const description = $derived(data.detail?.event.short_description || m.ev_meta_description());
</script>

<svelte:head>
	<title>{title} · {m.app_name()}</title>
	<meta name="description" content={description} />
</svelte:head>

{#if data.detail}
	{#key `${data.detail.event.code}-${data.detail.solar_date}`}
		<EventDetail detail={data.detail} />
	{/key}
{:else}
	<div class="flex flex-col items-start gap-4">
		<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">{m.ev_d_crumb()}</h1>
		<p class="rounded-[22px] border border-ink/8 bg-paper px-6 py-10 text-sm text-ink/55">
			{m.ev_d_guest()}
		</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
		<a href={localizeHref('/events')} class="text-[13px] font-medium text-gold-deep">
			‹ {m.ev_d_back()}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/if}
