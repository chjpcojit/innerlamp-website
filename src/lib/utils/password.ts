/** 0 = too short, 1–4 = increasing strength. */
export function passwordScore(pw: string): 0 | 1 | 2 | 3 | 4 {
	if (pw.length < 8) return 0;
	const extra = +/[A-Z]/.test(pw) + +/\d/.test(pw) + +/[^A-Za-z0-9]/.test(pw);
	return Math.min(4, 1 + extra) as 1 | 2 | 3 | 4;
}
