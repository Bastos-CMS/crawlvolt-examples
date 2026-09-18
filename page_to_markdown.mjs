import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function publicUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Use an HTTP(S) URL without embedded credentials.');
  }
  url.hash = '';
  return url;
}

export async function request(endpoint, payload, {
  key = process.env.CRAWLVOLT_API_KEY,
  operationId = randomUUID(),
  timeoutMs = 60_000,
  fetchImpl = fetch,
} = {}) {
  if (!key?.trim()) throw new Error('Set CRAWLVOLT_API_KEY first.');
  if (!['scrape', 'map', 'browse'].includes(endpoint)) throw new Error('Unknown endpoint.');
  publicUrl(payload.url);
  const response = await fetchImpl(`https://www.crawlvolt.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': operationId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const error = new Error(`CrawlVolt returned HTTP ${response.status}. Check Activity before retrying.`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function requireMarkdown(result) {
  const markdown = result?.outputs?.markdown;
  if (typeof markdown !== 'string' || !markdown.trim()) {
    throw new Error('No Markdown returned. Inspect the page and request in Activity.');
  }
  return markdown;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [url = 'https://example.com', output = 'page.md'] = process.argv.slice(2);
    const result = await request('scrape', { url, formats: ['markdown'], only_main_content: true }, {
      operationId: process.env.CRAWLVOLT_OPERATION_ID || randomUUID(),
    });
    await writeFile(output, requireMarkdown(result), { encoding: 'utf8', flag: 'wx' });
    console.log(`Saved ${output}. Credits reported: ${result.credits_used ?? 'see Activity'}.`);
  } catch (error) {
    console.error(error.name === 'TimeoutError' ? 'Request timed out. Check Activity before retrying.' : error.message);
    process.exitCode = 1;
  }
}
