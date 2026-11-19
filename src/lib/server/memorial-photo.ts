import type { MemorialDTO } from '$lib/types/memorial';

export type PhotoLookup = () => Promise<Pick<MemorialDTO, 'photo_url'>>;

/**
 * Reads the current signed URL on every call. There is deliberately no server cache: replacing or
 * deleting a portrait must be visible immediately, and no invalidation hook is needed.
 * / Đọc URL mới mỗi lần; không cache để thay/xoá ảnh không bị URL cũ.
 */
export async function currentPhotoUrl(lookup: PhotoLookup): Promise<string | null> {
	const dto = await lookup();
	return dto.photo_url ?? null;
}
