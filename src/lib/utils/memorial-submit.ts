export interface MemorialSubmitState {
	/** A request is already in flight. */
	pending: boolean;
	/** The form passed its local validation. */
	valid: boolean;
}

/**
 * The single gate before a memorial form POST. Once `pending` is true a second submit is refused,
 * so a double click cannot create two entries. / Chặn gửi lần hai khi request đang chạy.
 */
export function canStartMemorialSubmit({ pending, valid }: MemorialSubmitState): boolean {
	return valid && !pending;
}
