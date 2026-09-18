import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export function prepareChunks(markdown, source, size = 1200, overlap = 150) {
  const url = new URL(source);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Provide the public HTTP(S) source URL.');
  }
  url.hash = '';
  if (!Number.isInteger(size) || !Number.isInteger(overlap) || size < 1 || overlap < 0 || overlap >= size) {
    throw new Error('Chunk size must be positive and overlap must be smaller than size.');
  }
  const normalized = markdown.replace(/\r\n?/g, '\n').trim();
  if (!normalized) throw new Error('The Markdown file is empty.');
  const characters = Array.from(normalized);
  const documentId = sha256(url.href);
  const contentHash = sha256(normalized);
  const title = normalized.match(/^#\s+(.+)$/m)?.[1] ?? url.pathname;
  const chunks = [];
  for (let start = 0; start < characters.length; start += size - overlap) {
    const text = characters.slice(start, start + size).join('');
    chunks.push({
      id: sha256(`${documentId}:${contentHash}:${size}:${overlap}:${start}`),
      document_id: documentId,
      content_sha256: contentHash,
      source_url: url.href,
      title,
      chunk_index: chunks.length,
      start_character: start,
      end_character: Math.min(start + size, characters.length),
      text,
    });
    if (start + size >= characters.length) break;
  }
  return chunks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [file, source, output = 'chunks.jsonl'] = process.argv.slice(2);
    if (!file || !source) throw new Error('Usage: node prepare_rag.mjs page.md https://source.example/page chunks.jsonl');
    const chunks = prepareChunks(await readFile(file, 'utf8'), source);
    await writeFile(output, chunks.map((chunk) => JSON.stringify(chunk)).join('\n') + '\n', { flag: 'wx' });
    console.log(`Saved ${chunks.length} chunks to ${output}. Review the text before indexing.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
