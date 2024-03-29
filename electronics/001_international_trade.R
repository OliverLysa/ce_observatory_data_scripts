# Author: Oliver Lysaght

# *******************************************************************************
# Packages
# *******************************************************************************

# Package names

# devtools::install_github("pvdmeulen/uktrade")

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
              "future",
              "furrr",
              "rjson")

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
source("Functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

con <- dbConnect(RPostgres::Postgres(),
                      dbname = 'postgres', 
                      host = 'aws-0-eu-west-2.pooler.supabase.com',
                      port = 5432,
                      user = 'postgres.qcgyyjjmwydekbxsjjbx',
                      password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Data extraction and tidying
# *******************************************************************************
#
##  Allows for code concordances to vary by year 2001-16, then uses 2016 codes (last year in concordance table) for years thereafter

# Read list of CN codes from WOT (downloads data for all unique codes across all years)
trade_terms <- 
  read_xlsx("./classifications/concordance_tables/WOT_UNU_CN8_PCC_SIC.xlsx") %>%
  # Filter out codes which do not appear in the period the UKTrade Data API covers
  filter(Year > 2001) %>%
  # Select the CN code column
  select(CN) %>%
  # Take unique codes
  unique() %>%
  # Unlist
  unlist()

# Create a for loop that goes through the trade terms, extracts the data using the extractor function (in function script) based on the uktrade wrapper
# and prints the results to a list of dataframes
res <- list()
for (i in seq_along(trade_terms)) {
  res[[i]] <- extractor(trade_terms[i])
  
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
bind$MonthId <- 
  substr(bind$MonthId, 1, 4)

# Summarise results in value, mass and unit terms grouped by year, flow type and trade code (this then obscures trade country source/destination)
summary_trade_no_country <- bind %>%
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

# Import UNU CN8 correspondence correspondence table in tabular form
WOT_UNU_CN8 <-
  read_xlsx("./classifications/concordance_tables/WOT_UNU_CN8_PCC_SIC.xlsx") %>%
  mutate_at(c("CN", "Year"), as.character)

# Filter extracted trade data to only those for which codes are relevant each year to UNU classification per the concordance table
trade_filtered_pre_2017 <- inner_join(
  summary_trade_no_country,
  WOT_UNU_CN8,
  join_by("CommodityId" == "CN", 
          "Year" == "Year")) %>%
  select(c(1:5, 7))

# Add in 2017 onwards data and bind (takes the 2016 codes and onwards)

# First filter to codes for 2016 only
WOT_UNU_CN8_2016_on <- WOT_UNU_CN8 %>%
  filter(Year == 2016) %>%
  select(2, 4)

# Then filter the trade data to 2017 on
trade_filtered_2017_on <- summary_trade_no_country %>%
  mutate_at(c('Year'), as.numeric) %>%
  filter(Year >= 2017) 

trade_filtered_2017_on <- inner_join(
  trade_filtered_2017_on,
  WOT_UNU_CN8_2016_on,
  join_by("CommodityId" == "CN")) 

# Combined trade data at CN level
trade_combined <-
  rbindlist(
    list(
      trade_filtered_pre_2017,
      trade_filtered_2017_on
    ),
    use.names = TRUE
  )

# Write xlsx file of trade data (imports and exports, summarised by UNU) - to export to DB
write_xlsx(trade_combined, 
           "./cleaned_data/summary_trade_CN.xlsx")
    
# Summarise by UNU
trade_combined_UNU <- trade_combined %>%
  group_by(UNU, 
           Year, 
           Variable, 
           FlowTypeDescription) %>%
  summarise(Value = sum(Value)) %>%
  # Rename contents in variable column
  mutate(Variable = gsub("sum\\(NetMass)", 'Mass', Variable),
         Variable = gsub("sum\\(Value)", 'Value', Variable),
         Variable = gsub("sum\\(SuppUnit)", 'Units', Variable))

# We can use the mass data in combination with BOM data

# Write xlsx file of trade data (imports and exports, summarised by UNU)
write_xlsx(trade_combined_UNU, 
           "./cleaned_data/summary_trade_UNU.xlsx")

# Write file to database
DBI::dbWriteTable(con, "electronics_trade_UNU", trade_combined_UNU)

# *******************************************************************************
# For trade data pre-dating the UK trade API, we use comtrade

# Import UK partner code
# https://comtrade.un.org/data/Doc/api/ex/r
string <- "http://comtrade.un.org/data/cache/partnerAreas.json"
reporters <- fromJSON(file=string)
reporters <- as.data.frame(t(sapply(reporters$results,rbind)))
reporters <- reporters[reporters[[2]] == "United Kingdom",]

# Update in Python
