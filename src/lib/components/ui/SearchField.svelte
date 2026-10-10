<script lang="ts">
	interface Props {
		value: string;
		label: string;
		placeholder: string;
	}

	let { value = $bindable(), label, placeholder }: Props = $props();
</script>

<label
	class="flex h-[46px] w-[min(100%,340px)] items-center gap-2.5 rounded-[14px] border border-ink/10 bg-paper px-4 text-[13.5px]"
>
	<span class="sr-only">{label}</span>
	<span class="size-[11px] flex-none rounded-full border-[1.5px] border-ink/40" aria-hidden="true"
	></span>
	<input
		type="search"
		bind:value
		{placeholder}
		class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/40"
	/>
</label>
