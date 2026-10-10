/** Same rule as the prototype's `reachOk`: an email-like string, or 9+ digits/spaces/plus. */
export function isValidReach(value: string): boolean {
	return /\S+@\S+\.\S+/.test(value) || /^[0-9 +]{9,}$/.test(value);
}
