<script lang="ts">
	interface Props {
		/** Outer diameter in px. */
		size?: number;
		/** Ring and flame colours for dark backgrounds (auth aside). */
		onDark?: boolean;
		class?: string;
	}

	let { size = 32, onDark = false, class: className = '' }: Props = $props();

	// Unique per instance so several marks on one page never share (or lose) a gradient.
	const uid = $props.id();
	const gid = `il-flame-${uid}`;
</script>

<!--
	Logo from the prototype (Logo InnerLamp → "Logo đang dùng"): a gold ring with a glowing flame
	sitting in its lower half. All measurements are fractions of the 136px reference artwork.
-->
<span
	class="relative box-border flex flex-none items-end justify-center rounded-full {className}"
	style:width="{size}px"
	style:height="{size}px"
	style:border="max(1.5px, {size * (5 / 136)}px) solid {onDark ? '#D9963C' : 'var(--color-gold)'}"
	style:padding-bottom="{size * (30 / 136) - Math.max(0, 1.5 - size * (5 / 136))}px"
	style:background="radial-gradient(circle at 50% 74%, rgba(217,150,60,.22), transparent 66%)"
	aria-hidden="true"
>
	<svg
		viewBox="0 0 40 56"
		style:width="{size * (36 / 136)}px"
		style:height="{size * (50 / 136)}px"
		style:filter="drop-shadow(0 0 {size * 0.09}px rgba(217,150,60,.8))"
	>
		<defs>
			<linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#F3C673" />
				<stop offset="1" stop-color="#D9963C" />
			</linearGradient>
		</defs>
		<path
			d="M23 1C25 11 36 19 36 34c0 12-8 20-16 20S4 47 4 37c0-9 6-14 9-21 2 7 5 10 8 11-2-9-2-17 2-26z"
			fill="url(#{gid})"
		/>
	</svg>
</span>
