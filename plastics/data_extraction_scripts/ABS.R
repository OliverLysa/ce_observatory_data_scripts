##### **********************
# Purpose: Download ABS data

# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c("magrittr", 
              "writexl", 
              "readxl", 
              "dplyr", 
              "tidyverse", 
              "readODS", 
              "data.table", 
              "RSelenium", 
              "netstat", 
              "uktrade", 
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "onsr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Data
# *******************************************************************************

##### **********************
# 4-digit aGVA Data Download

# Download the raw 4-digit aGVA data
download.file("https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/businessservices/datasets/uknonfinancialbusinesseconomyannualbusinesssurveysectionsas/current/abssectionsas2022.xlsx",
              "./raw_data/Non-financial business economy, UK: Sections A to S.xlsx")

# Extract all sheets into a list of dataframes. We use an ABS specific function to exclude 
aGVA_sheets <- read_excel_allsheets_ABS(
  "./raw_data/Non-financial business economy, UK: Sections A to S.xlsx")

# Remove covering sheets containing division totals
aGVA_sheets = aGVA_sheets[-c(1:4)]

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
aGVA_data <-
  dplyr::bind_rows(aGVA_sheets) %>%
  filter(Description != "Description") %>%
  dplyr::rename(code = 1) %>%
  mutate(code = gsub("\\.", "", code)) %>%
  dplyr::filter(!grepl('(Part)', `code`)) %>%
  clean_names() %>%
  pivot_longer(-c(`code`,
                  `description`,
                  `year`),
               names_to = "indicator",
               values_to = "value") %>%
  filter(value != "[c]") %>%
  filter(value != "[low]") %>%
  mutate_at(c('value'), as.numeric) %>%
  dplyr::mutate(indicator = gsub("number_of_enterprises", 'Number of enterprises', indicator),
         indicator = gsub("total_turnover", 'Total turnover', indicator),
         indicator = gsub("approximate_gross_value_added_at_basic_prices_a_gva", 'aGVA at basic prices', indicator),
         indicator = gsub("total_purchases_of_goods_materials_and_services", 'Total purchases of goods and services', indicator),
         indicator = gsub("total_employment_costs", 'Employment costs', indicator),
         indicator = gsub("total_stocks_and_work_in_progress_value_at_end_of_year", 'Stock end of year', indicator),
         indicator = gsub("total_stocks_and_work_in_progress_value_at_beginning_of_year", 'Stock beginning of year', indicator),
         indicator = gsub("total_stocks_and_work_in_progress_increase_during_year", 'Stock increase during year', indicator),
         indicator = gsub("total_net_capital_expenditure_note_2", 'Net capital expenditure', indicator),
         indicator = gsub("total_capital_expenditure_acquisitions_note_2", 'Capital expenditure acquisitions', indicator),
         indicator = gsub("total_capital_expenditure_disposals_note_2", 'Capital expenditure disposals', indicator)) %>%
  dplyr::mutate(indicator = gsub("_", " ", indicator)) %>%
  dplyr::mutate(indicator = str_to_sentence(indicator)) %>%
  mutate(value = round(value, 0)) %>%
  unite(code_desc, c(code, description), sep = " - ", remove = FALSE)

DBI::dbWriteTable(con,
                  "ABS",
                  aGVA_data,
                  overwrite = TRUE)

# Plastic packaging relevant codes
plastic_packaging_gva <- aGVA_data %>%
  filter(code %in% c("2222",
                     "2221",
                     "2016",
                     "2223",
                     "2229",
                     "2896",
                     "3811",
                     "3821",
                     "4677")) %>%
  unite(description, code, description, sep = " - ")

DBI::dbWriteTable(con,
                  "plastic_packaging_gva",
                  plastic_packaging_gva,
                  overwrite = TRUE)

