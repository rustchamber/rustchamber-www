import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { humanBytes, pool, publicUrl } from './lib.mjs';

const MANIFEST = fileURLToPath(new URL('./manifest.json', import.meta.url));
const SITE = (process.env.SITE_URL?.trim() || 'https://rustchamber.lipecode.com').replace(/\/+$/, '');
const ACCEPT = 'image/webp,image/*,*/*;q=0.8';
const KB = 1024;

function rules(key) {
	if (key.startsWith('screenshots/')) return { width: 2000, maxBytes: 450 * KB };
	if (key === 'logo.png') return { width: 60, maxBytes: 20 * KB };
	return { width: 2000, maxBytes: 900 * KB };
}

function imagePath(key, width) {
	return `${SITE}/img/${key.replace(/\.[^./]+$/, '')}-${width}.webp`;
}

async function head(url, headers = {}, attempts = 3) {
	let lastError;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const response = await fetch(url, { method: 'HEAD', headers, redirect: 'follow' });
			if (response.status >= 500 && attempt < attempts) {
				await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
				continue;
			}
			return response;
		} catch (error) {
			lastError = error;
			if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
		}
	}
	throw lastError ?? new Error(`Failed to fetch ${url}`);
}

function describe(response) {
	const type = response.headers.get('content-type') ?? 'unknown';
	const length = response.headers.get('content-length');
	return `${response.status} ${type} ${length ? humanBytes(Number(length)) : 'unknown size'}`;
}

function lengthOf(response) {
	const value = Number(response.headers.get('content-length'));
	return Number.isFinite(value) && value > 0 ? value : null;
}

async function check(entry) {
	const limits = rules(entry.key);
	const result = { key: entry.key, problems: [] };

	const stored = await head(publicUrl(entry.key));
	result.stored = stored;
	const storedType = (stored.headers.get('content-type') ?? '').toLowerCase();
	if (!stored.ok || !storedType.startsWith('image/')) {
		result.problems.push(`stored: HTTP ${describe(stored)}`);
	}

	const served = await head(imagePath(entry.key, limits.width), { accept: ACCEPT });
	result.served = served;
	const servedType = (served.headers.get('content-type') ?? '').toLowerCase();
	if (!served.ok) {
		result.problems.push(`served: HTTP ${describe(served)}`);
	} else if (servedType !== 'image/webp') {
		result.problems.push(`served content-type is ${servedType || 'empty'}, expected image/webp`);
	}

	const servedLength = lengthOf(served);
	if (served.status === 200) {
		if (!servedLength) {
			result.problems.push('served size is unknown');
		} else if (servedLength > limits.maxBytes) {
			result.problems.push(
				`served size ${humanBytes(servedLength)} > ${humanBytes(limits.maxBytes)} at width ${limits.width}`
			);
		}
	}

	result.limits = limits;
	result.ok = result.problems.length === 0;
	return result;
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const entries = (Array.isArray(manifest) ? manifest : manifest.assets)
	.slice()
	.sort((a, b) => a.key.localeCompare(b.key));

const results = await pool(entries, 4, async (entry) => {
	try {
		return await check(entry);
	} catch (error) {
		return { key: entry.key, problems: [error.message], ok: false };
	}
});

for (const result of results) {
	const limits = result.limits ?? rules(result.key);
	console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${result.key}`);
	if (result.stored) console.log(`     stored    ${describe(result.stored)}`);
	if (result.served) {
		console.log(`     served    ${describe(result.served)} (width ${limits.width})`);
		console.log(`     ${imagePath(result.key, limits.width)}`);
	}
	for (const problem of result.problems) console.log(`     ${problem}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\nchecked: ${results.length}, ok: ${results.length - failed.length}, failed: ${failed.length}`);
if (failed.length) {
	for (const result of failed) console.log(`  ${result.key}`);
	process.exit(1);
}
