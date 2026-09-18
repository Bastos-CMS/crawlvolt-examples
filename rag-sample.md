# A small documentation collection

This sample document belongs to the CrawlVolt RAG preparation guide. It is a local teaching fixture, not a customer dataset or a benchmark result.

## Keep a source URL

Each document needs the public URL from which it was collected. Keep that URL beside the Markdown so a later search result can point back to its source. Use a consistent URL for repeated collections of the same page.

## Inspect the text

Open the Markdown before indexing it. Check that the useful headings, paragraphs and code samples survived extraction. A page can return text successfully while containing only a loading message or navigation menu.

## Replace old versions

When a document changes, prepare and inspect the new chunks before replacing the old version in your index. Preserve the document identity, record a new content hash and remove obsolete chunks after the replacement succeeds.

## Test retrieval

Write three questions that the document should answer. Search for those questions and inspect the returned passages. If the relevant passage cannot be retrieved, adding answer generation will not fix the missing context.

## Review chunk boundaries

Simple character windows can split a table or a code block. Read the first and last chunks and inspect any boundary near a long example. Use a Markdown-aware splitter when the structure of your source matters to retrieval.

## Separate the steps

Collection, cleaning, chunking, embedding, retrieval and answer generation are separate operations. Check the output of each step before relying on the next one. This sample only exercises the local chunking step and does not call an embedding model or create a chatbot.
