import { pathToFileURL } from 'node:url';
import { request, requireMarkdown } from './page_to_markdown.mjs';

export const renderActions = [
  { action: 'click', selector: '#load-details' },
  { action: 'wait', selector: '#result[data-ready=true]', timeout_ms: 10_000 },
];

export function requireRenderedPage(result) {
  if (!Array.isArray(result?.action_results) || result.action_results.length !== renderActions.length ||
      result.action_results.some((action, index) => action.ok !== true || action.action !== renderActions[index].action)) {
    throw new Error('A browser action failed or its result is missing. Inspect action_results.');
  }
  const markdown = requireMarkdown(result);
  if (!markdown.includes('Ready for collection: 42 items.')) {
    throw new Error('The expected demo content is missing from the rendered output.');
  }
  return markdown;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const url = process.argv[2] || 'https://www.crawlvolt.com/examples/rendered-demo.html';
    const result = await request('browse', {
      url, actions: renderActions, formats: ['markdown'], timeout_secs: 30,
    });
    console.log(requireRenderedPage(result));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
