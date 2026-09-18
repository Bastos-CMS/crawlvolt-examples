import { pathToFileURL } from 'node:url';
import { request } from './page_to_markdown.mjs';

export const productSchema = {
  fields: {
    name: { selector: 'main h1', required: true },
    price: { selector: '[itemprop=price]', type: 'number', required: true },
    currency: { selector: '[itemprop=priceCurrency]', source: 'attribute', attribute: 'content', required: true },
    in_stock: { selector: '[data-available]', source: 'attribute', attribute: 'data-available', type: 'boolean', required: true },
    details_url: { selector: 'a[data-details]', source: 'attribute', attribute: 'href', type: 'url', required: true },
  },
};

export function requireProduct(result) {
  const structured = result?.outputs?.structured;
  if (structured?.valid !== true) {
    throw new Error(`Extraction failed validation: ${JSON.stringify(structured?.errors ?? [])}`);
  }
  const data = structured.data;
  if (typeof data?.name !== 'string' || !data.name.trim() ||
      typeof data.price !== 'number' || !Number.isFinite(data.price) ||
      typeof data.currency !== 'string' || typeof data.in_stock !== 'boolean' ||
      typeof data.details_url !== 'string') {
    throw new Error('Unexpected product types. Inspect outputs.structured.');
  }
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const url = process.argv[2] || 'https://www.crawlvolt.com/examples/product-demo.html';
    const result = await request('scrape', { url, formats: ['structured'], extract: productSchema });
    console.log(JSON.stringify(requireProduct(result), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
