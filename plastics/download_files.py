import requests
from bs4 import BeautifulSoup
import os

def download_files():
    headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=0, i',
        'referer': 'https://npwd.environment-agency.gov.uk/Public/PublicSummaryData.aspx',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    }
    
    url = 'https://npwd.environment-agency.gov.uk/Public/PublicSummaryData.aspx'
    response = requests.get(url,headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    links = soup.find_all('a', href=True)
    file_links = [link['href'] for link in links if link['href'].startswith('https://npwd.environment-agency.gov.uk/FileDownload.ashx')]
    # file_names = [link.text for link in links if link['href'].startswith('https://npwd.environment-agency.gov.uk/FileDownload.ashx')]
    download_dir = './raw_data/NPWD_downloads'
    os.makedirs(download_dir, exist_ok=True)
    for file_link in file_links:
        file_name = file_link.split('=')[-1] + '.xls'
        file_path = os.path.join(download_dir, file_name)
        file_response = requests.get(file_link)
        file_response.raise_for_status()
        with open(file_path, 'wb') as file:
            file.write(file_response.content)
        print("Downloading %s to %s..." % (file_links, file_name) )

if __name__ == "__main__":
    download_files()
