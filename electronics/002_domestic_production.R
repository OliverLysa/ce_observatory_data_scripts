# Author: Oliver Lysaght

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

# Connect to supabase
con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 6543,
                 user = 'postgres.qcgyyjjmwydekbxsjjbx',
                 password = rstudioapi::askForPassword("Database password"))

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

# Download dataset 2021-on
download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/manufacturingandproductionindustry/datasets/ukmanufacturerssalesbyproductprodcom/current/prodcom2022final1.xlsx",
  "raw_data/prodcom_2022_on.xlsx")


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
prodcom_08_20 <-
  rbindlist(
    list(
      prodcom_filtered1,
      prodcom_filtered2
    ),
    use.names = FALSE
  ) %>%
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
    values_to = "Value")

# Import Prodcom data covering 2021-22

# Read all prodcom sheets into a list of sheets (2012-2022)
prodcom_all_21_on <- read_excel_allsheets_ABS(
  "./raw_data/prodcom_2022_on.xlsx")

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
prodcom_21_on <-
  rbindlist(
    list(
      prodcom_filtered1,
      prodcom_filtered2
    ),
    use.names = FALSE
  ) %>%
  # Remove everything in the code column following a hyphen
  mutate(Code = gsub("\\-.*", "", Code),
         # Remove SIC07 in the code column to stop the SIC-level codes from being deleted with the subsequent line
         Code = gsub('SIC\\(07)', '', Code),
         # Remove everything after the brackets/parentheses in the code column
         Code = gsub("\\(.*", "", Code)) %>%
  # Rename columns so that they reflect the year for which data is available
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
  select(1,2,12,13) %>% 
  # pivot longer  
  pivot_longer(-c(
    `Code`,
    `Variable`),
    names_to = "Year",
    values_to = "Value") %>%
  mutate(Value = gsub("\\[","", Value)) %>%
  mutate(Value = gsub("\\]","", Value)) %>%
  mutate(Value = gsub("a","S", Value)) %>%
  mutate(Value = gsub("c","S", Value))

# Bind the extracted data to create a complete dataset
prodcom_all <-
  rbindlist(
    list(
      prodcom_08_20,
      prodcom_21_on
    ),
    use.names = TRUE
  ) %>%
  mutate_at(c('Code'), trimws)

write_xlsx(prodcom_all,
           "./cleaned_data/prodcom_all.xlsx")

DBI::dbWriteTable(con, "prodcom",
                  prodcom_all,
                  overwrite = TRUE)

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

# Import UNU CN8 correspondence correspondence table
WOT_UNU_PCC <-
  read_xlsx("./classifications/concordance_tables/WOT_UNU_CN8_PCC_SIC.xlsx") %>%
  mutate_at(c("CN"), as.character) %>%
  distinct() %>%
  select(3) %>%
  rename(Code = PCC) %>%
  unique()

# Filter to products of interest for UNU scope
prodcom_filtered <- prodcom_all %>%
  filter(Code %in% WOT_UNU_PCC$Code)

# Pivot, filter out N/A and mutate to get prodcom data 2008-20 including suppressed values
prodcom_all_suppressed <- prodcom_filtered %>%
  filter(Value != "N/A",
         Value != "x",
         Variable == "Volume (Number of items)") %>%
  mutate(Value = gsub(" ","", Value),
         # Remove letter E in the value column
         Value = gsub("E","", Value),
         # Remove commas in the value column
         Value = gsub(",","", Value),
         # Remove anything after hyphen in the value column
         Value = gsub("\\-.*","", Value)) %>%
  select(-c(Variable)) %>%
  rename(PRCCODE = Code) %>%
  mutate_at(c('PRCCODE'), trimws) %>%
  mutate_at(c("Year"), as.numeric)

# Import trade data to calculate the trade ratio for suppressed data (in number of items)
trade_data <- 
  read_excel("./cleaned_data/summary_trade_CN.xlsx") %>%
  mutate(FlowTypeDescription = gsub("EU Exports", "Exports", FlowTypeDescription),
         FlowTypeDescription = gsub("Non-EU Exports", "Exports", FlowTypeDescription)) %>%
  filter(FlowTypeDescription == "Exports") %>%
  filter(Variable == "sum(SuppUnit)") %>%
  select(1,3,5,6) %>%
  mutate_at(c("Year"), as.numeric) %>%
  rename(CN = 2)

# Import prodcom CN correspondence
PRODCOM_CN <- 
  read_xlsx("./classifications/concordance_tables/WOT_UNU_CN8_PCC_SIC.xlsx") %>%
  select(1:3) %>%
  mutate_at(c("CN"), as.character)

by <- join_by(CN, closest(Year >= Year))

# Match trade data with prodcom code
Trade_prodcom <- left_join(
  trade_data,
  PRODCOM_CN,
  by) %>%
  select(1:3, 6) %>%
  rename(Year = 1)

# Match trade data with prodcom data based on the previous lookup
Trade_prodcom <- inner_join(Trade_prodcom,
                       prodcom_all_suppressed,
                       join_by("PCC" == "PRCCODE", 
                               "Year" == "Year")) %>%
  rename(Trade = Value.x,
         Domestic = Value.y) %>%
  mutate(Domestic_numeric = Domestic) %>%
  mutate(Domestic_numeric = gsub("S","", Domestic_numeric)) %>%
  mutate(Domestic_numeric = gsub("[c]","", Domestic_numeric)) %>%
  mutate_at(c('Domestic_numeric'), as.numeric)

# Calculate sum of units for all years in which data is available
# Trade
Grouped_trade <- Trade_prodcom %>%
  group_by(PCC) %>%
  summarise(Trade = sum(Trade))

# Domestic production
Grouped_domestic <- Trade_prodcom %>%
  group_by(PCC) %>%
  summarise(Domestic = sum(Domestic_numeric,  na.rm = TRUE)) 

# Match trade data with prodcom code lookup and calculate ratio between units - - check why so many Inf
Grouped_all <- merge(Grouped_trade,
                     Grouped_domestic,
                     by=c("PCC")) %>%
  mutate(ratio = Domestic/Trade) %>%
  filter(ratio != c("Inf")) %>%
  filter(ratio != c("NaN")) %>%
  select(1,4)

# Attach this ratio to dataframe with all exports
Grouped_all <- left_join(Trade_prodcom,
                         Grouped_all,
                         by=c("PCC")) 

# Estimate missing number of units with the calculated ratio - sequential if else
Grouped_all <- Grouped_all %>%
  mutate(estimated = if_else(`Domestic` == "S", Trade*ratio, Domestic_numeric)) %>%
  mutate(flag = if_else(`Domestic` == "S", "estimated", "actual")) %>%
  select(c("PCC", "Year", "estimated", "flag")) %>%
  rename(Value = estimated) %>%
  distinct()

# Import UNU CN8 correspondence correspondence table
WOT_UNU_PCC <-
  read_xlsx("./classifications/concordance_tables/WOT_UNU_CN8_PCC_SIC.xlsx") %>%
  mutate_at(c("CN"), as.character)

# Merge prodcom data with UNU classification, summarise by UNU Key
by <- join_by(PCC, closest(Year >= Year))

Prodcom_data_UNU <- left_join(Grouped_all,
                               WOT_UNU_PCC,
                               by) %>%
  group_by(UNU, Year.x) %>%
  summarise(Value = sum(na.omit(Value))) %>%
  clean_names() %>%
  rename(year= 2) %>%
  mutate(value = value/1000000)
  
ggplot(Prodcom_data_UNU, aes(x = year, y = value, fill = unu)) +
  theme_light() +
  geom_col() +
  labs(x = "Year", y = "Million units")

# CHECK WHY TRADE DATA MISSING FOR SOME PRODCOM CODES - COULD USE STRAIGHT LINE INTERPOLATION

# Write summary file
write_xlsx(Prodcom_data_UNU, 
           "./cleaned_data/Prodcom_data_UNU.xlsx")

# Write file to database
DBI::dbWriteTable(con, "electronics_prodcom_UNU", Prodcom_data_UNU)

# connecting to database
con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres',
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 5432,
                 user = 'postgres.qowfjhidbxhtdgvknybu',
                 password = rstudioapi::askForPassword("Database password"))


