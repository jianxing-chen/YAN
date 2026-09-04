#!/usr/bin/env python3
"""衍 · server — a no-cache static server, so the palace always shows its latest self.

用法 · usage:  python3 serve.py [port]     (默认 8130)
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8130


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, max-age=0, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # keep the vigil quiet


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"衍 · 无尽之殿 — http://localhost:{PORT}/")
        httpd.serve_forever()
