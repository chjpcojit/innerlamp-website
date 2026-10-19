/**
 * Event texts (BR-CAL-14): one paragraph / practice per line. Split on line breaks only,
 * never on commas or semicolons; the content carries its own line breaks.
 */
export function paragraphs(text: string): string[] {
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

/** Practices of an event: like `paragraphs`, minus a leading `-`, `•` or `*` on each line. */
export function practices(text: string): string[] {
	return paragraphs(text)
		.map((line) => line.replace(/^[-•*]\s*/, '').trim())
		.filter(Boolean);
}
