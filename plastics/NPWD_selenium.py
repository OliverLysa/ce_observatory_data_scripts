from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

# Specify the download directory
download_directory = os.path.join(os.getcwd(), 'raw_data', 'NPWD_downloads')
os.makedirs(download_directory, exist_ok=True)

# Configure ChromeOptions to set download directory and disable prompt
chrome_options = webdriver.ChromeOptions()
prefs = {'download.default_directory': download_directory}
chrome_options.add_experimental_option('prefs', prefs)

# Initialize the WebDriver with ChromeOptions
driver = webdriver.Chrome(options=chrome_options)

# Open the URL
url = 'https://npwd.environment-agency.gov.uk/Public/PublicSummaryData.aspx'
driver.get(url)

time.sleep(2)

# Wait for the page to load and the links to be present
wait = WebDriverWait(driver, 10)
links = wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, 'a')))

# Extract file links and names
file_links = [link.get_attribute('href') for link in links if link.get_attribute('href') and link.get_attribute('href').startswith('https://npwd.environment-agency.gov.uk/FileDownload.ashx')]
file_names = [link.text for link in links if link.get_attribute('href') and link.get_attribute('href').startswith('https://npwd.environment-agency.gov.uk/FileDownload.ashx')]

# Click the links one by one
for file_link in file_links:
    driver.get(file_link)
    time.sleep(2)