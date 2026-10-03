#!/usr/bin/env python3
"""Verify initial HTML metadata without executing JavaScript."""
import json
import time
import http.client
import urllib.error
import os
import urllib.request
import urllib.parse
from html.parser import HTMLParser

class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.meta[attrs.get("property", attrs.get("name", ""))] = attrs.get("content", "")

def read(url, headers=None):
    request_headers = {"User-Agent": "Mozilla/5.0 ZemZemPreviewVerifier/1.0",
                       "Cache-Control": "no-cache"}
    request_headers.update(headers or {})
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers=request_headers)
            with urllib.request.urlopen(request, timeout=25) as response:
                return response.read().decode("utf-8")
        except (http.client.RemoteDisconnected, urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(2)

catalog = json.loads(read(
    "https://ysvtrhizgcioyycwlkrk.supabase.co/rest/v1/storefront_ebooks"
    "?select=id,title,cover_url&order=created_at.desc&limit=100",
    {"apikey": "sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD"}))
books = [b for b in catalog if b.get("cover_url")][:2]
assert books, "No public eBook covers available for preview verification"
for book in books:
    query = urllib.parse.urlencode({"id": book["id"], "verify": os.environ["GITHUB_SHA"]})
    url = "https://www.zemzem.al/ebook.html?" + query
    raw = read(url, {"User-Agent": "facebookexternalhit/1.1",
                     "Cache-Control": "no-cache"})
    parser = Metadata()
    parser.feed(raw)
    assert "ZemZem server eBook preview v1" in raw, "Server rewrite is not active"
    assert parser.meta.get("og:title") == book["title"] + " – eBook | ZemZem", "Wrong initial title"
    expected_image = urllib.parse.urljoin("https://www.zemzem.al/", book["cover_url"])
    assert parser.meta.get("og:image") == expected_image, "Missing or wrong initial cover"
    assert parser.meta.get("og:description"), "Missing initial description"
    assert 'id="ebookDetail"' in raw, "Storefront template missing"
    print("Verified initial Facebook preview:", book["title"])
    with urllib.request.urlopen(urllib.request.Request(
        expected_image, headers={"User-Agent": "facebookexternalhit/1.1"}),
        timeout=25) as response:
        assert response.headers.get_content_type().startswith("image/"), "Cover is not a public image"
    print("Verified public cover image")
generic = read("https://www.zemzem.al/ebook.html?verify=" + os.environ["GITHUB_SHA"])
assert 'id="ebookDetail"' in generic, "Generic page no longer works"
print("EBOOK_SERVER_PREVIEW_OK=yes")
