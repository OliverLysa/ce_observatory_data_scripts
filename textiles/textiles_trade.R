##### **********************
# Author: Matt and Oliver

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
              "DBI",
              "RPostgres",
              "RSelenium", 
              "netstat", 
              "uktrade", 
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "future",
              "furrr",
              "rjson",
              "comtradr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Import functions, options and connections 
# *******************************************************************************
# Import functions
source("functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# con_back <- dbConnect(RPostgres::Postgres(),
#                       dbname = 'postgres', 
#                       host = 'aws-0-eu-west-2.pooler.supabase.com',
#                       port = 5432,
#                       user = 'postgres.qowfjhidbxhtdgvknybu',
#                       password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Product classification
# *******************************************************************************
#

# Download code - only the 2024 classification (may need to extend correlations for historic data)
download.file(
  "https://www.uktradeinfo.com/media/ltnlpgcz/cn2024a.xlsx",
  "./classifications/classifications/cn2024a.xlsx")

# Import trade terms
trade_terms <-
  # Import latest CN data linked to here
  read_excel("./classifications/classifications/cn2024a.xlsx") %>%
  # Pad CN so it is 8 digits
  mutate(CN8 = str_pad(string = CN8, 
                       width = 8, 
                       pad = "0",
                       side = c("right"))) %>%
  # Create HS shorter codes to filter by
  mutate(HS2 = substr(CN8, 1, 2),
         HS4 = substr(CN8, 1, 4),
         HS6 = substr(CN8, 1, 6)) %>%
  # Filter to HS 2 between 50 and 66
  filter(HS2 >=50, 
         HS2 <=66) %>%
  # Removing several codes from 05, 06 categories - to investigate further
  slice(-c(1:67))

# *******************************************************************************
# Trade data download
# *******************************************************************************
#

# UKTradeData - goes back to 2000
trade_terms_CN8 <-trade_terms %>%
  # Isolate list of CN8 codes from classification table, column 'CN8', extract unique codes and unlist
  select(CN8) %>%
  unlist()

# If a subset of those codes are sought, these can be selected by index position
# Using this as in some cases, a memory issue arise with full list
# trade_terms_CN8 <- trade_terms_CN8[1106:1242]

# Create a for loop that goes through the trade terms, extracts the data using the extractor function (in function script) based on the uktrade wrapper
# and prints the results to a list of dataframes
res <- list()
for (i in seq_along(trade_terms_CN8)) {
  res[[i]] <- extractor(trade_terms_CN8[i])
  
  print(i)
  
}

# Bind the list of returned dataframes to a single dataframe
bind <- 
  dplyr::bind_rows(res)

# If you have not used the in-built lookup codes in the uktrade R package, describe the flow-types for subsequent aggregation
bind <- bind %>%
  mutate(FlowTypeId = gsub(1, 'EU Imports', FlowTypeId),
         FlowTypeId = gsub(2, 'EU Exports', FlowTypeId),
         FlowTypeId = gsub(3, 'Non-EU Imports', FlowTypeId),
         FlowTypeId = gsub(4, 'Non-EU Exports', FlowTypeId)) %>%
  rename(FlowTypeDescription = FlowTypeId)

# Remove the month identifier in the month ID column to be able to group by year
# This can be removed for more time-granular data e.g. by month or quarter
bind2$MonthId <- 
  substr(bind2$MonthId, 1, 4)

# Summarise results in value, mass and unit terms grouped by year, flow type and trade code as well as broad trade direction
summary_trade_no_country <- bind3 %>%
  group_by(MonthId, 
           FlowTypeDescription, 
           CommodityId) %>%
  summarise(sum(Value), 
            sum(NetMass), 
            sum(SuppUnit)) %>%
  rename(Year = MonthId) %>%
  # Pivot results longer
  pivot_longer(-c(Year, 
                  FlowTypeDescription, 
                  CommodityId),
               names_to = "Variable",
               values_to = 'Value') %>%
  # Convert trade code to character
  mutate_at(c(3), as.character)

write_xlsx(summary_trade_no_country,
          "summary_trade_no_country.xlsx")

# Comtrade

# Extract trade terms
trade_terms_HS6 <-trade_terms %>%
  # Isolate list of CN8 codes from classification table, column 'CN8', extract unique codes and unlist
  select(HS6) %>%
  unlist()

# Function to use the comtrade R package to extract trade data from the Comtrade API
comtrade_extractor <- function(x) {
  trade_results <-
    ct_get_data(
      # GBR reporter
      reporter =  c('GBR'), 
      # Annual
      frequency = "A",
      # Imports
      flow_direction = "import",
      partner = "World",
      start_date = 2012,
      end_date = 2022,
      commodity_code = c(x)
    )
  trade_results <- trade_results %>%
    mutate(search_code = x)
  
  return(trade_results)
}

# Create a for loop that goes through the trade codes, extracts the data using the extractor function and prints the results to a list of dataframes
res <- list()
for (i in seq_along(trade_terms_HS6)) {
  res[[i]] <- comtrade_extractor(trade_terms_HS6[i])
  
  print(i)
  
}

# Bind the list of returned dataframes to a single dataframe
bind_com <-
  dplyr::bind_rows(res)
