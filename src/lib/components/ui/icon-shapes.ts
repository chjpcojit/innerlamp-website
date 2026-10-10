/**
 * Geometry of the InnerLamp icon set, ported 1:1 from the prototype (`Icon.dc.html`).
 * Every icon is drawn on a 44×44 grid out of absolutely positioned shapes.
 */
export type IconKind =
	| 'book'
	| 'talk'
	| 'med'
	| 'lamp'
	| 'mo'
	| 'beads'
	| 'bell'
	| 'journal'
	| 'progress'
	| 'lotus'
	| 'tree'
	| 'plus'
	| 'calendar'
	| 'gear'
	| 'temple'
	| 'notif'
	| 'wheel'
	| 'buddha'
	| 'photo'
	| 'article'
	| 'chat'
	| 'routine';

export interface IconShape {
	x: number;
	y: number;
	w: number;
	h: number;
	/** CSS `border-radius` value. */
	radius?: string;
	/** `tone` = icon colour, `cut` = knocked-out detail, `dot` = notification dot. */
	fill?: 'tone' | 'cut' | 'dot';
	/** `ring` = faint track, `arc` = progress arc (both are 4px borders instead of a fill). */
	border?: 'ring' | 'arc';
	/** Width in px of a tone-coloured outline (box-sizing: border-box, no fill). */
	outline?: number;
	/** With `outline`: leave the right edge open, like the routine clock. */
	openRight?: boolean;
	/** CSS-border triangle; `w`/`h` are ignored. `up` = flat bottom, `down` = flat top. */
	tri?: { dir: 'up' | 'down'; l: number; r: number; h: number; fill?: 'tone' | 'cut' };
	skewY?: number;
	rotate?: number;
	origin?: string;
	opacity?: number;
}

const s = (
	x: number,
	y: number,
	w: number,
	h: number,
	radius?: string,
	extra: Partial<IconShape> = {}
): IconShape => ({ x, y, w, h, radius, ...extra });

const tri = (
	x: number,
	y: number,
	dir: 'up' | 'down',
	l: number,
	r: number,
	h: number,
	fill: 'tone' | 'cut' = 'cut'
): IconShape => ({ x, y, w: 0, h: 0, tri: { dir, l, r, h, fill } });

const FLAME = '50% 50% 45% 45% / 62% 62% 38% 38%';
const PETAL = '50% 50% 50% 50% / 70% 70% 30% 30%';

const beads = (): IconShape[] =>
	Array.from({ length: 9 }, (_, i) => {
		const a = Math.PI / 2 + ((i + 1) / 10) * Math.PI * 2;
		return s(22 + 11 * Math.cos(a) - 2.5, 20 + 11 * Math.sin(a) - 2.5, 5, 5, '50%');
	}).concat(s(20, 35, 4, 5, '1px'));

export const ICON_SHAPES: Record<IconKind, IconShape[]> = {
	book: [
		s(9, 13, 12, 18, '3px 1px 1px 3px', { skewY: 8 }),
		s(23, 13, 12, 18, '1px 3px 3px 1px', { skewY: -8 })
	],
	talk: [
		s(10, 18, 4, 8, '2px'),
		s(17, 12, 4, 20, '2px'),
		s(24, 15, 4, 14, '2px'),
		s(31, 19, 4, 6, '2px')
	],
	med: [s(18, 9, 8, 8, '50%'), s(15, 19, 14, 10, '7px 7px 3px 3px'), s(9, 28, 26, 7, '999px')],
	lamp: [s(18, 8, 8, 13, FLAME), s(10, 24, 24, 9, '0 0 12px 12px'), s(19, 33, 6, 3)],
	mo: [
		s(6, 11, 25, 19, '50% 50% 46% 46% / 56% 56% 44% 44%'),
		s(10, 21, 17, 2, '1px', { fill: 'cut' }),
		s(32, 27, 2, 13, '1px', { rotate: -40, origin: '50% 0' }),
		s(29, 23, 6, 6, '50%')
	],
	beads: beads(),
	bell: [
		s(13, 10, 18, 18, '9px 9px 2px 2px'),
		s(9, 28, 26, 3, '2px'),
		s(19, 32, 6, 5, '0 0 3px 3px')
	],
	journal: [
		s(12, 9, 20, 26, '3px'),
		s(16, 16, 12, 2, '1px', { fill: 'cut' }),
		s(16, 21, 9, 2, '1px', { fill: 'cut' })
	],
	progress: [
		s(10, 10, 24, 24, '50%', { border: 'ring' }),
		s(10, 10, 24, 24, '50%', { border: 'arc', rotate: 20 })
	],
	lotus: [
		s(17, 9, 10, 20, PETAL),
		s(10, 13, 9, 17, PETAL, { rotate: -38, origin: '50% 100%', opacity: 0.8 }),
		s(25, 13, 9, 17, PETAL, { rotate: 38, origin: '50% 100%', opacity: 0.8 }),
		s(11, 31, 22, 3, '2px')
	],
	tree: [
		s(18, 8, 8, 8, '50%'),
		s(21, 15, 2, 9),
		s(13, 23, 18, 2),
		s(13, 23, 2, 6),
		s(29, 23, 2, 6),
		s(10, 28, 8, 8, '50%'),
		s(26, 28, 8, 8, '50%')
	],
	plus: [s(12, 20, 20, 4, '2px'), s(20, 12, 4, 20, '2px')],
	calendar: [
		s(11, 12, 22, 21, '4px'),
		s(16, 9, 3, 6, '2px'),
		s(25, 9, 3, 6, '2px'),
		s(11, 17, 22, 2, undefined, { fill: 'cut' }),
		s(19, 23, 6, 6, '50%', { fill: 'cut' })
	],
	gear: [
		s(13, 13, 18, 18, '4px'),
		s(13, 13, 18, 18, '4px', { rotate: 45 }),
		s(18, 18, 8, 8, '50%', { fill: 'cut' })
	],
	temple: [
		s(20.5, 8, 3, 6, '2px'),
		s(7, 13, 30, 7, '50% 50% 2px 2px / 100% 100% 2px 2px'),
		s(12, 20, 20, 14, '1px'),
		s(19, 25, 6, 9, '3px 3px 0 0', { fill: 'cut' })
	],
	notif: [
		s(13, 11, 18, 17, '9px 9px 2px 2px'),
		s(10, 27, 24, 3, '2px'),
		s(19, 31, 6, 4, '0 0 3px 3px'),
		s(27, 8, 8, 8, '50%', { fill: 'dot' })
	],
	wheel: [
		s(9, 9, 26, 26, '50%', { outline: 3.5 }),
		s(21, 11, 2, 22, '1px'),
		s(21, 11, 2, 22, '1px', { rotate: 45 }),
		s(21, 11, 2, 22, '1px', { rotate: 90 }),
		s(21, 11, 2, 22, '1px', { rotate: 135 }),
		s(18, 18, 8, 8, '50%')
	],
	buddha: [
		s(12, 6, 20, 20, '50%', { outline: 2, opacity: 0.55 }),
		s(17, 11, 10, 10, '50%'),
		s(13, 21, 18, 10, '9px 9px 3px 3px'),
		s(8, 30, 28, 6, '999px')
	],
	photo: [
		s(9, 11, 26, 22, '4px'),
		s(26, 15, 5, 5, '50%', { fill: 'cut' }),
		tri(13, 21, 'up', 7, 7, 9),
		tri(20, 24, 'up', 5, 5, 6)
	],
	article: [
		s(12, 8, 20, 28, '3px 8px 3px 3px'),
		s(16, 14, 12, 2, '1px', { fill: 'cut' }),
		s(16, 19, 12, 2, '1px', { fill: 'cut' }),
		s(16, 24, 12, 2, '1px', { fill: 'cut' }),
		s(16, 29, 7, 2, '1px', { fill: 'cut' })
	],
	chat: [
		s(8, 10, 28, 19, '9px'),
		tri(13, 27, 'down', 3, 6, 7, 'tone'),
		s(14, 18, 4, 4, '50%', { fill: 'cut' }),
		s(20, 18, 4, 4, '50%', { fill: 'cut' }),
		s(26, 18, 4, 4, '50%', { fill: 'cut' })
	],
	routine: [
		s(9, 9, 26, 26, '50%', { outline: 3, openRight: true, rotate: -45 }),
		s(21, 14, 2.5, 9, '2px'),
		s(21, 21, 7, 2.5, '2px'),
		s(31, 8, 5, 5, '50%', { opacity: 0.6 })
	]
};
