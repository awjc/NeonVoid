#!/usr/bin/env python3
"""
Simple HTTP server for NeonVoid WebGL app
Run with: python server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers to allow local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f"[NeonVoid] {format % args}")

def main():
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 NeonVoid server starting...")
            print(f"📡 Serving at http://localhost:{PORT}")
            print(f"📂 Directory: {os.getcwd()}")
            print(f"🌐 Opening browser...")
            print(f"⏹️  Press Ctrl+C to stop the server\n")
            
            # Open browser automatically
            webbrowser.open(f"http://localhost:{PORT}")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port:")
            print(f"   python server.py")
            print(f"   Or kill the process using port {PORT}")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()