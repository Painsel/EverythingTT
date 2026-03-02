import time
import os
import shutil
import random
import concurrent.futures
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --- CONFIGURATION ---
TARGET_URL = "https://terri-ex-rate.pagedrop.io/"
HEADLESS_MODE = False 
LIKE_DISPLAY_SELECTOR = "#pagedrop-likes-display"
LIKE_BTN_SELECTOR = "#pagedrop-like-btn"
CHROME_VERSION = 145 # Forced version based on terminal logs

def acquire_lock(lock_file):
    """Simple file-based lock for Windows to prevent UC initialization race conditions."""
    while True:
        try:
            # Try to create the lock file
            fd = os.open(lock_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            return fd
        except FileExistsError:
            time.sleep(random.uniform(0.5, 2.0))

def release_lock(fd, lock_file):
    """Release the file-based lock."""
    os.close(fd)
    try: os.remove(lock_file)
    except: pass

def purge_profiles():
    """Finds and deletes all bot_profile_* directories in the current folder."""
    print("[System] Purging existing bot profiles...")
    for item in os.listdir():
        if item.startswith("bot_profile_") and os.path.isdir(item):
            path = os.path.abspath(item)
            try:
                # Add a small retry loop for Windows file locks
                for _ in range(3):
                    try:
                        shutil.rmtree(path)
                        print(f"[System] Purged: {item}")
                        break
                    except:
                        time.sleep(1)
            except Exception as e:
                print(f"[System] Failed to purge {item}: {e}")

def run_bot(args):
    """
    Automates a single bot instance. 
    Args: tuple (bot_id, mode)
    """
    bot_id, mode = args
    lock_path = os.path.abspath("uc_init.lock")
    
    print(f"[Bot {bot_id}] Waiting for initialization lock...")
    lock_fd = acquire_lock(lock_path)
    
    driver = None
    user_data_dir = os.path.abspath(os.path.join(os.getcwd(), f"bot_profile_{bot_id}"))
    
    try:
        print(f"[Bot {bot_id}] Lock acquired. Initializing driver (v{CHROME_VERSION})...")
        
        if os.path.exists(user_data_dir):
            try: shutil.rmtree(user_data_dir)
            except: pass

        options = uc.ChromeOptions()
        if HEADLESS_MODE:
            options.add_argument("--headless")
        
        options.add_argument(f"--user-data-dir={user_data_dir}")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=390,844") # iPhone 12 Pro size
        
        # Mobile User Agent
        options.add_argument("--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")

        driver = None
        try:
            driver = uc.Chrome(options=options, version_main=CHROME_VERSION)
            
            # --- MOBILE EMULATION ---
            # Set touch events and mobile metrics
            driver.execute_cdp_cmd("Emulation.setTouchEmulationEnabled", {"enabled": True, "configuration": "mobile"})
            driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 3,
                "mobile": True
            })

            print(f"[Bot {bot_id}] Driver initialized with mobile emulation.")
            
        except Exception as e:
            print(f"[Bot {bot_id}] Initialization FAILED: {str(e)}")
            raise e
        finally:
            release_lock(lock_fd, lock_path)

        try:
            # 1. Force the URL load
            print(f"[Bot {bot_id}] Opening {TARGET_URL}...")
            driver.get(TARGET_URL)
            
            # 2. Checkpoint Resolution
            print(f"[Bot {bot_id}] Monitoring Vercel challenge...")
            for _ in range(12): 
                if "Just a moment" not in driver.title and "pagedrop.io" in driver.current_url:
                    print(f"[Bot {bot_id}] Challenge resolved.")
                    break
                time.sleep(5)

            wait = WebDriverWait(driver, 40)
            
            # --- MODE SPECIFIC LOGIC ---
            if mode == "visit":
                print(f"[Bot {bot_id}] Visit mode active. Staying on page for 30s...")
                time.sleep(30)
                return

            # 3. Handle Iframe Search
            time.sleep(5)
            found_element = None
            try:
                found_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, LIKE_DISPLAY_SELECTOR)))
            except:
                iframes = driver.find_elements(By.TAG_NAME, "iframe")
                for iframe in iframes:
                    try:
                        driver.switch_to.frame(iframe)
                        found_element = driver.find_element(By.CSS_SELECTOR, LIKE_DISPLAY_SELECTOR)
                        break
                    except:
                        driver.switch_to.default_content()
            
            if not found_element:
                raise Exception("Timeout: Widget elements not found.")

            # 4. Action Sequence
            time.sleep(2)
            print(f"[Bot {bot_id}] Attempting mobile touch/click on display...")
            
            # Fallback to touch event emulation for mobile buttons
            try:
                driver.execute_script("""
                    var el = arguments[0];
                    var box = el.getBoundingClientRect();
                    var x = box.left + box.width / 2;
                    var y = box.top + box.height / 2;
                    el.dispatchEvent(new TouchEvent('touchstart', {bubbles: true, cancelable: true, touches: [{clientX: x, clientY: y}]}));
                    el.dispatchEvent(new TouchEvent('touchend', {bubbles: true, cancelable: true, touches: [{clientX: x, clientY: y}]}));
                    el.click();
                """, found_element)
            except:
                driver.execute_script("arguments[0].click();", found_element)

            time.sleep(4)
            try:
                like_btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, LIKE_BTN_SELECTOR)))
            except:
                like_btn = driver.find_element(By.CSS_SELECTOR, LIKE_BTN_SELECTOR)

            print(f"[Bot {bot_id}] Attempting mobile touch/click on like button...")
            try:
                driver.execute_script("""
                    var el = arguments[0];
                    var box = el.getBoundingClientRect();
                    var x = box.left + box.width / 2;
                    var y = box.top + box.height / 2;
                    el.dispatchEvent(new TouchEvent('touchstart', {bubbles: true, cancelable: true, touches: [{clientX: x, clientY: y}]}));
                    el.dispatchEvent(new TouchEvent('touchend', {bubbles: true, cancelable: true, touches: [{clientX: x, clientY: y}]}));
                    el.click();
                """, like_btn)
            except:
                driver.execute_script("arguments[0].click();", like_btn)
            
            print(f"[Bot {bot_id}] Like button clicked! Task complete.")
            
            time.sleep(15) 

        except Exception as e:
            print(f"[Bot {bot_id}] Runtime FAILED: {str(e)}")
            try: driver.save_screenshot(f"bot_{bot_id}_failure.png")
            except: pass
        finally:
            if driver:
                try: driver.quit()
                except: pass
            try: shutil.rmtree(user_data_dir)
            except: pass
            print(f"[Bot {bot_id}] Instance terminated.")
    except Exception as outer_e:
        print(f"[Bot {bot_id}] Outer Error: {str(outer_e)}")
        # Release lock if it was acquired but not released
        try: release_lock(lock_fd, lock_path)
        except: pass


def main():
    print("--- Territorial Appraiser Stealth Automator ---")
    
    # Purge existing profiles before starting
    purge_profiles()
    
    # Mode selection
    print("\nSelect Mode:")
    print("1. Like (Perform display click + upvote)")
    print("2. Visit (Only open and stay on page)")
    mode_choice = input("Enter selection (1 or 2, default 1): ").strip()
    mode = "visit" if mode_choice == "2" else "like"

    user_input = input("\nEnter number of bots (default 1): ").strip()
    num_bots = int(user_input) if user_input.isdigit() else 1

    print(f"\nStarting {num_bots} bots in '{mode}' mode concurrently...\n")

    # Use ProcessPoolExecutor for true multi-instance performance with UC
    # Create list of tuples (bot_id, mode) for each process
    bot_args = [(i, mode) for i in range(1, num_bots + 1)]

    with concurrent.futures.ProcessPoolExecutor(max_workers=num_bots) as executor:
        executor.map(run_bot, bot_args)

    print("\n--- All bot sessions concluded ---")

if __name__ == "__main__":
    main()
