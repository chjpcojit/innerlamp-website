const SIZE = 25;

/** One QR finder pattern (7×7 ring + 3×3 core) anchored at (cx, cy); `null` outside it. */
function finder(x: number, y: number, cx: number, cy: number): boolean | null {
	const dx = x - cx;
	const dy = y - cy;
	if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
	return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
}

/**
 * Deterministic 25×25 placeholder QR pattern (row-major). It is NOT a scannable payload —
 * replace with a backend-issued code.
 */
export function placeholderQr(seed: number): boolean[] {
	const cells: boolean[] = [];
	let s = seed;
	for (let y = 0; y < SIZE; y++) {
		for (let x = 0; x < SIZE; x++) {
			let v = finder(x, y, 0, 0) ?? finder(x, y, 18, 0) ?? finder(x, y, 0, 18);
			if (v === null) {
				if (
					((x === 7 || y === 7) && x < 8 && y < 8) ||
					(x === 17 && y < 8) ||
					(y === 17 && x < 8)
				) {
					v = false;
				} else {
					s = (s * 1103515245 + 12345) & 0x7fffffff;
					v = s % 100 < 47;
				}
			}
			cells.push(v);
		}
	}
	return cells;
}
