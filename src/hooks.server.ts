import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { refreshTokens } from '$lib/server/api/auth';
import {
	REFRESH_COOKIE,
	TOKEN_COOKIE,
	endSession,
	getSessionUser,
	setTokens
} from '$lib/server/auth/session';
import { getTextDirection } from '$lib/paraglide/runtime';
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
	const refresh = cookies.get(REFRESH_COOKIE);

	// The access cookie is short-lived; renew it from the refresh token (which rotates).
	if (!cookies.get(TOKEN_COOKIE) && refresh) {
		try {
			setTokens(cookies, await refreshTokens(event.fetch, refresh));
		} catch (e) {
			// Only drop the session when the backend rejected the token, not on an outage.
			if (e instanceof ApiError && e.status !== 0 && e.status < 500) endSession(cookies);
		}
	}

	event.locals.user = getSessionUser(cookies);
	return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleParaglide);
