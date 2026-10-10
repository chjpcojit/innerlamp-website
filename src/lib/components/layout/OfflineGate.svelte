<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ErrorScreen from '$lib/components/sections/ErrorScreen.svelte';
	import ActionButton from '$lib/components/ui/ActionButton.svelte';
	import { connectivity, formatClock } from '$lib/state/connectivity.svelte';

	let failed = $state(false);

	const time = $derived(formatClock(connectivity.checkedAt ?? new Date()));

	async function retry() {
		failed = false;
		failed = !(await connectivity.recheck());
	}
</script>

{#if connectivity.offline}
	{#if connectivity.useOffline}
		<div
			class="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center gap-3 border-b border-ink/8 bg-sand px-[clamp(16px,3vw,40px)] py-3 text-[13px] text-ink/70"
			role="status"
		>
			<span class="size-2 flex-none rounded-full bg-[#c2857f]"></span>
			<p class="min-w-[200px] flex-1">{m.offline_banner()}</p>
			<button type="button" class="cursor-pointer font-medium underline" onclick={retry}>
				{m.offline_banner_retry()}
			</button>
		</div>
	{:else}
		<div
			class="fixed inset-0 z-50 overflow-y-auto bg-cream px-[clamp(16px,4vw,40px)] font-sans text-ink"
		>
			<ErrorScreen
				tag={m.offline_tag()}
				title={m.offline_title()}
				body={m.offline_body()}
				message={failed ? m.offline_still({ time }) : undefined}
				tipsTitle={m.offline_tips_title()}
				tips={[m.offline_tip_1(), m.offline_tip_2(), m.offline_tip_3()]}
				footnote={m.offline_last_check({ time })}
			>
				{#snippet actions()}
					<ActionButton busy={connectivity.checking} onclick={retry}>
						{connectivity.checking ? m.err_retrying() : m.err_retry()}
					</ActionButton>
					<ActionButton variant="outline" onclick={() => (connectivity.useOffline = true)}>
						{m.offline_use()}
					</ActionButton>
				{/snippet}
			</ErrorScreen>
		</div>
	{/if}
{/if}
