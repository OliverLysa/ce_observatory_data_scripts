import { Builder, By, until } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome.js";
import * as path from "path";
import * as fs from "fs/promises";

async function deleteFolderRecursive(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    for (let file of files) {
      const currentPath = path.join(folderPath, file);
      const stat = await fs.stat(currentPath);

      if (stat.isDirectory()) {
        // Recursively delete subdirectories
        await deleteFolderRecursive(currentPath);
      } else {
        // Delete file
        await fs.unlink(currentPath);
      }
    }
    // Finally, remove the empty directory
    await fs.rmdir(folderPath);
    console.log(`Folder and all its contents have been deleted: ${folderPath}`);
  } catch (error) {
    console.error(`Error while deleting folder: ${error.message}`);
  }
}

// Function to set up the download directory
async function setupDownloadDirectory() {
  await deleteFolderRecursive("./raw_data/NPWD_downloads");
  const downloadDirectory = path.join(
    process.cwd(),
    "raw_data",
    "NPWD_downloads"
  );
  await fs.mkdir(downloadDirectory, { recursive: true });
  return downloadDirectory;
}

// Function to initialize WebDriver with ChromeOptions
async function initializeDriver(downloadDirectory) {
  const chromeOptions = new chrome.Options();
  chromeOptions.setUserPreferences({
    "download.default_directory": downloadDirectory,
    "profile.default_content_settings.popups": 0, // Disable popups for downloads
  });

  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
}

// Main function
async function main() {
  const downloadDirectory = await setupDownloadDirectory();
  const driver = await initializeDriver(downloadDirectory);

  try {
    // Open the URL
    const url =
      "https://npwd.environment-agency.gov.uk/Public/PublicSummaryData.aspx";
    await driver.get(url);

    // Wait for the links to be present
    const links = await driver.wait(
      until.elementsLocated(By.tagName("a")),
      10000
    );

    // Extract file links and names
    const fileLinks = [];
    const fileNames = [];

    for (const link of links) {
      const href = await link.getAttribute("href");
      const text = await link.getText();
      if (
        href &&
        href.startsWith(
          "https://npwd.environment-agency.gov.uk/FileDownload.ashx"
        )
      ) {
        fileLinks.push(href);
        fileNames.push(text);
      }
    }

    console.log("File links:", fileLinks);
    console.log("File names:", fileNames);

    // Visit each file link to download
    for (const fileLink of fileLinks) {
      await driver.get(fileLink);
      await driver.sleep(2000); // Wait for the download
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the driver
    await driver.quit();
  }
}

// Run the script
main().catch(console.error);
