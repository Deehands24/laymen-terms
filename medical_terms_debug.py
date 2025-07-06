#!/usr/bin/env python3
"""
Medical Terms Website Debugging Script
Creates 10 test accounts and performs medical translations testing
"""

import time
import json
import random
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('medical_terms_debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MedicalTermsDebugger:
    def __init__(self):
        self.base_url = "https://medicalterms.vercel.app"
        self.driver = None
        self.wait = None
        self.results = []
        self.test_accounts = self.generate_test_accounts()
        self.medical_terms = [
            "hypertension", "diabetes", "pneumonia", "asthma", "arthritis",
            "bronchitis", "myocardial infarction", "cerebrovascular accident",
            "gastroenteritis", "dermatitis", "nephritis", "hepatitis",
            "osteoporosis", "fibromyalgia", "tachycardia", "bradycardia",
            "hypoglycemia", "hyperglycemia", "anemia", "leukemia"
        ]
        
    def generate_test_accounts(self):
        """Generate 10 test accounts with different usernames and passwords"""
        accounts = []
        for i in range(1, 11):
            account = {
                "username": f"testuser{i}",
                "password": f"SecurePass{i}!",
                "email": f"test{i}@example.com",
                "first_name": f"Test{i}",
                "last_name": f"User{i}"
            }
            accounts.append(account)
        return accounts
    
    def setup_driver(self):
        """Setup Chrome WebDriver with appropriate options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            logger.info("Chrome WebDriver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize WebDriver: {e}")
            raise
    
    def check_website_accessibility(self):
        """Check if the website is accessible"""
        try:
            response = requests.get(self.base_url, timeout=10)
            logger.info(f"Website status code: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Website accessibility check failed: {e}")
            return False
    
    def find_element_by_multiple_strategies(self, element_identifiers, timeout=10):
        """Try to find an element using multiple strategies"""
        strategies = [
            (By.NAME, "name"),
            (By.ID, "id"),
            (By.CLASS_NAME, "class"),
            (By.CSS_SELECTOR, "css"),
            (By.XPATH, "xpath"),
            (By.LINK_TEXT, "link_text"),
            (By.PARTIAL_LINK_TEXT, "partial_link_text")
        ]
        
        for strategy, key in strategies:
            if key in element_identifiers:
                try:
                    element = WebDriverWait(self.driver, timeout).until(
                        EC.presence_of_element_located((strategy, element_identifiers[key]))
                    )
                    logger.debug(f"Found element using {key}: {element_identifiers[key]}")
                    return element
                except TimeoutException:
                    continue
        
        logger.warning(f"Could not find element with identifiers: {element_identifiers}")
        return None
    
    def analyze_page_structure(self):
        """Analyze the current page structure and find relevant elements"""
        logger.info("Analyzing page structure...")
        
        if not self.driver:
            logger.error("WebDriver not initialized")
            return None
        
        # Get page title and URL
        page_info = {
            "title": self.driver.title,
            "url": self.driver.current_url,
            "timestamp": datetime.now().isoformat()
        }
        
        # Find all forms
        forms = self.driver.find_elements(By.TAG_NAME, "form")
        logger.info(f"Found {len(forms)} forms on the page")
        
        # Find all input fields
        inputs = self.driver.find_elements(By.TAG_NAME, "input")
        input_info = []
        for inp in inputs:
            try:
                input_info.append({
                    "type": inp.get_attribute("type"),
                    "name": inp.get_attribute("name"),
                    "id": inp.get_attribute("id"),
                    "class": inp.get_attribute("class"),
                    "placeholder": inp.get_attribute("placeholder")
                })
            except Exception as e:
                logger.warning(f"Error getting input info: {e}")
        
        # Find all buttons
        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        button_info = []
        for btn in buttons:
            try:
                button_info.append({
                    "text": btn.text,
                    "type": btn.get_attribute("type"),
                    "id": btn.get_attribute("id"),
                    "class": btn.get_attribute("class")
                })
            except Exception as e:
                logger.warning(f"Error getting button info: {e}")
        
        # Find all links
        links = self.driver.find_elements(By.TAG_NAME, "a")
        link_info = []
        for link in links:
            try:
                link_info.append({
                    "text": link.text,
                    "href": link.get_attribute("href"),
                    "id": link.get_attribute("id"),
                    "class": link.get_attribute("class")
                })
            except Exception as e:
                logger.warning(f"Error getting link info: {e}")
        
        structure = {
            "page_info": page_info,
            "forms_count": len(forms),
            "inputs": input_info,
            "buttons": button_info,
            "links": link_info
        }
        
        logger.info(f"Page structure analysis complete")
        return structure
    
    def attempt_account_creation(self, account):
        """Attempt to create an account with various strategies"""
        logger.info(f"Attempting to create account: {account['username']}")
        
        if not self.driver:
            logger.error("WebDriver not initialized")
            return False
        
        # Common registration page indicators
        registration_indicators = [
            "register", "signup", "sign-up", "create-account", "join",
            "registration", "new-user", "account-creation"
        ]
        
        # Try to find registration/signup elements
        for indicator in registration_indicators:
            try:
                # Try to find registration link
                reg_link = self.driver.find_element(By.PARTIAL_LINK_TEXT, indicator.replace("-", " ").title())
                reg_link.click()
                logger.info(f"Found and clicked registration link: {indicator}")
                time.sleep(2)
                break
            except NoSuchElementException:
                try:
                    # Try to find registration button
                    reg_btn = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{indicator}')]")
                    reg_btn.click()
                    logger.info(f"Found and clicked registration button: {indicator}")
                    time.sleep(2)
                    break
                except NoSuchElementException:
                    continue
        
        # Try to fill registration form
        form_filled = False
        
        # Common username field identifiers
        username_fields = {
            "name": "username",
            "id": "username",
            "css": "input[name='username']",
            "xpath": "//input[@placeholder='Username' or @placeholder='User Name']"
        }
        
        username_field = self.find_element_by_multiple_strategies(username_fields)
        if username_field:
            username_field.clear()
            username_field.send_keys(account["username"])
            logger.info(f"Filled username field: {account['username']}")
            form_filled = True
        
        # Common email field identifiers
        email_fields = {
            "name": "email",
            "id": "email",
            "css": "input[type='email']",
            "xpath": "//input[@placeholder='Email' or @placeholder='Email Address']"
        }
        
        email_field = self.find_element_by_multiple_strategies(email_fields)
        if email_field:
            email_field.clear()
            email_field.send_keys(account["email"])
            logger.info(f"Filled email field: {account['email']}")
            form_filled = True
        
        # Common password field identifiers
        password_fields = {
            "name": "password",
            "id": "password",
            "css": "input[type='password']",
            "xpath": "//input[@placeholder='Password']"
        }
        
        password_field = self.find_element_by_multiple_strategies(password_fields)
        if password_field:
            password_field.clear()
            password_field.send_keys(account["password"])
            logger.info(f"Filled password field")
            form_filled = True
        
        # Try to submit the form
        if form_filled:
            try:
                submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit' or contains(text(), 'Submit') or contains(text(), 'Register') or contains(text(), 'Sign Up')]")
                submit_button.click()
                logger.info("Submitted registration form")
                time.sleep(3)
                return True
            except NoSuchElementException:
                try:
                    # Try pressing Enter
                    password_field.send_keys(Keys.RETURN)
                    logger.info("Submitted form using Enter key")
                    time.sleep(3)
                    return True
                except Exception as e:
                    logger.warning(f"Could not submit form: {e}")
        
        return False
    
    def attempt_login(self, account):
        """Attempt to login with the account"""
        logger.info(f"Attempting to login: {account['username']}")
        
        if not self.driver:
            logger.error("WebDriver not initialized")
            return False
        
        # Common login page indicators
        login_indicators = ["login", "sign-in", "signin", "log-in", "enter"]
        
        # Try to find login elements
        for indicator in login_indicators:
            try:
                login_link = self.driver.find_element(By.PARTIAL_LINK_TEXT, indicator.replace("-", " ").title())
                login_link.click()
                logger.info(f"Found and clicked login link: {indicator}")
                time.sleep(2)
                break
            except NoSuchElementException:
                try:
                    login_btn = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{indicator}')]")
                    login_btn.click()
                    logger.info(f"Found and clicked login button: {indicator}")
                    time.sleep(2)
                    break
                except NoSuchElementException:
                    continue
        
        # Try to fill login form
        form_filled = False
        
        # Username/email field
        username_fields = {
            "name": "username",
            "id": "username",
            "css": "input[name='email']",
            "xpath": "//input[@placeholder='Username' or @placeholder='Email']"
        }
        
        username_field = self.find_element_by_multiple_strategies(username_fields)
        if username_field:
            username_field.clear()
            username_field.send_keys(account["username"])
            logger.info(f"Filled login username field")
            form_filled = True
        
        # Password field
        password_fields = {
            "name": "password",
            "id": "password",
            "css": "input[type='password']",
            "xpath": "//input[@placeholder='Password']"
        }
        
        password_field = self.find_element_by_multiple_strategies(password_fields)
        if password_field:
            password_field.clear()
            password_field.send_keys(account["password"])
            logger.info(f"Filled login password field")
            form_filled = True
        
        # Submit login form
        if form_filled:
            try:
                submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit' or contains(text(), 'Login') or contains(text(), 'Sign In')]")
                submit_button.click()
                logger.info("Submitted login form")
                time.sleep(3)
                return True
            except NoSuchElementException:
                try:
                    password_field.send_keys(Keys.RETURN)
                    logger.info("Submitted login form using Enter key")
                    time.sleep(3)
                    return True
                except Exception as e:
                    logger.warning(f"Could not submit login form: {e}")
        
        return False
    
    def attempt_medical_translation(self, term):
        """Attempt to translate a medical term"""
        logger.info(f"Attempting to translate medical term: {term}")
        
        if not self.driver:
            logger.error("WebDriver not initialized")
            return None
        
        # Common translation interface elements
        translation_fields = {
            "name": "search",
            "id": "search",
            "css": "input[placeholder*='search' i]",
            "xpath": "//input[@placeholder='Search' or @placeholder='Enter term' or @placeholder='Medical term']"
        }
        
        search_field = self.find_element_by_multiple_strategies(translation_fields)
        if search_field:
            search_field.clear()
            search_field.send_keys(term)
            logger.info(f"Entered medical term: {term}")
            
            # Try to submit search
            try:
                search_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Search') or contains(text(), 'Translate') or contains(text(), 'Submit')]")
                search_button.click()
                logger.info("Clicked search button")
                time.sleep(2)
            except NoSuchElementException:
                try:
                    search_field.send_keys(Keys.RETURN)
                    logger.info("Submitted search using Enter key")
                    time.sleep(2)
                except Exception as e:
                    logger.warning(f"Could not submit search: {e}")
            
            # Try to find translation results
            try:
                results = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'result') or contains(@class, 'translation') or contains(@class, 'definition')]")
                if results:
                    translation_result = results[0].text
                    logger.info(f"Found translation result: {translation_result[:100]}...")
                    return translation_result
                else:
                    logger.warning("No translation results found")
                    return None
            except Exception as e:
                logger.warning(f"Error finding translation results: {e}")
                return None
        
        logger.warning("Could not find translation interface")
        return None
    
    def run_account_test(self, account):
        """Run complete test for a single account"""
        logger.info(f"Starting test for account: {account['username']}")
        
        account_result = {
            "account": account,
            "registration_success": False,
            "login_success": False,
            "translations": [],
            "errors": [],
            "page_structure": None
        }
        
        if not self.driver:
            logger.error("WebDriver not initialized")
            account_result["errors"].append("WebDriver not initialized")
            return account_result
        
        try:
            # Navigate to website
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # Analyze page structure
            account_result["page_structure"] = self.analyze_page_structure()
            
            # Try to create account
            try:
                account_result["registration_success"] = self.attempt_account_creation(account)
            except Exception as e:
                error_msg = f"Account creation failed: {e}"
                logger.error(error_msg)
                account_result["errors"].append(error_msg)
            
            # Try to login (whether registration succeeded or not)
            try:
                account_result["login_success"] = self.attempt_login(account)
            except Exception as e:
                error_msg = f"Login failed: {e}"
                logger.error(error_msg)
                account_result["errors"].append(error_msg)
            
            # If logged in successfully, try medical translations
            if account_result["login_success"]:
                # Select 2 random medical terms for this account
                selected_terms = random.sample(self.medical_terms, 2)
                
                for term in selected_terms:
                    try:
                        translation = self.attempt_medical_translation(term)
                        account_result["translations"].append({
                            "term": term,
                            "translation": translation,
                            "success": translation is not None
                        })
                    except Exception as e:
                        error_msg = f"Translation failed for {term}: {e}"
                        logger.error(error_msg)
                        account_result["errors"].append(error_msg)
                        account_result["translations"].append({
                            "term": term,
                            "translation": None,
                            "success": False
                        })
            
        except Exception as e:
            error_msg = f"General error for account {account['username']}: {e}"
            logger.error(error_msg)
            account_result["errors"].append(error_msg)
        
        return account_result
    
    def run_debug_tests(self):
        """Run debugging tests for all accounts"""
        logger.info("Starting Medical Terms Website Debug Tests")
        
        # Check website accessibility
        if not self.check_website_accessibility():
            logger.error("Website is not accessible. Exiting.")
            return
        
        # Setup WebDriver
        self.setup_driver()
        
        try:
            # Test each account
            for i, account in enumerate(self.test_accounts, 1):
                logger.info(f"Testing account {i}/10: {account['username']}")
                
                result = self.run_account_test(account)
                self.results.append(result)
                
                # Add delay between accounts
                time.sleep(2)
        
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("WebDriver closed")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        logger.info("Generating test report...")
        
        # Save detailed results to JSON
        with open('medical_terms_debug_results.json', 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        # Generate summary report
        total_accounts = len(self.results)
        successful_registrations = sum(1 for r in self.results if r['registration_success'])
        successful_logins = sum(1 for r in self.results if r['login_success'])
        total_translations = sum(len(r['translations']) for r in self.results)
        successful_translations = sum(1 for r in self.results for t in r['translations'] if t['success'])
        
        summary = f"""
Medical Terms Website Debug Report
=================================
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Website: {self.base_url}

SUMMARY STATISTICS:
- Total Accounts Tested: {total_accounts}
- Successful Registrations: {successful_registrations}/{total_accounts} ({successful_registrations/total_accounts*100:.1f}%)
- Successful Logins: {successful_logins}/{total_accounts} ({successful_logins/total_accounts*100:.1f}%)
- Total Translation Attempts: {total_translations}
- Successful Translations: {successful_translations}/{total_translations} ({successful_translations/total_translations*100:.1f}% if total_translations > 0 else 0)

DETAILED RESULTS:
"""
        
        for i, result in enumerate(self.results, 1):
            account = result['account']
            translations_success = sum(1 for t in result['translations'] if t['success'])
            translations_total = len(result['translations'])
            
            summary += f"""
Account {i}: {account['username']}
- Registration: {'✓' if result['registration_success'] else '✗'}
- Login: {'✓' if result['login_success'] else '✗'}
- Translations: {translations_success}/{translations_total}
- Errors: {len(result['errors'])}
"""
            
            if result['errors']:
                summary += f"  Errors: {'; '.join(result['errors'])}\n"
        
        summary += f"""
RECOMMENDATIONS:
1. Check website accessibility and structure
2. Review form field identifiers and validation
3. Test translation functionality manually
4. Verify user authentication flow
5. Check for any rate limiting or bot detection

For detailed technical information, see: medical_terms_debug_results.json
For execution logs, see: medical_terms_debug.log
"""
        
        # Save summary report
        with open('medical_terms_debug_summary.txt', 'w') as f:
            f.write(summary)
        
        logger.info("Report generated successfully")
        print(summary)

def main():
    """Main function to run the debugging script"""
    debugger = MedicalTermsDebugger()
    
    try:
        debugger.run_debug_tests()
        debugger.generate_report()
        logger.info("Debug tests completed successfully")
    except Exception as e:
        logger.error(f"Debug tests failed: {e}")
        raise

if __name__ == "__main__":
    main()