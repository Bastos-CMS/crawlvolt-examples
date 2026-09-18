const item = $input.first().json;
if (typeof item.hash !== 'string' || !/^[a-f0-9]{64}$/.test(item.hash)) {
  throw new Error('Expected a SHA-256 hash from the Crypto node.');
}
if ($execution.mode !== 'production') {
  return [{ json: { ...item, change: 'preview', needs_update: false,
    note: 'Manual preview: static data is not persisted. Use a published scheduled execution to verify changes.' } }];
}
const state = $getWorkflowStaticData('global');
state.pages ??= {};
const previous = state.pages[item.source_url];
const change = !previous ? 'baseline' : previous.hash === item.hash ? 'unchanged' : 'changed';
state.pages[item.source_url] = { hash: item.hash };
return [{ json: { ...item, change, needs_update: change !== 'unchanged' } }];
