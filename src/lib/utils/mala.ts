export const MALA_TOTAL = 108;
const BEADS = 27;

export interface MalaBead {
	x: number;
	y: number;
	size: number;
	filled: boolean;
	isCurrent: boolean;
}

/** 27 beads (4 recitations each) on a ring of `size` px, plus the larger guru bead at the bottom. */
export function malaRing(count: number, size: number) {
	const done = Math.floor(count / 4);
	const current = count % 4 ? done : done - 1;
	const s = size * 0.085;
	const r = size / 2 - s * 0.75;
	const items: MalaBead[] = Array.from({ length: BEADS }, (_, i) => {
		const angle = Math.PI / 2 + ((i + 1) / (BEADS + 1)) * Math.PI * 2;
		const isCurrent = i === current && count > 0;
		const d = isCurrent ? s * 1.25 : s;
		return {
			x: size / 2 + r * Math.cos(angle) - d / 2,
			y: size / 2 + r * Math.sin(angle) - d / 2,
			size: d,
			filled: i < done || (i === done && count % 4 !== 0),
			isCurrent
		};
	});
	const guru = s * 1.5;
	return { items, guru, guruX: size / 2 - guru / 2, guruY: size / 2 + r - guru / 2 };
}
