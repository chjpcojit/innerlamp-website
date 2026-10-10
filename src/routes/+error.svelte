<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { Pathname } from '$app/types';
	import { m } from '$lib/paraglide/messages';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
	import ErrorScreen from '$lib/components/sections/ErrorScreen.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ActionButton from '$lib/components/ui/ActionButton.svelte';
	import { formatClock } from '$lib/state/connectivity.svelte';

	const notFound = $derived(page.status === 404);
	const time = formatClock(new Date());
	const code = $derived(`IL-DATA-${page.status}`);

	let retrying = $state(false);
	let retryFailed = $state(false);

	function goBack() {
		if (history.length > 1) history.back();
		else void goto(resolve(localizeHref('/') as Pathname));
	}

	function retry() {
		retrying = true;
		retryFailed = false;
		// Full reload re-runs the failed `load` on the server.
		setTimeout(() => location.reload(), 600);
	}
</script>

<svelte:head>
	<title>{notFound ? m.err_404_meta_title() : m.err_data_meta_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-cream font-sans text-ink">
	<SiteHeader user={page.data.user ?? null} />
	<main class="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-[clamp(20px,4vw,40px)] pb-20">
		{#if notFound}
			<ErrorScreen code="404" title={m.err_404_title()} body={m.err_404_body()}>
				{#snippet actions()}
					<Button href="/">{m.err_404_home()}</Button>
					<ActionButton variant="outline" onclick={goBack}>{m.err_404_back()}</ActionButton>
				{/snippet}
			</ErrorScreen>
		{:else}
			<ErrorScreen
				tag={m.err_data_tag()}
				title={m.err_data_title()}
				body={m.err_data_body()}
				message={retryFailed ? m.err_data_still() : undefined}
				tipsTitle={m.err_tips_title()}
				tips={[m.err_data_tip_1(), m.err_data_tip_2(), m.err_data_tip_3()]}
				footnote={m.err_code({ code, time })}
			>
				{#snippet actions()}
					<ActionButton busy={retrying} onclick={retry}>
						{retrying ? m.err_retrying() : m.err_retry()}
					</ActionButton>
					<Button href="/" variant="outline">{m.err_404_home()}</Button>
				{/snippet}
			</ErrorScreen>
		{/if}
	</main>
	<SiteFooter />
</div>
