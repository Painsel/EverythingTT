import os
import psutil
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import time

# List of common desktop automation and bypass tools (Java, Python, C#, etc.)
AUTOMATION_PROCESSES = [
    "chromedriver.exe", "geckodriver.exe", "msedgedriver.exe", # WebDrivers
    "selenium", "puppeteer", "playwright",                   # Automation Frameworks
    "autoit", "autohotkey", "ahk",                          # Macro Tools
    "pyautogui", "pynput",                                  # Python Input Tools
    "winappdriver", "appium",                               # Mobile/Desktop Automation
    "java", "javaw",                                        # Often used for Java-based automation
    "python", "pythonw",                                    # Python-based scripts
    "sharp", "csharp", "dotnet"                             # C#-based automation (heuristics)
]

def scan_processes():
    detected = []
    for proc in psutil.process_iter(['name', 'exe', 'cmdline']):
        try:
            pinfo = proc.info
            name = pinfo['name'].lower()
            
            # Check for direct name matches
            for tool in AUTOMATION_PROCESSES:
                if tool in name:
                    detected.append({
                        "name": pinfo['name'],
                        "type": "Automation Tool",
                        "pid": proc.pid
                    })
                    break
            
            # Heuristic: Check cmdline for "selenium", "webdriver", etc.
            if pinfo['cmdline']:
                cmdline = " ".join(pinfo['cmdline']).lower()
                if any(x in cmdline for x in ["selenium", "webdriver", "remote-debugging-port"]):
                    if not any(d['pid'] == proc.pid for d in detected):
                        detected.append({
                            "name": pinfo['name'],
                            "type": "Automation/Remote-Debug",
                            "pid": proc.pid
                        })

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return detected

class ScannerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/scan':
            detected = scan_processes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # Allow browser access
            self.end_headers()
            self.wfile.write(json.dumps(detected).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.end_headers()

def run_server():
    server_address = ('', 8001) # Runs on port 8001
    httpd = HTTPServer(server_address, ScannerHandler)
    print("Desktop Detection Service started on port 8001...")
    httpd.serve_forever()

if __name__ == "__main__":
    # Ensure psutil is installed
    try:
        import psutil
    except ImportError:
        print("Error: 'psutil' library not found. Please install it with: pip install psutil")
        exit(1)

    # Start the local detection server in a separate thread
    run_server()
