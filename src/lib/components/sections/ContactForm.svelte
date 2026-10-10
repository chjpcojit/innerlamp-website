<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { CONTACT_TOPICS } from '$lib/content/contact';
	import Icon from '$lib/components/ui/Icon.svelte';

	interface Props {
		form?: {
			sent?: boolean;
			error?: string;
			name?: string;
			reach?: string;
			message?: string;
			topic?: string;
		} | null;
		/** Display name of the signed-in visitor, used to pre-fill the name field. */
		userName?: string;
	}

	let { form, userName = '' }: Props = $props();

	// "Send another" hides the thank-you panel until the next submit.
	let again = $state(false);
	const sent = $derived(!!form?.sent && !again);

	const name = $derived(form?.name ?? userName);
	const reach = $derived(form?.reach ?? '');
	const message = $derived(form?.sent ? '' : (form?.message ?? ''));
	const topic = $derived(form?.topic ?? CONTACT_TOPICS[0].id);
	const thanks = $derived(
		form?.name ? (form.name.split(/\s+/).at(-1) ?? '') : m.contact_sent_anon()
	);

	const field =
		'w-full rounded-[14px] border bg-paper px-3.5 text-sm text-ink outline-none focus:border-gold';
	const label = 'mb-1.5 block text-xs font-medium text-ink/55';
</script>

<div
	class="min-w-0 flex-[1.6_1_420px] rounded-[22px] border border-ink/8 bg-paper p-[clamp(20px,3vw,28px)]"
>
	{#if sent}
		<div class="flex flex-col items-center gap-2.5 px-2.5 py-8 text-center" role="status">
			<Icon kind="lotus" tone="#4e6c59" tint="rgba(110,143,122,.16)" size={56} />
			<h2 class="font-serif text-[28px] font-medium">{m.contact_sent_title()}</h2>
			<p class="max-w-[380px] text-sm/relaxed text-ink/60">
				{m.contact_sent_text({ name: thanks, reach: form?.reach ?? '' })}
			</p>
			<button
				type="button"
				onclick={() => (again = true)}
				class="mt-1.5 cursor-pointer text-[13px] font-medium text-gold-deep underline underline-offset-2"
			>
				{m.contact_again()}
			</button>
		</div>
	{:else}
		<form
			method="POST"
			novalidate
			class="flex flex-col gap-4"
			use:enhance={() => {
				again = false;
				return async ({ update }) => update({ reset: false });
			}}
		>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
				<div>
					<label for="contact-name" class={label}>{m.contact_name()}</label>
					<input
						id="contact-name"
						name="name"
						autocomplete="name"
						value={name}
						maxlength="100"
						placeholder={m.contact_name_placeholder()}
						class="{field} h-[46px] border-ink/12"
					/>
				</div>
				<div>
					<label for="contact-reach" class={label}>{m.contact_reach()}</label>
					<input
						id="contact-reach"
						name="reach"
						autocomplete="email"
						value={reach}
						maxlength="120"
						placeholder={m.contact_reach_placeholder()}
						aria-invalid={form?.error === 'reach'}
						aria-describedby={form?.error ? 'contact-error' : undefined}
						class="{field} h-[46px] {form?.error === 'reach'
							? 'border-[#c2857f]'
							: 'border-ink/12'}"
					/>
				</div>
			</div>

			<fieldset>
				<legend class={label}>{m.contact_topic()}</legend>
				<div class="flex flex-wrap gap-2">
					{#each CONTACT_TOPICS as t (t.id)}
						<label
							class="cursor-pointer rounded-full border border-ink/12 bg-paper px-4 py-[9px] text-[13px] font-medium whitespace-nowrap text-ink/72 transition-colors has-checked:border-ink has-checked:bg-ink has-checked:text-cream has-focus-visible:ring-2 has-focus-visible:ring-gold"
						>
							<input
								type="radio"
								name="topic"
								value={t.id}
								checked={topic === t.id}
								class="sr-only"
							/>
							{t.label()}
						</label>
					{/each}
				</div>
			</fieldset>

			<div>
				<label for="contact-message" class={label}>{m.contact_message()}</label>
				<textarea
					id="contact-message"
					name="message"
					rows="6"
					maxlength="2000"
					placeholder={m.contact_message_placeholder()}
					aria-invalid={form?.error === 'message'}
					aria-describedby={form?.error ? 'contact-error' : undefined}
					class="{field} h-[150px] resize-y py-3 leading-relaxed {form?.error === 'message'
						? 'border-[#c2857f]'
						: 'border-ink/12'}">{message}</textarea
				>
			</div>

			{#if form?.error}
				<p id="contact-error" role="alert" class="text-[13px] font-medium text-[#a7443f]">
					{form.error === 'reach' ? m.contact_err_reach() : m.contact_err_message()}
				</p>
			{/if}

			<div class="flex flex-wrap items-center justify-between gap-4">
				<p class="text-xs text-ink/48">{m.contact_note()}</p>
				<button
					type="submit"
					class="cursor-pointer rounded-full bg-ink px-6 py-[13px] text-sm font-medium whitespace-nowrap text-cream transition-colors hover:bg-[#3a342c]"
				>
					{m.contact_submit()}
				</button>
			</div>
		</form>
	{/if}
</div>
