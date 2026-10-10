<script lang="ts">
	interface Props {
		checked: boolean;
		label: string;
		onchange: (next: boolean) => void;
	}

	let { checked, label, onchange }: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	onclick={() => onchange(!checked)}
	class="relative h-6 w-[42px] flex-none cursor-pointer rounded-full transition-colors duration-150 {checked
		? 'bg-gold'
		: 'bg-ink/16'}"
>
	<span
		class="absolute top-0.5 size-5 rounded-full bg-paper shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-[left] duration-150 {checked
			? 'left-5'
			: 'left-0.5'}"
	></span>
</button>
