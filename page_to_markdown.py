import json
import os
import sys
import uuid
from urllib.request import Request, urlopen

url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
operation_id = os.environ.get("CRAWLVOLT_OPERATION_ID") or str(uuid.uuid4())
request = Request(
    "https://www.crawlvolt.com/v1/scrape",
    data=json.dumps({"url": url, "formats": ["markdown"]}).encode("utf-8"),
    headers={
        "Authorization": "Bearer " + os.environ["CRAWLVOLT_API_KEY"],
        "Content-Type": "application/json",
        "Idempotency-Key": operation_id,
    },
    method="POST",
)
with urlopen(request, timeout=60) as response:
    result = json.load(response)

markdown = result.get("outputs", {}).get("markdown")
if not isinstance(markdown, str) or not markdown.strip():
    raise ValueError("No Markdown returned; inspect the request in Activity.")
print(markdown)
