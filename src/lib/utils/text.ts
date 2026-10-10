/** Lower-case and strip diacritics (incl. Vietnamese đ) so "chua" matches "Chùa". */
export function fold(value: string): string {
	return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLocaleLowerCase();
}
