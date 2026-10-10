<script lang="ts">
	import { ICON_SHAPES, type IconKind, type IconShape } from './icon-shapes';

	interface Props {
		kind: IconKind;
		/** Colour of the glyph. */
		tone?: string;
		/** Background of the rounded tile. Pass `transparent` for a bare glyph. */
		tint?: string;
		/** Tile size in px; the 44px glyph grid is scaled to fit. */
		size?: number;
		class?: string;
	}

	let {
		kind,
		tone = '#B8862F',
		tint = 'rgba(184,134,47,.14)',
		size = 44,
		class: className = ''
	}: Props = $props();

	const CUT = '#F7F2E8';
	const DOT = '#C2857F';

	function shapeStyle(sh: IconShape, color: string): string {
		const css = [`left:${sh.x}px`, `top:${sh.y}px`, `width:${sh.w}px`, `height:${sh.h}px`];
		if (sh.radius) css.push(`border-radius:${sh.radius}`);
		if (sh.tri) {
			const { dir, l, r, h, fill } = sh.tri;
			const solid = fill === 'tone' ? color : CUT;
			const edge = dir === 'up' ? 'bottom' : 'top';
			css.push(
				`border-left:${l}px solid transparent`,
				`border-right:${r}px solid transparent`,
				`border-${edge}:${h}px solid ${solid}`
			);
		} else if (sh.outline) {
			css.push('box-sizing:border-box', `border:${sh.outline}px solid ${color}`);
			if (sh.openRight) css.push('border-right-color:transparent');
		} else if (sh.border === 'ring')
			css.push('box-sizing:border-box', 'border:4px solid rgba(34,30,25,.12)');
		else if (sh.border === 'arc')
			css.push(
				'box-sizing:border-box',
				'border:4px solid transparent',
				`border-top-color:${color}`,
				`border-right-color:${color}`
			);
		else if (sh.fill === 'cut') css.push(`background:${CUT}`);
		else if (sh.fill === 'dot') css.push(`background:${DOT}`, `box-shadow:0 0 0 2px ${CUT}`);
		else css.push(`background:${color}`);
		const transform = [sh.skewY && `skewY(${sh.skewY}deg)`, sh.rotate && `rotate(${sh.rotate}deg)`]
			.filter(Boolean)
			.join(' ');
		if (transform) css.push(`transform:${transform}`);
		if (sh.origin) css.push(`transform-origin:${sh.origin}`);
		if (sh.opacity !== undefined) css.push(`opacity:${sh.opacity}`);
		return css.join(';');
	}
</script>

<span
	class="relative block flex-none overflow-hidden {className}"
	style:width="{size}px"
	style:height="{size}px"
	style:border-radius="{Math.round(size * 0.3)}px"
	style:background={tint}
	aria-hidden="true"
>
	<span
		class="absolute top-0 left-0 block size-11 origin-top-left"
		style:transform="scale({size / 44})"
	>
		{#each ICON_SHAPES[kind] as shape, i (i)}
			<span class="absolute block" style={shapeStyle(shape, tone)}></span>
		{/each}
	</span>
</span>
