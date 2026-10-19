<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { LEGAL_DOCS, type LegalKind } from '$lib/content/legal';

	interface Props {
		/** Open document, or `null` when closed. */
		kind: LegalKind | null;
	}

	let { kind = $bindable() }: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	let body = $state<HTMLElement>();

	const doc = $derived(kind ? LEGAL_DOCS[kind] : undefined);
	const tabs = $derived([
		{ kind: 'terms' as const, label: m.legal_terms_title() },
		{ kind: 'privacy' as const, label: m.legal_privacy_title() }
	]);

	// Native <dialog> gives focus trap, Escape and inert background. / <dialog> gốc lo focus trap, Escape và nền inert.
	$effect(() => {
		if (!dialog) return;
		if (kind && !dialog.open) dialog.showModal();
		else if (!kind && dialog.open) dialog.close();
	});

	// Switching tab starts the new document from the top. / Đổi tab thì cuộn về đầu văn bản mới.
	$effect(() => {
		void kind;
		body?.scrollTo({ top: 0 });
	});

	const close = () => (kind = null);
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="legal-modal-title"
	onclose={close}
	onclick={(e) => {
		// A click that lands on the dialog itself is a click on the backdrop. / Click trúng chính dialog = click lên nền mờ.
		if (e.target === dialog) close();
	}}
	class="m-auto max-h-[min(720px,90vh)] w-[min(620px,calc(100%-48px))] flex-col overflow-hidden rounded-3xl bg-cream-soft p-0 text-ink shadow-[0_30px_80px_rgba(0,0,0,.3)] backdrop:bg-night/42 open:flex"
>
	{#if doc && kind}
		<header class="flex flex-col gap-3.5 border-b border-ink/8 px-5 pt-5 pb-3.5">
			<div class="flex items-center justify-between gap-3">
				<h2 id="legal-modal-title" class="font-serif text-2xl font-medium">{doc.title()}</h2>
				<button
					type="button"
					onclick={close}
					aria-label={m.legal_modal_close()}
					class="flex size-[34px] flex-none cursor-pointer items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-[#f1e8d8]"
				>
					<span aria-hidden="true">✕</span>
				</button>
			</div>
			<div
				role="group"
				aria-label={m.legal_tabs_label()}
				class="flex gap-1 self-start rounded-full bg-[#f1e8d8] p-1"
			>
				{#each tabs as t (t.kind)}
					<button
						type="button"
						aria-pressed={t.kind === kind}
						onclick={() => (kind = t.kind)}
						class="cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors {t.kind ===
						kind
							? 'bg-paper text-ink shadow-[0_1px_3px_rgba(34,30,25,.12)]'
							: 'text-ink/55 hover:text-ink/80'}"
					>
						{t.label}
					</button>
				{/each}
			</div>
		</header>

		<div bind:this={body} class="flex flex-col gap-[22px] overflow-y-auto px-6 pt-5 pb-6">
			<p class="text-sm/[1.65] text-pretty text-ink/60">{doc.intro()}</p>
			{#each doc.sections as s, i (i)}
				<section>
					<h3 class="font-serif text-xl font-medium">{i + 1}. {s.title()}</h3>
					<div class="mt-2 flex flex-col gap-2">
						{#each s.paragraphs as p, k (k)}
							<p class="text-sm/[1.7] text-pretty text-ink/75">{p()}</p>
						{/each}
					</div>
				</section>
			{/each}
		</div>

		<footer class="flex justify-end border-t border-ink/8 px-5 py-3.5">
			<button
				type="button"
				onclick={close}
				class="flex h-11 cursor-pointer items-center rounded-full bg-ink px-[22px] text-sm font-medium text-cream transition-colors hover:bg-[#3a342c]"
			>
				{m.legal_modal_done()}
			</button>
		</footer>
	{/if}
</dialog>
