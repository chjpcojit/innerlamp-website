/**
 * The memorial pages may carry a relative photo URL only, but the entry and its dates are personal
 * data: keep them out of shared caches and stop the browser from sending the page as a referrer.
 * / Trang sổ giỗ là dữ liệu cá nhân: không cache chia sẻ, không gửi referrer.
 */
export const MEMORIAL_PAGE_HEADERS: Record<string, string> = {
	'Cache-Control': 'private, no-store',
	'Referrer-Policy': 'no-referrer'
};

export const memorialPageHeaders = (): Record<string, string> => ({ ...MEMORIAL_PAGE_HEADERS });
