import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { humanBytes, pool, publicUrl, transformUrl } from './lib.mjs';

const MANIFEST = fileURLToPath(new URL('./manifest.json', import.meta.url));
const ACCEPT = 'image/avif,image/webp,image/*,*/*;q=0.8';
const KB = 1024;

function rules(key) {
	if (key.startsWith('screenshots/')) {
		return { width: 2000, quality: 62, maxTransformBytes: 180 * KB };
	}
	if (key === 'logo.png') {
		return { width: 60, quality: 80, maxTransformBytes: 15 * KB };
	}
	if (key === 'og.jpg') {
		return { width: 1200, quality: 82, maxDirectBytes: 200 * KB };
	}
	return { width: 2000, quality: 60, maxTransformBytes: 150 * KB };
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
	const result = { key: entry.key, checks: [], problems: [] };

	const direct = await head(publicUrl(entry.key));
	result.direct = direct;
	const directType = (direct.headers.get('content-type') ?? '').toLowerCase();
	if (!direct.ok || !directType.startsWith('image/')) {
		result.problems.push(`direct: HTTP ${describe(direct)}`);
	}
	const directLength = lengthOf(direct);
	if (limits.maxDirectBytes && (!directLength || directLength > limits.maxDirectBytes)) {
		result.problems.push(
			`direct size ${directLength ? humanBytes(directLength) : 'unknown'} > ${humanBytes(limits.maxDirectBytes)}`
		);
	}

	const transformed = await head(
		transformUrl(entry.key, { width: limits.width, quality: limits.quality }),
		{ accept: ACCEPT }
	);
	result.transform = transformed;
	const transformType = (transformed.headers.get('content-type') ?? '').toLowerCase();
	if (!transformed.ok) {
		result.problems.push(`transform: HTTP ${describe(transformed)}`);
	} else if (transformType !== 'image/avif') {
		result.problems.push(`transform content-type is ${transformType || 'empty'}, expected image/avif`);
	}
	const transformLength = lengthOf(transformed);
	if (limits.maxTransformBytes && transformed.status === 200) {
		if (!transformLength) {
			result.problems.push('transform size is unknown');
		} else if (transformLength > limits.maxTransformBytes) {
			result.problems.push(
				`transform size ${humanBytes(transformLength)} > ${humanBytes(limits.maxTransformBytes)} at width ${limits.width}`
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
	if (result.direct) console.log(`     direct    ${describe(result.direct)}`);
	if (result.transform) {
		console.log(
			`     transform ${describe(result.transform)} (width ${limits.width}, quality ${limits.quality})`
		);
	}
	for (const problem of result.problems) console.log(`     ${problem}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\nchecked: ${results.length}, ok: ${results.length - failed.length}, failed: ${failed.length}`);
if (failed.length) {
	for (const result of failed) console.log(`  ${result.key}`);
	process.exit(1);
}
