import { createHash, createHmac } from 'node:crypto';

export const CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=86400';
export const DEFAULT_ENDPOINT =
	'https://cdb43b73053a4ce4ffb620649568c034.r2.cloudflarestorage.com';
export const DEFAULT_BUCKET = 'assets-projects-lipecode';
export const DEFAULT_PUBLIC_URL = 'https://assets-projects.lipecode.com';
export const DEFAULT_PROJECT_PREFIX = 'rustchamber';

function env(name, fallback) {
	const value = process.env[name];
	return value && value.trim() ? value.trim() : fallback;
}

export function r2Config() {
	return {
		endpoint: env('R2_ENDPOINT', DEFAULT_ENDPOINT).replace(/\/+$/, ''),
		bucket: env('R2_BUCKET', DEFAULT_BUCKET),
		publicBaseUrl: env('R2_PUBLIC_URL', DEFAULT_PUBLIC_URL).replace(/\/+$/, ''),
		prefix: env('R2_PROJECT_PREFIX', DEFAULT_PROJECT_PREFIX).replace(/^\/+|\/+$/g, ''),
		accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim() ?? '',
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim() ?? ''
	};
}

function credentials() {
	const { accessKeyId, secretAccessKey } = r2Config();
	if (!accessKeyId || !secretAccessKey) {
		throw new Error('Missing R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY in environment');
	}
	return { accessKeyId, secretAccessKey };
}

export function objectKey(key) {
	const { prefix } = r2Config();
	const clean = key.replace(/^\/+/, '');
	return prefix ? `${prefix}/${clean}` : clean;
}

function encodeKey(key) {
	return key
		.replace(/^\/+/, '')
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

export function publicUrl(key) {
	const { publicBaseUrl } = r2Config();
	return `${publicBaseUrl}/${encodeKey(objectKey(key))}`;
}

export function transformUrl(key, { width, quality }) {
	const { publicBaseUrl } = r2Config();
	return `${publicBaseUrl}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${encodeKey(objectKey(key))}`;
}

function sha256Hex(value) {
	return createHash('sha256').update(value).digest('hex');
}

function hmac(key, value) {
	return createHmac('sha256', key).update(value).digest();
}

function uriEncode(value) {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
	);
}

function signR2({ method, key, body = new Uint8Array(), extraHeaders = {} }) {
	const { endpoint, bucket } = r2Config();
	const { accessKeyId, secretAccessKey } = credentials();
	const now = new Date();
	const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = sha256Hex(body);
	const canonicalUri = `/${bucket}/${objectKey(key)
		.split('/')
		.map(uriEncode)
		.join('/')}`;
	const host = new URL(endpoint).host;

	const headersToSign = {
		host,
		'x-amz-content-sha256': payloadHash,
		'x-amz-date': amzDate
	};
	for (const [name, value] of Object.entries(extraHeaders)) {
		if (value !== undefined && value !== null && value !== '') {
			headersToSign[name.toLowerCase()] = String(value);
		}
	}

	const sortedNames = Object.keys(headersToSign).sort();
	const canonicalHeaders = sortedNames
		.map((name) => `${name}:${headersToSign[name].trim()}\n`)
		.join('');
	const signedHeaders = sortedNames.join(';');
	const canonicalRequest = [
		method,
		canonicalUri,
		'',
		canonicalHeaders,
		signedHeaders,
		payloadHash
	].join('\n');
	const scope = `${dateStamp}/auto/s3/aws4_request`;
	const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
	const signingKey = hmac(
		hmac(hmac(hmac(`AWS4${secretAccessKey}`, dateStamp), 'auto'), 's3'),
		'aws4_request'
	);
	const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

	const headers = {
		...headersToSign,
		authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
	};
	delete headers.host;

	return { url: `${endpoint}${canonicalUri}`, headers };
}

export async function objectExists(key) {
	const { url, headers } = signR2({ method: 'HEAD', key });
	const response = await fetch(url, { method: 'HEAD', headers });
	if (response.status === 404) return false;
	if (!response.ok) {
		throw new Error(`HEAD ${objectKey(key)} failed: ${response.status} ${response.statusText}`);
	}
	return true;
}

export async function putObject(key, body, contentType) {
	const { url, headers } = signR2({
		method: 'PUT',
		key,
		body,
		extraHeaders: {
			'content-type': contentType,
			'cache-control': CACHE_CONTROL
		}
	});
	const response = await fetch(url, { method: 'PUT', headers, body });
	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(
			`PUT ${objectKey(key)} failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
		);
	}
	return response;
}

export function humanBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes < 0) return '?';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export async function pool(items, concurrency, worker) {
	const results = new Array(items.length);
	let next = 0;
	const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await worker(items[index], index);
		}
	});
	await Promise.all(runners);
	return results;
}
