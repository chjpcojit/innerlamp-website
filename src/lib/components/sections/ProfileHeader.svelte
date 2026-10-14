<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		/** Full name (falls back to the session display name). */
		name: string;
		/** Pháp danh; the line is hidden when the account has none. */
		dharmaName?: string;
		/** Name of the ordination temple, when set. */
		temple?: string;
		/** Short-lived signed URL; initials are shown when absent. */
		avatarUrl?: string;
	}

	let { name, dharmaName, temple, avatarUrl }: Props = $props();

	let confirmOpen = $state(false);
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (confirmOpen && !dialog.open) dialog.showModal();
		else if (!confirmOpen && dialog.open) dialog.close();
	});

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(-2)
			.map((w) => w[0])
			.join('')
			.toUpperCase()
	);
</script>

<section class="overflow-hidden rounded-[28px] border border-ink/8 bg-paper">
	<!-- No cover photo upload yet: gradient stands in for the mock's image slot. -->
	<div
		class="h-[clamp(160px,22vw,240px)] bg-[linear-gradient(150deg,#efe6d5,#e2d4bb)]"
		role="img"
		aria-label={m.pf_cover_alt()}
	></div>
	<div class="-mt-12 flex flex-wrap items-end gap-5 px-[clamp(20px,3vw,32px)] pb-6">
		{#if avatarUrl}
			<img
				src={avatarUrl}
				alt=""
				class="size-[104px] flex-none rounded-full border-4 border-paper object-cover shadow-[0_8px_24px_rgba(34,30,25,.12)]"
			/>
		{:else}
			<div
				class="flex size-[104px] flex-none items-center justify-center rounded-full border-4 border-paper bg-sand-deep font-serif text-4xl text-gold-deep shadow-[0_8px_24px_rgba(34,30,25,.12)]"
				aria-hidden="true"
			>
				{initials || '·'}
			</div>
		{/if}
		<div class="min-w-[220px] flex-1 pb-1">
			<h1 class="font-serif text-[40px]/tight">{name}</h1>
			<p class="mt-1 text-sm text-ink/55">
				{#if dharmaName}
					{m.pf_phap_label()} <span class="text-gold-deep">{dharmaName}</span> ·
				{/if}
				{m.pf_status()}
			</p>
			{#if temple}
				<p class="mt-0.5 text-sm text-ink/55">
					{m.pf_temple_label()} <span class="text-gold-deep">{temple}</span>
				</p>
			{/if}
		</div>
		<div class="flex flex-none gap-2.5 pb-1">
			<a
				href={resolve(localizeHref('/profile/edit') as '/profile/edit')}
				class="rounded-full border border-ink/16 px-5 py-[11px] text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-sand/60"
			>
				{m.pf_edit()}
			</a>
			<button
				type="button"
				onclick={() => (confirmOpen = true)}
				class="cursor-pointer rounded-full border border-[#a7443f]/30 px-5 py-[11px] text-[13px] font-medium whitespace-nowrap text-[#a7443f] transition-colors hover:bg-[#a7443f]/6"
			>
				{m.pf_logout()}
			</button>
		</div>
	</div>
</section>

<dialog
	bind:this={dialog}
	aria-labelledby="logout-title"
	aria-describedby="logout-desc"
	onclose={() => (confirmOpen = false)}
	class="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-[#161310]/48"
>
	<div class="flex h-full overflow-y-auto p-5">
		<button
			type="button"
			class="absolute inset-0 cursor-default"
			aria-label={m.pf_logout_stay()}
			onclick={() => (confirmOpen = false)}
		></button>
		<div
			class="relative m-auto w-[min(100%,400px)] rounded-3xl bg-paper p-7 shadow-[0_24px_60px_rgba(0,0,0,.25)]"
		>
			<h2 id="logout-title" class="font-serif text-[28px]/tight">{m.pf_logout_title()}</h2>
			<p id="logout-desc" class="mt-2.5 text-sm/relaxed text-balance text-ink/60">
				{m.pf_logout_desc()}
			</p>
			<form method="POST" action="?/logout" class="mt-6 flex gap-2.5">
				<button
					type="button"
					onclick={() => (confirmOpen = false)}
					class="flex-1 cursor-pointer rounded-full border border-ink/16 py-[13px] text-sm font-medium transition-colors hover:bg-sand/60"
				>
					{m.pf_logout_stay()}
				</button>
				<button
					type="submit"
					class="flex-1 cursor-pointer rounded-full bg-[#a7443f] py-[13px] text-sm font-medium text-paper transition-colors hover:bg-[#933a35]"
				>
					{m.pf_logout_confirm()}
				</button>
			</form>
		</div>
	</div>
</dialog>
