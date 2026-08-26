# -*- coding: utf-8 -*-
"""Static server for local preview that tells the browser not to cache.

The site ships as plain files with no build step and no content hashes, so a
browser will happily hold on to an old data file while you are editing it.
Run this instead of python -m http.server while working on the data.

    python tools/devserver.py [port]
"""
import functools
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        if '"GET' in (fmt % args) and ' 200 ' not in (fmt % args):
            sys.stderr.write("%s\n" % (fmt % args))


socketserver.TCPServer.allow_reuse_address = True
handler = functools.partial(NoCache, directory=ROOT)
with socketserver.TCPServer(("", PORT), handler) as httpd:
    print("serving %s at http://localhost:%d with caching off" % (ROOT, PORT), flush=True)
    httpd.serve_forever()
