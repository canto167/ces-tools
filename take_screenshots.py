import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PORT = 8123
ROOT = r'C:\Users\Admin\Documents\CES-Tools\ces-tools'

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)
    def log_message(self, format, *args):
        pass # suppress server logs

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

# Start local server in background thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(0.5)

slug = 'rc-beam'
out_dir = os.path.join(ROOT, 'screenshots', slug)
os.makedirs(out_dir, exist_ok=True)

target_url = f'http://localhost:{PORT}/calculators/{slug}/'
print('Navigating to:', target_url)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome')

    # 1. Desktop Light (1280px)
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, color_scheme='light')
    page.goto(target_url)
    page.wait_for_timeout(500)
    p1 = os.path.join(out_dir, 'desktop-light-1280.png')
    page.screenshot(path=p1, full_page=True)
    print('Saved:', p1)
    page.close()

    # 2. Desktop Dark (1280px)
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, color_scheme='dark')
    page.goto(target_url)
    page.wait_for_timeout(500)
    p2 = os.path.join(out_dir, 'desktop-dark-1280.png')
    page.screenshot(path=p2, full_page=True)
    print('Saved:', p2)
    page.close()

    # 3. Mobile Light (375px)
    page = browser.new_page(viewport={'width': 375, 'height': 812}, color_scheme='light')
    page.goto(target_url)
    page.wait_for_timeout(500)
    p3 = os.path.join(out_dir, 'mobile-light-375.png')
    page.screenshot(path=p3, full_page=True)
    print('Saved:', p3)
    page.close()

    # 4. Mobile Dark (375px)
    page = browser.new_page(viewport={'width': 375, 'height': 812}, color_scheme='dark')
    page.goto(target_url)
    page.wait_for_timeout(500)
    p4 = os.path.join(out_dir, 'mobile-dark-375.png')
    page.screenshot(path=p4, full_page=True)
    print('Saved:', p4)
    page.close()

    browser.close()

print('All screenshots taken successfully!')
