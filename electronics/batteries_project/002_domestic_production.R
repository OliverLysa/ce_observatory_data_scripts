# Author: Oliver Lysaght
# Purpose: As part of apparent consumption calculation of EEE POM, download relevant production data for EEE final goods
# Notes: 1) Simplest option would be to take the prodcom data at face value and not estimate the suppressed values, however if we want to account for these
# We must take extra steps to estimate these

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
              "janitor")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading 
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Functions and options
# *******************************************************************************

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Data download
# *******************************************************************************
#

# Download dataset covering the years 2008-2020. 2008 appears to be the earliest available from ONS (have emailed them). Keep only the data from this source which isn't available in the later publication
download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/manufacturingandproductionindustry/datasets/ukmanufacturerssalesbyproductprodcom/current/prodcomdata2020final10082021145108.xlsx",
  "./electronics/batteries_project/raw_data_inputs/prodcom_2008_20.xlsx")

# Download latest data
download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/manufacturingandproductionindustry/datasets/ukmanufacturerssalesbyproductprodcom/current/ukmanufacturerssalesbyproduct2023.xlsx",
  "./electronics/batteries_project/raw_data_inputs/prodcom_latest.xlsx")

# *******************************************************************************
# Data cleaning
# *******************************************************************************
#

# Read all prodcom sheets into a list of sheets (2008-2020)
prodcom_earlier <- read_excel_allsheets(
  "./electronics/batteries_project/raw_data_inputs/prodcom_2008_20.xlsx")

# Remove sheets containing division totals (these create problems with bind)
prodcom_earlier = prodcom_earlier[-c(1:4)]

# Bind remaining sheets, create a code column and fill, filter to volume relevant rows
prodcom_08_20 <- 
  dplyr::bind_rows(prodcom_earlier) %>%
  # Use the clean prodcom function
  clean_prodcom() %>%
  mutate(Code = case_when(str_detect(Variable, "CN") ~ Variable), .before = 1) %>%
  tidyr::fill(1) %>%
  filter(str_like(Variable, "Volume%")) %>%
  # Remove everything in the code column following a hyphen
  mutate(Code = gsub("\\-.*", "", Code),
         # Remove SIC07 in the code column to stop the SIC-level codes from being deleted with the subsequent line
         Code = gsub('SIC\\(07)', '', Code),
         # Remove everything after the brackets/parentheses in the code column
         Code = gsub("\\(.*", "", Code)
  ) %>%
  # Rename columns so that they reflect the year for which data is available
  rename("2008" = 3,
         "2009" = 4,
         "2010" = 5,
         "2011" = 6,
         "2012" = 7,
         "2013" = 8,
         "2014" = 9,
         "2015" = 10,
         "2016" = 11,
         "2017" = 12,
         "2018" = 13,
         "2019" = 14,
         "2020" = 15) %>%
  # pivot longer  
  pivot_longer(-c(
      `Code`,
      `Variable`
    ),
    names_to = "Year",
    values_to = "Value") %>%
  filter(! Year > 2012)

# Import Prodcom data latest available years

# Read all prodcom sheets into a list of sheets
prodcom_latest <- read_excel(
  "./electronics/batteries_project/raw_data_inputs/prodcom_latest.xlsx",
  sheet = "Table 5") %>%
  row_to_names(5) %>%
  select(-Notes) %>%
  filter(str_like(`Sales Category`, "Volume%")) %>%
  # pivot longer  
  pivot_longer(-c(
    `Product Code`,
    `Description`,
    `Sales Category`),
    names_to = "Year",
    values_to = "Value") %>%
  select(-Description) %>%
  rename(Code = 1,
         Variable = 2)

# Bind the extracted data to create a complete dataset
prodcom_all <-
  rbindlist(
    list(
      prodcom_08_20,
      prodcom_latest
    ),
    use.names = TRUE
  ) %>%
  mutate_at(c('Code'), trimws) %>%
  mutate_at(c("Year"), as.numeric)

# Estimation of suppressed values
# *******************************************************************************

# Notation corresponds to the 2008-2020 dataset
# E = Estimate by ONS - taken at face value i.e. no adjustment
# N/A = Data not available - removed once pivotted
# S/S* = Suppressed (* included in other SIC4 aggregate) - estimated

# Notation corresponds to 2021 onwards
# [x] = data not available; - removed once pivoted
# [e] = data has low response, and therefore a high level of estimation, which may impact on the quality of the estimate - taken at face value
# [c] = confidential data suppressed to avoid disclosure - estimated 
# [a] = data is suppressed to avoid disclosure and aggregated within the UK Manufacturer Sales of "Other" products - estimated

# Import UNU PCC correspondence table
UNU_PCC <-
  read_csv("./electronics/batteries_project/correlations/htbl_PCC_Match_Key.csv") %>%
  rename(Code = 1) %>%
  filter(! Year < 2008,
         ! Year > 2023)

# Summarise production data by UNU
production_UNU_PCC <- left_join(# Join the correspondence codes and the trade data
  UNU_PCC,
  prodcom_all,
  by = c("Year", "Code"))

# Pivot, filter out N/A and mutate to get prodcom data 2008-20 including suppressed values
prodcom_all_suppressed <- production_UNU_PCC %>%
  filter(Value != "N/A",
         Value != "x",
         Variable == "Volume (Number of items)") %>%
  mutate(Value = gsub(" ","", Value),
         # Remove letter E in the value column
         Value = gsub("E","", Value),
         Value = gsub("e","", Value),
         # Remove commas in the value column
         Value = gsub(",","", Value),
         # Remove anything after hyphen in the value column
         Value = gsub("\\-.*","", Value),
         Value = gsub("\\[","", Value),
         Value = gsub("\\]","", Value),
         Value = gsub("a","S", Value),
         Value = gsub("c","S", Value)) %>%
  select(-c(Variable)) %>%
  rename(PRCCODE = Code) %>%
  mutate_at(c('PRCCODE'), trimws) %>%
  mutate_at(c("Year"), as.numeric)

# Import trade data to calculate the trade ratio for suppressed data (in number of items)
trade_data <- 
  read_csv("./electronics/batteries_project/cleaned_data/comtrade_matched.csv") %>%
  filter(flow_desc == "Export") %>%
  mutate_at(c("cmd_code"), as.character) %>%
  rename(year = ref_year)

# Import prodcom CN correspondence
PRODCOM_HS <- 
  read_csv("./electronics/batteries_project/correlations/htbl_PCC_CN.csv") %>%
  mutate(HS = substr(CN, 1, 6)) %>%
  select(-CN) %>%
  # Take unique
  unique()

# Match trade data with prodcom code - add the equivalent PCC to the trade data
Trade_prodcom_correlation <- left_join(
  trade_data,
  PRODCOM_HS,
  by = c("year" = "Year", "cmd_code" = "HS"))

# Match trade data with prodcom data based on the previous lookup created
Trade_prodcom <- left_join(prodcom_all_suppressed,
                           Trade_prodcom_correlation,
                       join_by("PRCCODE" == "PCC",
                               "Year" == "year")) %>%
  rename(Domestic = Value,
         Trade = qty) %>%
  mutate(Domestic_numeric = Domestic) %>%
  mutate(Domestic_numeric = gsub("S","", Domestic_numeric)) %>%
  mutate(Domestic_numeric = gsub("[c]","", Domestic_numeric)) %>%
  mutate_at(c('Domestic_numeric'), as.numeric)

# Every time a domestic production value is suppressed, we estimate it based on the available trade data for the same year and the ratio between trade and production for the PCC for all other years

# Calculate sum of units for all years in which data is available by PRCCODE
# Trade
Grouped_trade <- Trade_prodcom %>%
  group_by(PRCCODE) %>%
  summarise(Trade = sum(Trade, na.rm = TRUE))

# Domestic production
Grouped_domestic <- Trade_prodcom %>%
  group_by(PRCCODE) %>%
  summarise(Domestic = sum(Domestic_numeric,  na.rm = TRUE)) 

# Match trade data with prodcom code lookup and calculate ratio between units - - check why so many Inf
Grouped_ratio <- left_join(Grouped_domestic,
                         Grouped_trade,
                     by=c("PRCCODE")) %>%
  mutate(ratio = Domestic/Trade) %>%
  filter(ratio != c("Inf")) %>%
  filter(ratio != c("NaN")) %>%
  select(1,4)

# Construct table to join to
Simplified <- Trade_prodcom %>%
  group_by(PRCCODE, Year, Domestic, Domestic_numeric) %>%
  summarise(Trade = sum(Trade, na.rm = TRUE))

# Attach this ratio to dataframe with all exports
Grouped_all <- left_join(Simplified,
                         Grouped_ratio,
                         by=c("PRCCODE")) %>%
  mutate(estimated = if_else(`Domestic` == "S", Trade*ratio, Domestic_numeric)) %>%
  mutate(flag = if_else(`Domestic` == "S", "estimated", "actual")) %>%
  select(c("PRCCODE", "Year", "estimated", "flag")) %>%
  rename(Value = estimated) %>%
  na.omit()

# Join to UNU-KEY to PRCCODE correlation and summarise domestic production by UNU KEY and year
Prodcom_data_UNU <- left_join(Grouped_all,
                              UNU_PCC,
                              by = c("PRCCODE" = "Code", "Year")) %>%
  group_by(UNU_Key, Year) %>%
  summarise(Value = sum(Value, na.rm = TRUE)) %>%
  clean_names()

# We could do straight line interpolation of the domestic production data where trade is 0 and we can't make estimates

# Write summary file
write_csv(Prodcom_data_UNU, 
           "./electronics/batteries_project/cleaned_data/Prodcom_data_UNU.csv")



