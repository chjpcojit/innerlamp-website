import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { TOKEN_COOKIE, endSession, getSessionUser } from '$lib/server/auth/session';
import { refreshSession } from '$lib/server/auth/refresh';
import { deLocalizeHref, getTextDirection, localizeHref } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	const { cookies } = event;

	// The access cookie is short-lived; renew it from the refresh token (which rotates).
	// A rejected refresh ends the session; an outage keeps the cookies for the next request.
	if (!cookies.get(TOKEN_COOKIE)) {
		const result = await refreshSession(event.fetch, cookies);
		if (result === 'rejected') event.locals.sessionEnded = true;
	}

	event.locals.user = getSessionUser(cookies);
	return resolve(event);
};

// Pages where a signed-out visitor is already in the right place.
const AUTH_PATHS = /^\/(?:[a-z]{2}\/)?(?:login|signup|forgot-password)(?:\/|$)/;

/**
 * When the backend ended the session during this request (refresh rejected, or a Bearer call was
 * still `401` after one refresh), send a page navigation to /login with a notice instead of
 * silently turning the visitor into a guest.
 * / Khi phiên bị kết thúc, chuyển trang sang /login kèm thông báo thay vì âm thầm thành khách.
 */
const handleSessionEnded: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (!event.locals.sessionEnded || event.request.method !== 'GET') return response;

	// For a client-side navigation SvelteKit already strips `/__data.json` from `event.url`.
	const { pathname } = event.url;
	const searchParams = new URLSearchParams(event.url.searchParams);
	searchParams.delete('x-sveltekit-invalidated');
	const search = searchParams.size ? `?${searchParams}` : '';
	const isData = event.isDataRequest;
	const page = pathname.replace(/(.)\/$/, '$1');
	if (AUTH_PATHS.test(page)) return response;
	const wantsHtml = event.request.headers.get('accept')?.includes('text/html');
	if (!isData && !wantsHtml) return response;

	const target = `${localizeHref('/login')}?${new URLSearchParams({
		reason: 'session_ended',
		redirect: `${deLocalizeHref(page)}${search}`
	})}`;
	// SvelteKit's client reads this shape from a data request and navigates there.
	// The cookies cleared while resolving belong on the replacement response too.
	const headers = new Headers({ location: target });
	for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);
	if (isData) {
		headers.delete('location');
		headers.set('content-type', 'application/json');
		return new Response(JSON.stringify({ type: 'redirect', location: target }), { headers });
	}
	return new Response(null, { status: 303, headers });
};

export const handle: Handle = sequence(handleAuth, handleParaglide, handleSessionEnded);

/**
 * Forward the visitor's IP so the backend's per-IP rate limits apply to the visitor, not to
 * this server. The backend trusts the header only when `X-API-Key` is valid.
 * / Chuyển tiếp IP của khách để rate-limit theo IP của backend không tính theo IP của server web.
 *
 * A Bearer call answered `401 UNAUTHORIZED` (expired token, or a session revoked by sign-out or a
 * password reset) is retried once after refreshing; if the refresh is rejected the session ends.
 * / Gọi Bearer trả 401 thì refresh một lần rồi gọi lại; refresh bị từ chối thì kết thúc phiên.
 */
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	if (!env.API_BASE_URL || !request.url.startsWith(env.API_BASE_URL)) return fetch(request);

	try {
		request.headers.set('X-InnerLamp-Client-IP', event.getClientAddress());
	} catch {
		// No client address (e.g. prerender): let the backend use the server's IP.
	}

	// The backend records the browser, not this server, as the device's User-Agent.
	const userAgent = event.request.headers.get('user-agent');
	if (userAgent) request.headers.set('user-agent', userAgent);

	const bearer = request.headers.get('authorization')?.startsWith('Bearer ');
	const isAuthRoute = new URL(request.url).pathname.startsWith('/v1/auth/');
	const retry = bearer && !isAuthRoute ? request.clone() : null;

	const response = await fetch(request);
	if (!retry || response.status !== 401 || !(await isUnauthorized(response))) return response;

	const result = await refreshSession(event.fetch, event.cookies);
	if (result === 'refreshed') {
		const token = event.cookies.get(TOKEN_COOKIE);
		retry.headers.set('authorization', `Bearer ${token}`);
		const second = await fetch(retry);
		if (second.status !== 401) return second;
		// Still refused after a fresh token: the session is gone.
		endSession(event.cookies);
		event.locals.sessionEnded = true;
		return second;
	}
	if (result === 'none') endSession(event.cookies);
	if (result === 'rejected' || result === 'none') event.locals.sessionEnded = true;
	return response;
};

async function isUnauthorized(response: Response): Promise<boolean> {
	const body = (await response
		.clone()
		.json()
		.catch(() => null)) as { error?: { code?: string } } | null;
	return body?.error?.code === 'UNAUTHORIZED';
}
