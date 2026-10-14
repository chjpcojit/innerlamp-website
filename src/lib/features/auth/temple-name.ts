// Proper-name prefixes of Vietnamese temples. These are part of the temple's name (data),
// not UI copy, so they are intentionally not translated.
const PREFIX = /^(chùa|thiền viện|tịnh xá|niệm phật đường|tu viện)(\s|$)/i;
const DEFAULT_PREFIX = 'Chùa';

/** Trims, collapses spaces and prepends "Chùa" unless the name already starts with a temple prefix. */
export function normalizeTempleName(raw: string): string {
	const name = raw.trim().replace(/\s+/g, ' ');
	return PREFIX.test(name) ? name : `${DEFAULT_PREFIX} ${name}`;
}
