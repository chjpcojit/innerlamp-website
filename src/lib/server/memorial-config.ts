import { env } from '$env/dynamic/private';

/**
 * Portrait routes were deployed on 2026-11-17 and smoke-tested on dev on 2026-11-19. The switch is
 * on unless explicitly set to `false`, which is the kill switch for UI, actions and proxy.
 * / Cờ ảnh: bật mặc định; `MEMORIAL_PHOTO_ENABLED=false` để tắt UI/action/proxy.
 */
export const memorialPhotoEnabled = (): boolean =>
	env.MEMORIAL_PHOTO_ENABLED === undefined || env.MEMORIAL_PHOTO_ENABLED === ''
		? true
		: env.MEMORIAL_PHOTO_ENABLED === 'true';
