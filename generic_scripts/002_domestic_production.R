##### **********************
# Author: Oliver Lysaght
# Purpose: See Github read me for more information. 

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
# Import functions
source("./scripts/Functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Data download
# *******************************************************************************
#

# Download dataset (2008-2020)
download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/manufacturingandproductionindustry/datasets/ukmanufacturerssalesbyproductprodcom/current/prodcomdata2020final10082021145108.xlsx",
  "raw_data/prodcom_2008_20.xlsx")

# Download dataset 2021-on
download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/manufacturingandproductionindustry/datasets/ukmanufacturerssalesbyproductprodcom/current/prodcom2022final1.xlsx",
  "raw_data/prodcom_2021_on.xlsx")

# *******************************************************************************
# Data cleaning
# *******************************************************************************
#

# Read all prodcom sheets into a list of sheets (2008-2020)
prodcom_all <- read_excel_allsheets(
  "./raw_data/prodcom_2008_20.xlsx")

# Remove sheets containing division totals (these create problems with bind)
prodcom_all = prodcom_all[-c(1:4)]

# Bind remaining sheets, create a code column and fill, filter to value-relevant rows
prodcom_filtered1 <- 
  dplyr::bind_rows(prodcom_all) %>%
  # Use the clean prodcom function
  clean_prodcom() %>%
  mutate(Code = case_when(str_detect(Variable, "CN") ~ Variable), .before = 1) %>%
  tidyr::fill(1) %>%
  filter(str_like(Variable, "Value%"))

# Bind remaining sheets, create a code column and fill, filter to volume relevant rows
prodcom_filtered2 <- 
  dplyr::bind_rows(prodcom_all) %>%
  # Use the clean prodcom function
  clean_prodcom() %>%
  mutate(Code = case_when(str_detect(Variable, "CN") ~ Variable), .before = 1) %>%
  tidyr::fill(1) %>%
  filter(str_like(Variable, "Volume%"))

# Bind the extracted data to create a complete dataset
prodcom_all <-
  rbindlist(
    list(
      prodcom_filtered1,
      prodcom_filtered2
    ),
    use.names = FALSE
  ) %>%
  na.omit()

# Use g sub to remove unwanted characters in the code column
prodcom_all <- prodcom_all %>%
  # Remove everything in the code column following a hyphen
  mutate(Code = gsub("\\-.*", "", Code),
         # Remove SIC07 in the code column to stop the SIC-level codes from being deleted with the subsequent line
         Code = gsub('SIC\\(07)', '', Code),
         # Remove everything after the brackets/parentheses in the code column
         Code = gsub("\\(.*", "", Code)
  )

# Rename columns so that they reflect the year for which data is available
prodcom_all <- prodcom_all %>%
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
         "2020" = 15)

# Import Prodcom data covering 2021-22

# Read all prodcom sheets into a list of sheets (2012-2022)
prodcom_all_21_on <- read_excel_allsheets_ABS(
  "./raw_data/prodcom_2021_on.xlsx")

# Remove sheets containing division totals (these create problems with bind)
prodcom_all_21_on = prodcom_all_21_on[-c(1:7)]

# Bind remaining sheets, create a code column and fill, filter to value-relevant rows
prodcom_filtered1 <- 
  dplyr::bind_rows(prodcom_all_21_on) %>%
  rename(Variable = 1) %>%
  clean_prodcom() %>%
  mutate(Code = case_when(str_detect(Variable, "CN") ~ Variable), .before = 1) %>%
  tidyr::fill(1) %>%
  filter(str_like(Variable, "Value%"))

# Bind remaining sheets, create a code column and fill, filter to volume relevant rows
prodcom_filtered2 <- 
  dplyr::bind_rows(prodcom_all_21_on) %>%
  rename(Variable = 1) %>%
  # Use the clean prodcom function
  clean_prodcom() %>%
  mutate(Code = case_when(str_detect(Variable, "CN") ~ Variable), .before = 1) %>%
  tidyr::fill(1) %>%
  filter(str_like(Variable, "Volume%"))

# Bind the extracted data to create a complete dataset
prodcom_all_21_on <-
  rbindlist(
    list(
      prodcom_filtered1,
      prodcom_filtered2
    ),
    use.names = FALSE
  ) %>%
  na.omit()

# Use g sub to remove unwanted characters in the code column
prodcom_all_21_on <- prodcom_all_21_on %>%
  # Remove everything in the code column following a hyphen
  mutate(Code = gsub("\\-.*", "", Code),
         # Remove SIC07 in the code column to stop the SIC-level codes from being deleted with the subsequent line
         Code = gsub('SIC\\(07)', '', Code),
         # Remove everything after the brackets/parentheses in the code column
         Code = gsub("\\(.*", "", Code)
  )

# Rename columns so that they reflect the year for which data is available
prodcom_all_21_on <- prodcom_all_21_on %>%
  rename("2012" = 3,
         "2013" = 4,
         "2014" = 5,
         "2015" = 6,
         "2016" = 7,
         "2017" = 8,
         "2018" = 9,
         "2019" = 10,
         "2020" = 11,
         "2021" = 12,
         "2022" = 13) %>%
  select(1,2,12,13)

# Convert 2008-2020 dataset to long-form, filter non-numeric values in the value column and mutate values
prodcom_all_numeric <- prodcom_all %>%
  pivot_longer(-c(
    `Code`,
    `Variable`
  ),
  names_to = "Year", 
  values_to = "Value") %>%
  filter(Value != "N/A",
         Value != "S",
         Value != "S*") %>%
  mutate(Value = gsub(" ","", Value),
         # Remove letter E in the value column
         Value = gsub("E","", Value),
         # Remove commas in the value column
         Value = gsub(",","", Value),
         # Remove NA in the value column
         Value = gsub("NA","", Value),
         # Remove anything after hyphen in the value column
         Value = gsub("\\-.*","", Value)) %>%
  mutate_at(c('Value'), as.numeric) %>%
  mutate_at(c('Code'), trimws)

# Pivot, filter out N/A and mutate to get prodcom data including suppressed values
prodcom_all_numeric_21_on <- prodcom_all_21_on %>%
  pivot_longer(-c(
    `Code`,
    `Variable`
  ),
  names_to = "Year", 
  values_to = "Value") %>%
  mutate(Value = gsub("[^0-9]", "", Value)) %>%
  filter(Value > 0)

# Bind the extracted data to create a complete dataset
prodcom_all_numeric <-
  rbindlist(
    list(
      prodcom_all_numeric,
      prodcom_all_numeric_21_on
    ),
    use.names = TRUE
  ) %>%
  na.omit() %>%
  filter(Variable == "Volume (Number of items)") %>%
  mutate_at(c('Value'), as.numeric)

# Write summary file
write_xlsx(prodcom_all_numeric, 
           "./cleaned_data/Prodcom_data_all.xlsx")

# Read in UNU - prodcom concordance table
UNU_CN_PRODCOM <- read_xlsx("./classifications/concordance_tables/UNU_CN_PRODCOM_SIC.xlsx") %>%
  select(c(1,7)) %>%
  distinct()

# Merge prodcom data with UNU classification, summarise by UNU Key and filter volume rows not expressed in number of units
Prodcom_data_UNU <- left_join(prodcom_all_numeric,
                              UNU_CN_PRODCOM,
                              by=c("Code" = "PRCCODE")) %>%
  na.omit() %>%
  group_by(`UNU KEY`, Year) %>%
  summarise(Value = sum(Value))

# Write summary file
write_xlsx(Prodcom_data_UNU, 
           "./cleaned_data/Prodcom_data_UNU.xlsx")

# Estimation of suppressed values - review ratio approach (issue with data updates altering ratio over time & backwards revisions)
# *******************************************************************************

# This notation corresponds to the 2008-2020 dataset

# E = Estimate by ONS - taken at face value i.e. no adjustment
# N/A = Data not available - removed once pivotted
# S/S* = Suppressed (* included in other SIC4 aggregate) - estimated

# Pivot, filter out N/A and mutate to get prodcom data 2008-20 including suppressed values
prodcom_all_suppressed <- prodcom_all %>%
  pivot_longer(-c(
    `Code`,
    `Variable`
  ),
  names_to = "Year", 
  values_to = "Value") %>%
  filter(Value != "N/A",
         Variable == "Volume (Number of items)") %>%
  mutate(Value = gsub(" ","", Value),
         # Remove letter E in the value column
         Value = gsub("E","", Value),
         # Remove commas in the value column
         Value = gsub(",","", Value),
         # Remove anything after hyphen in the value column
         Value = gsub("\\-.*","", Value)) %>%
  select(-c(Variable)) %>%
  rename(Unit = Value,
         PRCCODE = Code)

# 2021 onwards notation

# [x] = data not available; - removed once pivoted
# [e] = data has low response, and therefore a high level of estimation, which may impact on the quality of the estimate - taken at face value
# [c] = confidential data suppressed to avoid disclosure - estimated 
# [a] = data is suppressed to avoid disclosure and aggregated within the UK Manufacturer Sales of "Other" products - estimated

# Pivot, filter out N/A and mutate to get prodcom data including suppressed values
prodcom_all_suppressed_21_on <- prodcom_all_21_on %>%
  pivot_longer(-c(
    `Code`,
    `Variable`
  ),
  names_to = "Year", 
  values_to = "Value") %>%
  filter(Value != "\\[x]",
         Variable == "Volume (Number of items)") %>%
  mutate(Value = gsub(" ","", Value),
         # Remove letter E in the value column
         Value = gsub("\\[e]","", Value),
         # Remove commas in the value column
         Value = gsub(",","", Value),
         # Remove anything after hyphen in the value column
         Value = gsub("\\-.*","", Value)) %>%
  select(-c(Variable)) %>%
  rename(Unit = Value,
         PRCCODE = Code)

# Bind the extracted data to create a complete dataset
prodcom_all_suppressed <-
  rbindlist(
    list(
      prodcom_all_suppressed,
      prodcom_all_suppressed_21_on
    ),
    use.names = FALSE
  ) %>%
  na.omit()

# Remove leading and trailing white space 
prodcom_all_suppressed$PRCCODE <- 
  trimws(prodcom_all_suppressed$PRCCODE, 
         which = c("both"))

# Import trade data to calculate the trade ratio for suppressed data (in number of items)
trade_data <- 
  read_csv("./cleaned_data/electronics_trade_ungrouped.csv") %>%
  mutate(FlowTypeDescription = gsub("EU Exports", "Exports", FlowTypeDescription),
         FlowTypeDescription = gsub("Non-EU Exports", "Exports", FlowTypeDescription)) %>%
  filter(FlowTypeDescription == "Exports")

# Remove the month identifier in the month ID column to be able to group by year
trade_data$MonthId <- 
  substr(trade_data$MonthId, 1, 4)

# Filter to relevant variables (columns)
trade_data <- trade_data %>%
  select("MonthId", 
         "FlowTypeDescription",
         "Cn8Code",
         "SuppUnit") %>%
  group_by(MonthId, Cn8Code) %>%
  summarise(Unit = sum(SuppUnit)) %>%
  rename(Year = 1)

# Import prodcom_cn condcordance table
PRODCOM_CN <-
  read_excel("./classifications/concordance_tables/PRODCOM_CN.xlsx")  %>%
  as.data.frame() %>%
  # Drop year, CN-split and prodtype columns
  select(-c(`YEAR`,
            `CN-Split`,
            `PRODTYPE`)) %>%
  na.omit()

# Remove spaces from the CN code
PRODCOM_CN$CNCODE <- 
  gsub('\\s+', '', PRODCOM_CN$CNCODE)

# Match trade data with prodcom code lookup
Trade_prodcom <- merge(trade_data,
                       PRODCOM_CN,
                       by.x=c("Cn8Code"),
                       by.y=c("CNCODE"))

# Match trade data with prodcom data based on the previous lookup
Trade_prodcom <- merge(Trade_prodcom,
                       prodcom_all_suppressed,
                       by=c("PRCCODE","Year")) %>%
  rename(Trade = Unit.x,
         Domestic = Unit.y) %>%
  mutate(Domestic_numeric = Domestic) %>%
  mutate(Domestic_numeric = gsub("S","", Domestic_numeric)) %>%
  mutate_at(c('Domestic_numeric'), as.numeric)

# Calculate sum of units for all years in which data is available
# Trade
Grouped_trade <- Trade_prodcom %>%
  group_by(PRCCODE) %>%
  summarise(Trade = sum(Trade)) 

# Domestic production
Grouped_domestic <- Trade_prodcom %>%
  na.omit() %>%
  group_by(PRCCODE) %>%
  summarise(Domestic = sum(Domestic_numeric)) 

# Match trade data with prodcom code lookup and calculate ratio between units
Grouped_all <- merge(Grouped_trade,
                     Grouped_domestic,
                     by=c("PRCCODE")) %>%
  mutate(ratio = Domestic/Trade) %>%
  filter(ratio != c("Inf")) %>%
  filter(ratio != c("NaN"))

# Attach this ratio to dataframe with all exports
Grouped_all <- left_join(Trade_prodcom,
                         Grouped_all,
                         by=c("PRCCODE")) 

# Estimate missing number of units with the calculated ratio
Grouped_all <- Grouped_all %>%
  mutate(estimated = if_else(`Domestic.x` == "S", Trade.x*ratio, Domestic_numeric)) %>%
  mutate(flag = if_else(`Domestic.x` == "S", "estimated", "actual")) %>%
  select(c("PRCCODE", "Year", "estimated", "flag")) %>%
  rename(Value = estimated) %>%
  distinct()

UNU_CN_PRODCOM <- read_xlsx("./classifications/concordance_tables/UNU_CN_PRODCOM_SIC.xlsx") %>%
  select(c(1,7)) %>%
  distinct()

# Merge prodcom data with UNU classification, summarise by UNU Key and filter volume rows not expressed in number of units
Prodcom_data_UNU <- left_join(Grouped_all,
                              UNU_CN_PRODCOM,
                              by="PRCCODE") %>%
  na.omit() %>%
  group_by(`UNU KEY`, Year) %>%
  summarise(Value = sum(Value))

# Write summary file
write_xlsx(Prodcom_data_UNU, 
           "./cleaned_data/Prodcom_data_UNU.xlsx")


