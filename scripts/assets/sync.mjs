import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	humanBytes,
	objectExists,
	pool,
	publicUrl,
	putObject,
	r2Config
} from './lib.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MANIFEST = fileURLToPath(new URL('./manifest.json', import.meta.url));

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const force = argv.includes('--force');
const onlyArg = argv.find((arg) => arg.startsWith('--only='));
const only = onlyArg
	? onlyArg
			.slice('--only='.length)
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean)
	: null;

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const entries = (Array.isArray(manifest) ? manifest : manifest.assets)
	.filter((entry) => !only || only.includes(entry.key))
	.slice()
	.sort((a, b) => a.key.localeCompare(b.key));

if (!entries.length) {
	console.error(only ? `No manifest entries match: ${only.join(', ')}` : 'Manifest is empty');
	process.exit(1);
}

const missing = [];
for (const entry of entries) {
	const source = path.join(ROOT, entry.source);
	try {
		const info = await stat(source);
		if (!info.isFile()) missing.push(`${entry.source} (not a file)`);
		entry.size = info.size;
	} catch {
		missing.push(entry.source);
	}
}

if (missing.length) {
	console.error(`Missing sources (${missing.length}):`);
	for (const source of missing) console.error(`  ${source}`);
	process.exit(1);
}

const { bucket, prefix } = r2Config();
const validated = entries.map((entry) => `${entry.source} -> ${prefix}/${entry.key}`);
console.log(`manifest: ${entries.length} assets, bucket ${bucket}, prefix ${prefix}/`);
for (const line of validated) console.log(`  ${line}`);
console.log('');

async function upload(entry) {
	const result = { key: entry.key, size: entry.size, status: 'pending' };
	try {
		if (dryRun) {
			result.status = 'would-upload';
			return result;
		}
		if (!force && (await objectExists(entry.key))) {
			result.status = 'exists';
			return result;
		}
		const body = await readFile(path.join(ROOT, entry.source));
		await putObject(entry.key, body, entry.contentType);
		result.size = body.byteLength;
		result.status = 'uploaded';
		return result;
	} catch (error) {
		result.status = 'failed';
		result.reason = error.message;
		return result;
	}
}

const results = await pool(entries, 4, upload);
const failed = results.filter((result) => result.status === 'failed');
const uploaded = results.filter((result) => result.status === 'uploaded');
const existing = results.filter((result) => result.status === 'exists');
const pending = results.filter((result) => result.status === 'would-upload');
const bytes = [...uploaded, ...pending].reduce((total, result) => total + result.size, 0);

console.log(`${dryRun ? 'dry run' : 'sync'}: ${results.length} assets`);
console.log(`  ${dryRun ? 'would upload' : 'uploaded'}: ${dryRun ? pending.length : uploaded.length}`);
console.log(`  skipped (exists): ${existing.length}`);
console.log(`  failed: ${failed.length}`);
console.log(`  bytes: ${humanBytes(bytes)}${dryRun ? ' (pending)' : ''}`);

for (const result of results) {
	const suffix =
		result.status === 'exists'
			? 'skipped (already present)'
			: result.status === 'failed'
				? `failed: ${result.reason}`
				: result.status === 'would-upload'
					? `would upload ${humanBytes(result.size)}`
					: `uploaded ${humanBytes(result.size)}`;
	console.log(`  [${result.status}] ${result.key} - ${suffix}`);
	console.log(`    ${publicUrl(result.key)}`);
}

if (failed.length) {
	console.error(`\n${failed.length} asset(s) failed`);
	process.exit(1);
}
