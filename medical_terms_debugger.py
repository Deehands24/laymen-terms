#!/usr/bin/env python3
"""
Medical Terms Website Debugger
Automates testing of medicalterms.vercel.app by creating 10 accounts and testing medical translations
"""

import requests
import json
import time
import random
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MedicalTermsDebugger:
    def __init__(self):
        self.base_url = "https://medicalterms.vercel.app"
        self.driver = None
        self.accounts = []
        self.test_results = []
        
        # Sample medical terms to test
        self.medical_terms = [
            "myocardial infarction",
            "pneumonia",
            "hypertension",
            "diabetes mellitus",
            "cerebrovascular accident",
            "osteoarthritis",
            "gastroenteritis",
            "bronchitis",
            "hepatitis",
            "nephritis",
            "tachycardia",
            "bradycardia",
            "rhinitis",
            "dermatitis",
            "pharyngitis",
            "laryngitis",
            "conjunctivitis",
            "sinusitis",
            "appendicitis",
            "pericarditis"
        ]
        
        # Generate 10 unique accounts
        self.generate_accounts()
        
    def generate_accounts(self):
        """Generate 10 unique account credentials"""
        adjectives = ["Quick", "Bright", "Swift", "Smart", "Clever", "Rapid", "Fast", "Sharp", "Keen", "Alert"]
        nouns = ["Doctor", "Nurse", "Medic", "Surgeon", "Physician", "Therapist", "Student", "Resident", "Intern", "Specialist"]
        
        for i in range(10):
            username = f"{random.choice(adjectives)}{random.choice(nouns)}{random.randint(100, 999)}"
            password = f"Test{random.randint(1000, 9999)}!"
            
            self.accounts.append({
                "username": username,
                "password": password,
                "account_number": i + 1,
                "created": False,
                "login_successful": False,
                "translations": []
            })
    
    def setup_driver(self):
        """Setup Chrome WebDriver with options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            logger.info("Chrome WebDriver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Chrome WebDriver: {e}")
            raise
    
    def create_account(self, account):
        """Create a new account"""
        try:
            self.driver.get(self.base_url)
            logger.info(f"Creating account #{account['account_number']}: {account['username']}")
            
            # Wait for page to load
            wait = WebDriverWait(self.driver, 10)
            
            # Look for sign up button
            try:
                sign_up_button = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign Up')]"))
                )
                sign_up_button.click()
                logger.info("Clicked Sign Up button")
            except TimeoutException:
                logger.warning("Sign Up button not found or not clickable")
                return False
            
            # Fill in username
            try:
                username_field = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Username']"))
                )
                username_field.clear()
                username_field.send_keys(account['username'])
                logger.info(f"Entered username: {account['username']}")
            except TimeoutException:
                logger.error("Username field not found")
                return False
            
            # Fill in password
            try:
                password_field = self.driver.find_element(By.XPATH, "//input[@placeholder='Password']")
                password_field.clear()
                password_field.send_keys(account['password'])
                logger.info("Entered password")
            except NoSuchElementException:
                logger.error("Password field not found")
                return False
            
            # Look for confirm password field (if exists)
            try:
                confirm_password_field = self.driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']")
                confirm_password_field.clear()
                confirm_password_field.send_keys(account['password'])
                logger.info("Entered confirm password")
            except NoSuchElementException:
                logger.info("No confirm password field found")
            
            # Submit form
            try:
                submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
                submit_button.click()
                logger.info("Clicked submit button")
            except NoSuchElementException:
                logger.error("Submit button not found")
                return False
            
            # Wait for success or error message
            time.sleep(2)
            
            # Check if account was created successfully
            current_url = self.driver.current_url
            if "sign" not in current_url.lower():
                account['created'] = True
                logger.info(f"Account {account['username']} created successfully")
                return True
            else:
                logger.warning(f"Account creation may have failed for {account['username']}")
                return False
                
        except Exception as e:
            logger.error(f"Error creating account {account['username']}: {e}")
            return False
    
    def login_account(self, account):
        """Login to an existing account"""
        try:
            self.driver.get(self.base_url)
            logger.info(f"Logging in to account: {account['username']}")
            
            wait = WebDriverWait(self.driver, 10)
            
            # Fill in username
            try:
                username_field = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Username']"))
                )
                username_field.clear()
                username_field.send_keys(account['username'])
                logger.info(f"Entered username: {account['username']}")
            except TimeoutException:
                logger.error("Username field not found during login")
                return False
            
            # Fill in password
            try:
                password_field = self.driver.find_element(By.XPATH, "//input[@placeholder='Password']")
                password_field.clear()
                password_field.send_keys(account['password'])
                logger.info("Entered password")
            except NoSuchElementException:
                logger.error("Password field not found during login")
                return False
            
            # Submit form
            try:
                submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
                submit_button.click()
                logger.info("Clicked login button")
            except NoSuchElementException:
                logger.error("Login button not found")
                return False
            
            # Wait for login to complete
            time.sleep(3)
            
            # Check if login was successful
            current_url = self.driver.current_url
            if "sign" not in current_url.lower():
                account['login_successful'] = True
                logger.info(f"Successfully logged in to {account['username']}")
                return True
            else:
                logger.warning(f"Login may have failed for {account['username']}")
                return False
                
        except Exception as e:
            logger.error(f"Error logging in to account {account['username']}: {e}")
            return False
    
    def get_medical_translations(self, account):
        """Get 2 medical translations for the account"""
        try:
            logger.info(f"Getting medical translations for account: {account['username']}")
            
            # Get 2 random medical terms
            selected_terms = random.sample(self.medical_terms, 2)
            
            for term in selected_terms:
                translation_result = self.translate_medical_term(term)
                account['translations'].append({
                    'term': term,
                    'translation': translation_result['translation'],
                    'success': translation_result['success'],
                    'error': translation_result.get('error', None)
                })
                
                # Wait between translations
                time.sleep(2)
            
            logger.info(f"Completed translations for {account['username']}")
            return True
            
        except Exception as e:
            logger.error(f"Error getting translations for {account['username']}: {e}")
            return False
    
    def translate_medical_term(self, term):
        """Translate a single medical term"""
        try:
            logger.info(f"Translating term: {term}")
            
            wait = WebDriverWait(self.driver, 10)
            
            # Look for translation input field
            try:
                translation_input = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//input[@placeholder*='term' or @placeholder*='medical' or @placeholder*='translate']"))
                )
                translation_input.clear()
                translation_input.send_keys(term)
                logger.info(f"Entered term: {term}")
            except TimeoutException:
                logger.error("Translation input field not found")
                return {'success': False, 'error': 'Translation input field not found', 'translation': None}
            
            # Look for translate button
            try:
                translate_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Translate') or contains(text(), 'Submit')]")
                translate_button.click()
                logger.info("Clicked translate button")
            except NoSuchElementException:
                logger.error("Translate button not found")
                return {'success': False, 'error': 'Translate button not found', 'translation': None}
            
            # Wait for translation result
            time.sleep(3)
            
            # Look for translation result
            try:
                result_element = self.driver.find_element(By.XPATH, "//div[contains(@class, 'translation') or contains(@class, 'result')]")
                translation_text = result_element.text
                logger.info(f"Translation result: {translation_text}")
                return {'success': True, 'translation': translation_text, 'error': None}
            except NoSuchElementException:
                logger.warning("Translation result not found")
                return {'success': False, 'error': 'Translation result not found', 'translation': None}
                
        except Exception as e:
            logger.error(f"Error translating term {term}: {e}")
            return {'success': False, 'error': str(e), 'translation': None}
    
    def run_debug_session(self):
        """Run the complete debugging session"""
        logger.info("Starting Medical Terms Website Debug Session")
        
        # Setup WebDriver
        self.setup_driver()
        
        try:
            # Test each account
            for account in self.accounts:
                logger.info(f"Processing account #{account['account_number']}: {account['username']}")
                
                # Create account
                account_created = self.create_account(account)
                
                if account_created:
                    # Login to account
                    login_successful = self.login_account(account)
                    
                    if login_successful:
                        # Get medical translations
                        self.get_medical_translations(account)
                    else:
                        logger.warning(f"Skipping translations for {account['username']} due to login failure")
                else:
                    logger.warning(f"Skipping login and translations for {account['username']} due to account creation failure")
                
                # Wait between accounts
                time.sleep(3)
                
        except Exception as e:
            logger.error(f"Error during debug session: {e}")
        finally:
            # Close WebDriver
            if self.driver:
                self.driver.quit()
                logger.info("WebDriver closed")
    
    def generate_report(self):
        """Generate a comprehensive debug report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'website': self.base_url,
            'total_accounts': len(self.accounts),
            'successful_account_creations': sum(1 for acc in self.accounts if acc['created']),
            'successful_logins': sum(1 for acc in self.accounts if acc['login_successful']),
            'total_translations_attempted': sum(len(acc['translations']) for acc in self.accounts),
            'successful_translations': sum(1 for acc in self.accounts for trans in acc['translations'] if trans['success']),
            'accounts': self.accounts,
            'issues_found': []
        }
        
        # Analyze issues
        for account in self.accounts:
            if not account['created']:
                report['issues_found'].append(f"Account creation failed for {account['username']}")
            
            if account['created'] and not account['login_successful']:
                report['issues_found'].append(f"Login failed for {account['username']}")
            
            for translation in account['translations']:
                if not translation['success']:
                    report['issues_found'].append(f"Translation failed for '{translation['term']}' in account {account['username']}: {translation['error']}")
        
        return report
    
    def save_report(self, report):
        """Save the debug report to a file"""
        filename = f"medical_terms_debug_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Debug report saved to {filename}")
        return filename

def main():
    """Main function to run the debugging session"""
    debugger = MedicalTermsDebugger()
    
    try:
        # Run the debug session
        debugger.run_debug_session()
        
        # Generate and save report
        report = debugger.generate_report()
        filename = debugger.save_report(report)
        
        # Print summary
        print("\n" + "="*50)
        print("MEDICAL TERMS WEBSITE DEBUG SUMMARY")
        print("="*50)
        print(f"Total accounts tested: {report['total_accounts']}")
        print(f"Successful account creations: {report['successful_account_creations']}")
        print(f"Successful logins: {report['successful_logins']}")
        print(f"Total translations attempted: {report['total_translations_attempted']}")
        print(f"Successful translations: {report['successful_translations']}")
        print(f"Issues found: {len(report['issues_found'])}")
        
        if report['issues_found']:
            print("\nISSUES FOUND:")
            for issue in report['issues_found']:
                print(f"  - {issue}")
        
        print(f"\nDetailed report saved to: {filename}")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()