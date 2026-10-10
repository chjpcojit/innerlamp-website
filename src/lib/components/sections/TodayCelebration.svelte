<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import LampFlame from '$lib/components/ui/LampFlame.svelte';

	interface Props {
		open: boolean;
		name: string;
		streak: number;
		minutes: number;
		total: number;
	}

	let { open = $bindable(), name, streak, minutes, total }: Props = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	const rise = (name: 'il-rise1' | 'il-rise2' | 'il-rise3', secs: number, delay: number) =>
		`animation:${name} ${secs}s cubic-bezier(.2,.8,.2,1) ${delay}s both`;
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="cel-title"
	onclose={() => (open = false)}
	class="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-[#0e0c09]/70 backdrop:backdrop-blur-sm"
>
	<div class="flex h-full overflow-y-auto p-5">
		<button
			type="button"
			class="absolute inset-0 cursor-default"
			aria-label={m.cel_close()}
			onclick={() => (open = false)}
		></button>
		<div
			data-keep-dark="fixed"
			class="il-motion relative m-auto w-[min(100%,460px)] overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_50%_30%,#2e271d,#0f0d0a_78%)] px-7 pt-[clamp(22px,5vh,40px)] pb-[clamp(20px,4vh,32px)] text-center text-[#f5eee0] shadow-[0_30px_80px_rgba(0,0,0,.5)]"
		>
			<div
				class="pointer-events-none absolute -top-[60px] left-1/2 size-[340px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,198,115,.3),transparent_62%)]"
				aria-hidden="true"
			></div>
			<div
				class="relative mx-auto flex size-[clamp(68px,13vh,96px)] items-end justify-center rounded-full border-[1.5px] border-amber/70 pb-[clamp(12px,2.6vh,22px)]"
				style={rise('il-rise2', 0.9, 0.1)}
			>
				<LampFlame size={46} mode="lit" />
			</div>
			<p
				class="relative mt-[clamp(12px,3vh,22px)] text-[10.5px] font-semibold tracking-[.18em] text-[#e8b061]"
				style={rise('il-rise1', 0.8, 0.25)}
			>
				{m.cel_label({ done: total, total })}
			</p>
			<h2
				id="cel-title"
				class="relative mt-2 font-serif text-[clamp(28px,5vh,36px)]/[1.15]"
				style={rise('il-rise2', 0.85, 0.35)}
			>
				{m.cel_title()}
			</h2>
			<p
				class="relative mt-2.5 text-sm/relaxed text-[#f2ebdd]/70"
				style={rise('il-rise2', 0.85, 0.45)}
			>
				{name ? m.cel_body({ name }) : m.cel_body_anon()}
			</p>
			<dl
				class="relative mt-[clamp(12px,3vh,22px)] flex justify-center gap-7"
				style={rise('il-rise3', 0.9, 0.55)}
			>
				<div>
					<dd class="font-serif text-[28px] text-amber-light">{streak}</dd>
					<dt class="text-xs text-[#f2ebdd]/55">{m.cel_streak()}</dt>
				</div>
				<div class="w-px bg-[#f2ebdd]/12" aria-hidden="true"></div>
				<div>
					<dd class="font-serif text-[28px] text-amber-light">{minutes}</dd>
					<dt class="text-xs text-[#f2ebdd]/55">{m.cel_minutes()}</dt>
				</div>
			</dl>
			<p
				class="relative mt-[clamp(12px,3vh,22px)] font-serif text-lg/[1.6] text-[#f2ebdd]/80 italic"
				style={rise('il-rise2', 0.9, 0.65)}
			>
				{m.lamp_dedication()}
			</p>
			<div
				class="relative mt-[clamp(14px,3.4vh,26px)] flex gap-2.5"
				style={rise('il-rise3', 0.95, 0.78)}
			>
				<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
				<a
					href={localizeHref('/practice/lamp')}
					class="flex-1 rounded-full bg-amber py-3.5 text-sm font-medium text-[#1a1611] transition-colors hover:bg-[#e6a94e]"
				>
					{m.cel_lamp()}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
				<button
					type="button"
					onclick={() => (open = false)}
					class="flex-1 cursor-pointer rounded-full border border-[#f2ebdd]/22 py-3.5 text-sm font-medium transition-colors hover:bg-[#f2ebdd]/6"
				>
					{m.cel_close()}
				</button>
			</div>
		</div>
	</div>
</dialog>
