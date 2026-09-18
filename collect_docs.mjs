import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicUrl, request, requireMarkdown } from './page_to_markdown.mjs';

export async function collectDocs(url, directory, call = request) {
  const start = publicUrl(url);
  const path = start.pathname.replace(/\/$/, '');
  const maxPages = 5;
  // Refuse an existing output directory before making any paid request.
  await mkdir(directory);
  const mapped = await call('map', {
    url: start.href,
    max_pages: maxPages,
    max_depth: 2,
    include_patterns: path ? [path, `${path}/*`] : ['/*'],
    exclude_patterns: ['*/archive/*'],
    timeout_secs: 20,
  }, { timeoutMs: 130_000 });
  await writeFile(join(directory, 'map.json'), JSON.stringify(mapped, null, 2));
  if (!Array.isArray(mapped.links)) throw new Error('Map returned no links array; inspect map.json.');
  const urls = [...new Set(mapped.links.map((link) => link.url))].filter((value) => {
    try {
      const candidate = publicUrl(value);
      return candidate.origin === start.origin &&
        (candidate.pathname === path || candidate.pathname.startsWith(`${path}/`));
    } catch { return false; }
  }).slice(0, maxPages);
  const report = {
    start_url: start.href,
    map: { status: mapped.status, truncated: mapped.truncated, stop_reason: mapped.stop_reason },
    credits_reported: mapped.credits_used ?? 0,
    pages: [],
    failures: (mapped.failures ?? []).map((failure) => ({ stage: 'map', ...failure })),
    stopped_early: false,
    unattempted: [],
  };
  const saveReport = () => writeFile(join(directory, 'manifest.json'), JSON.stringify(report, null, 2));
  await saveReport();
  for (const sourceUrl of urls) {
    try {
      const result = await call('scrape', {
        url: sourceUrl, formats: ['markdown'], only_main_content: true,
      });
      report.credits_reported += result.credits_used ?? 0;
      const markdown = requireMarkdown(result);
      const filename = `${createHash('sha256').update(sourceUrl).digest('hex').slice(0, 16)}.md`;
      await writeFile(join(directory, filename), markdown, { flag: 'wx' });
      report.pages.push({ source_url: sourceUrl, markdown_file: filename, characters: markdown.length });
    } catch (error) {
      report.failures.push({ stage: 'scrape', url: sourceUrl, error: error.message });
      if ([401, 402, 403, 429].includes(error.status) || error.name === 'TimeoutError') {
        report.stopped_early = true;
        report.unattempted = urls.slice(urls.indexOf(sourceUrl) + 1);
      }
    }
    await saveReport();
    if (report.stopped_early) break;
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [url = 'https://www.crawlvolt.com/docs', directory = 'docs-sample'] = process.argv.slice(2);
    const report = await collectDocs(url, directory);
    console.log(`${report.pages.length} saved, ${report.failures.length} failures. Inspect ${directory}/manifest.json.`);
    if (!report.pages.length || report.failures.length || report.stopped_early) process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
