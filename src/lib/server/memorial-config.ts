import { env } from '$env/dynamic/private';

/**
 * Portrait routes were coded before deployment; keep the switch off until the D4 smoke test.
 * / Cờ ảnh: tắt cho tới khi smoke D4.
 */
export const memorialPhotoEnabled = (): boolean => env.MEMORIAL_PHOTO_ENABLED === 'true';
