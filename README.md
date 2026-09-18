# CrawlVolt examples

Small Python, Node.js and n8n examples for turning web pages into Markdown and preparing content for a retrieval pipeline. These are the downloadable examples from the [CrawlVolt guides](https://www.crawlvolt.com/blog?utm_source=github&utm_medium=referral&utm_campaign=first_users_202609&utm_content=examples).

## Try the local RAG example first

This command needs Node.js 20+ and no API key, network request or package install:

```bash
node prepare_rag.mjs rag-sample.md https://example.com/refund-policy chunks.jsonl
```

Open `chunks.jsonl`. Each line contains a source URL, stable document ID, content hash and chunk text. The script refuses to overwrite an existing file. It does not create embeddings or update a vector database; see the [RAG guide](https://www.crawlvolt.com/blog/website-content-rag) for replacement and version-filtering strategies.

## Extract a page

1. [Create a CrawlVolt account](https://www.crawlvolt.com/en/signup?next=%2Fen%2Fconsole%2Fapi-keys).
2. [Create an API key](https://www.crawlvolt.com/en/console/api-keys) and save it when shown.
3. Set the key in your terminal. In Bash or zsh, the following prompt hides the key while you paste it:

```bash
read -r -s CRAWLVOLT_API_KEY
export CRAWLVOLT_API_KEY
```

Run either example on the included public demonstration page:

```bash
# Python 3: standard library only; writes Markdown to stdout.
python3 page_to_markdown.py https://www.crawlvolt.com/examples/product-demo.html

# Node.js 20+: no packages; creates page.md without overwriting it.
node page_to_markdown.mjs https://www.crawlvolt.com/examples/product-demo.html page.md
```

API calls consume account credits; inspect [current pricing](https://www.crawlvolt.com/pricing) and [Activity](https://www.crawlvolt.com/en/console/activity). On a timeout, check Activity before retrying. Use public pages you own or have permission to collect.

## Pick an example

| Goal | File | Guide |
| --- | --- | --- |
| Python page to Markdown | [page_to_markdown.py](page_to_markdown.py) | [Python](https://www.crawlvolt.com/blog/website-to-markdown-python) |
| Node.js page to Markdown | [page_to_markdown.mjs](page_to_markdown.mjs) | [Node.js](https://www.crawlvolt.com/blog/website-to-markdown-nodejs) |
| Bounded documentation collection | [collect_docs.mjs](collect_docs.mjs) | [Documentation](https://www.crawlvolt.com/blog/crawl-documentation-website) |
| Markdown to versioned JSONL chunks | [prepare_rag.mjs](prepare_rag.mjs) | [RAG](https://www.crawlvolt.com/blog/website-content-rag) |
| Typed product fields | [extract_product.mjs](extract_product.mjs) | [Structured JSON](https://www.crawlvolt.com/blog/extract-structured-json) |
| Click, wait and extract rendered content | [rendered_page.mjs](rendered_page.mjs) | [Rendered pages](https://www.crawlvolt.com/blog/scrape-javascript-rendered-pages) |
| One-page n8n extraction | [workflow JSON](crawlvolt-one-page-markdown.workflow.json) | [n8n](https://www.crawlvolt.com/blog/website-markdown-n8n) |
| Scheduled n8n change detection | [workflow JSON](crawlvolt-content-refresh.workflow.json) | [Refresh](https://www.crawlvolt.com/blog/refresh-website-content-n8n) |

Keep the JavaScript files together: the request examples import the helper in `page_to_markdown.mjs`.

## n8n setup and limits

Import one workflow JSON into your own n8n instance. On the HTTP Request node, create a Header Auth credential named `Authorization` with value `Bearer YOUR_CRAWLVOLT_API_KEY`. Credentials are not included in these files.

The refresh workflow is inactive. Manual execution returns a preview and does not prove persisted change detection. Configure and publish it only when you intend scheduled requests to run and consume credits. Validate successive published runs in your own instance. The stored hash represents the observed page, not successful downstream indexing; track the last indexed version separately.

## Validation and support

The local RAG example runs without an account. The original guide suite checks request handling and transformations with controlled responses. These checks are not a claim that a scheduled n8n workflow has run in your environment or that a live authenticated request will succeed for every site.

[Quickstart](https://www.crawlvolt.com/docs/quickstart) · [Errors and quotas](https://www.crawlvolt.com/docs/errors-quotas) · [Contact](mailto:contact@crawlvolt.com)
