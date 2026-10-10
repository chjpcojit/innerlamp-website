<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	interface Props {
		/** Display name from the session; falls back to the placeholder profile name. */
		name: string;
	}

	let { name }: Props = $props();

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
		<div
			class="flex size-[104px] flex-none items-center justify-center rounded-full border-4 border-paper bg-sand-deep font-serif text-4xl text-gold-deep shadow-[0_8px_24px_rgba(34,30,25,.12)]"
			aria-hidden="true"
		>
			{initials || '·'}
		</div>
		<div class="min-w-[220px] flex-1 pb-1">
			<h1 class="font-serif text-[40px]/tight">{name}</h1>
			<p class="mt-1 text-sm text-ink/55">
				{m.pf_phap_label()} <span class="text-gold-deep">{m.pf_phap()}</span> · {m.pf_status()}
			</p>
		</div>
		<div class="flex flex-none gap-2.5 pb-1">
			<!-- Profile edit page doesn't exist yet: inert. -->
			<button
				type="button"
				class="cursor-pointer rounded-full border border-ink/16 px-5 py-[11px] text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-sand/60"
			>
				{m.pf_edit()}
			</button>
			<form method="POST" action="?/logout">
				<button
					type="submit"
					class="cursor-pointer rounded-full border border-[#a7443f]/30 px-5 py-[11px] text-[13px] font-medium whitespace-nowrap text-[#a7443f] transition-colors hover:bg-[#a7443f]/6"
				>
					{m.pf_logout()}
				</button>
			</form>
		</div>
	</div>
</section>
