<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import FilterChips from '$lib/components/ui/FilterChips.svelte';
	import {
		NOTIFICATIONS,
		NOTIFICATION_GROUPS,
		NOTIFICATION_KINDS,
		type NotificationKind
	} from '$lib/content/notifications';
	import { notifications } from '$lib/state/notifications.svelte';

	onMount(() => notifications.init());

	let kind = $state<NotificationKind | null>(null);

	const kindOptions = (Object.keys(NOTIFICATION_KINDS) as NotificationKind[]).map((id) => ({
		id,
		label: NOTIFICATION_KINDS[id].label()
	}));

	const groups = $derived(
		NOTIFICATION_GROUPS.map((g) => ({
			...g,
			items: NOTIFICATIONS.filter((n) => n.group === g.id && (!kind || n.kind === kind))
		})).filter((g) => g.items.length)
	);
</script>

<div class="flex max-w-[860px] flex-col gap-6">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium">
				{m.notif_title()}
			</h1>
			<p class="mt-2 text-sm text-ink/55">
				{notifications.unread
					? m.notif_unread({ count: notifications.unread })
					: m.notif_all_read()}
			</p>
		</div>
		<button
			type="button"
			onclick={() => notifications.markAllRead()}
			disabled={!notifications.unread}
			class="cursor-pointer text-[13px] font-medium text-gold-deep hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-40"
		>
			{m.notif_mark_all()}
		</button>
	</header>

	<FilterChips
		options={kindOptions}
		bind:value={kind}
		allLabel={m.notif_tab_all()}
		label={m.notif_filter_aria()}
	/>

	{#each groups as g (g.id)}
		<section class="flex flex-col gap-2.5" aria-label={g.label()}>
			<h2 class="text-[10.5px] font-semibold tracking-[.14em] text-ink/45">{g.label()}</h2>
			<ul class="overflow-hidden rounded-[22px] border border-ink/8 bg-paper">
				{#each g.items as n (n.id)}
					{@const k = NOTIFICATION_KINDS[n.kind]}
					{@const unread = notifications.ready && !notifications.isRead(n.id)}
					<li class="border-b border-ink/7 last:border-b-0">
						<a
							href={resolve(localizeHref(n.to) as '/sangha')}
							onclick={() => notifications.markRead(n.id)}
							class="flex items-start gap-4 px-[22px] py-[18px] hover:bg-white {unread
								? 'bg-paper'
								: 'bg-cream-soft'}"
						>
							<span
								class="flex size-10 flex-none items-center justify-center rounded-xl"
								style:background-color={k.tint}
								aria-hidden="true"
							>
								<span class="size-2.5 rounded-full" style:background-color={k.tone}></span>
							</span>
							<span class="min-w-0 flex-1">
								<span class="flex flex-wrap items-baseline gap-2">
									<span
										class="text-[10.5px] font-semibold tracking-widest uppercase"
										style:color={k.tone}
									>
										{k.label()}
									</span>
									<span class="text-xs text-ink/45">{n.time()}</span>
								</span>
								<span
									class="mt-1 block text-[14.5px]/[1.45] text-pretty {unread
										? 'font-semibold'
										: ''}"
								>
									{n.title()}
								</span>
								{#if n.body()}
									<span class="mt-[3px] block text-[13px]/[1.55] text-pretty text-ink/60">
										{n.body()}
									</span>
								{/if}
							</span>
							{#if unread}
								<span class="mt-1.5 size-2 flex-none rounded-full bg-amber">
									<span class="sr-only">{m.notif_unread_badge()}</span>
								</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p class="rounded-[22px] bg-sand p-8 text-center text-sm text-ink/60">{m.notif_empty()}</p>
	{/each}
</div>
