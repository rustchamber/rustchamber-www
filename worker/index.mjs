const ASSET_ORIGIN = 'https://assets-projects.lipecode.com';
const PROJECT_PREFIX = 'rustchamber';
const MAX_AGE = 31536000;
const MIN_WIDTH = 16;
const MAX_WIDTH = 4096;

const SOURCES = {
	'bg-header-art': { file: 'bg-header-art.png', quality: 92 },
	logo: { file: 'logo.png', quality: 90 }
};

const IMAGE_PATH = /^\/img\/(.+)\.webp$/;
const SIZED_NAME = /^(.*)-(\d+)$/;

const DEFAULT_QUALITY = 95;

function resolveSource(name) {
	const known = SOURCES[name];
	if (known) return known;
	if (name.startsWith('screenshots/')) {
		return { file: `${name}.webp`, quality: DEFAULT_QUALITY };
	}
	return null;
}

function sourceUrl(file) {
	return `${ASSET_ORIGIN}/${PROJECT_PREFIX}/${file.split('/').map(encodeURIComponent).join('/')}`;
}

export default {
	async fetch(request) {
		const url = new URL(request.url);
		if (request.method !== 'GET' && request.method !== 'HEAD') {
			return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
		}

		const path = url.pathname.match(IMAGE_PATH);
		const sized = path?.[1].match(SIZED_NAME);
		const width = Number(sized?.[2]);
		const source = sized ? resolveSource(sized[1]) : null;

		if (!path || !sized || !source || !Number.isFinite(width)) {
			return new Response('Not found', { status: 404 });
		}
		if (width < MIN_WIDTH || width > MAX_WIDTH) {
			return new Response(`Width must be between ${MIN_WIDTH} and ${MAX_WIDTH}`, { status: 400 });
		}

		const cache = caches.default;
		const cacheKey = new Request(`${url.origin}${url.pathname}`, { method: 'GET' });
		const cached = await cache.match(cacheKey);
		if (cached) {
			return request.method === 'HEAD'
				? new Response(null, { status: cached.status, headers: cached.headers })
				: cached;
		}

		const upstream = await fetch(sourceUrl(source.file), {
			cf: {
				image: { width, quality: source.quality, format: 'webp', fit: 'scale-down' },
				cacheEverything: true,
				cacheTtl: MAX_AGE
			}
		});

		if (!upstream.ok) {
			return new Response(`Image unavailable (${upstream.status})`, { status: 502 });
		}

		const headers = {
			'content-type': 'image/webp',
			'cache-control': `public, max-age=${MAX_AGE}, immutable`
		};
		const length = upstream.headers.get('content-length');
		if (length) headers['content-length'] = length;

		if (request.method === 'HEAD') {
			return new Response(null, { headers });
		}

		const response = new Response(upstream.body, { headers });
		await cache.put(cacheKey, response.clone());
		return response;
	}
};
