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

Sys.setenv('COMTRADE_PRIMARY' = '4bb0e2c57f5d4dfc8314f732ae82e1e3')

# *******************************************************************************
# Import functions, options and connections 
# *******************************************************************************
# Import functions
source("functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

con <- dbConnect(RPostgres::Postgres(),
                      dbname = 'postgres', 
                      host = 'aws-0-eu-west-2.pooler.supabase.com',
                      port = 5432,
                      user = 'postgres.qowfjhidbxhtdgvknybu',
                      password = rstudioapi::askForPassword("Database password"))

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
trade_terms_CN8 <- trade_terms %>%
  # Isolate list of CN8 codes from classification table, column 'CN8', extract unique codes and unlist
  select(HS2) %>%
  unique() %>%
  unlist()

# # If a subset of those codes are sought, these can be selected by index position
# # Using this as in some cases, a memory issue arise with full list
# # trade_terms_CN8 <- trade_terms_CN8[1106:1242]
# 
# # Create a for loop that goes through the trade terms, extracts the data using the extractor function (in function script) based on the uktrade wrapper
# # and prints the results to a list of dataframes
# res <- list()
# for (i in seq_along(trade_terms_CN8)) {
#   res[[i]] <- extractor(trade_terms_CN8[i])
#   
#   print(i)
#   
# }
# 
# # Bind the list of returned dataframes to a single dataframe
# bind2 <- 
#   dplyr::bind_rows(res)
# 
# # If you have not used the in-built lookup codes in the uktrade R package, describe the flow-types for subsequent aggregation
# bind2 <- bind2 %>%
#   mutate(FlowTypeId = gsub(1, 'EU Imports', FlowTypeId),
#          FlowTypeId = gsub(2, 'EU Exports', FlowTypeId),
#          FlowTypeId = gsub(3, 'Non-EU Imports', FlowTypeId),
#          FlowTypeId = gsub(4, 'Non-EU Exports', FlowTypeId)) %>%
#   rename(FlowTypeDescription = FlowTypeId)
# 
# # bind3 <- bind3 %>%
# #   mutate(FlowTypeDescription = gsub('EU Imports', 'Imports', FlowTypeDescription),
# #          FlowTypeDescription = gsub('EU Exports', 'Exports', FlowTypeDescription),
# #          FlowTypeDescription = gsub('`Non-EU Imports`', 'Imports', FlowTypeDescription),
# #          FlowTypeDescription = gsub('Non-EU Exports', 'Exports', FlowTypeDescription),
# #          FlowTypeDescription = gsub('Non-Exports', 'Exports', FlowTypeDescription),
# #          FlowTypeDescription = gsub('Non-Imports', 'Imports', FlowTypeDescription))
# 
# # Remove the month identifier in the month ID column to be able to group by year
# # This can be removed for more time-granular data e.g. by month or quarter
# bind$MonthId <- 
#   substr(bind$MonthId, 1, 4)
# 
# # Summarise results in value, mass and unit terms grouped by year, flow type and trade code as well as broad trade direction
# summary_trade_no_country <- bind %>%
#   group_by(MonthId, 
#            FlowTypeDescription, 
#            CommodityId) %>%
#   summarise(sum(Value), 
#             sum(NetMass), 
#             sum(SuppUnit)) %>%
#   rename(Year = MonthId) %>%
#   # Pivot results longer
#   pivot_longer(-c(Year, 
#                   FlowTypeDescription, 
#                   CommodityId),
#                names_to = "Variable",
#                values_to = 'Value') %>%
#   # Convert trade code to character
#   mutate_at(c(3), as.character) %>%
#   left_join(# Join the correspondence codes and the trade data
#     trade_terms,
#     by =join_by("CommodityId" == "CN8")) %>%
#   rename(CN = CommodityId)
# 
# # Export locally
# write_xlsx(summary_trade_no_country,
#           "summary_trade_no_country_50_only.xlsx")
# 
# # Export to database
# DBI::dbWriteTable(con, 
#                   "textiles_trade", 
#                   summary_trade_no_country)

# Hitting API without package - confirms there are some issues with the package
# https://api.uktradeinfo.com/OTS?$filter=(MonthId ge 202301 and MonthId le 202312) and ((CommodityId ge 54 and CommodityId le 54))
# https://api.uktradeinfo.com/OTS?$filter=(MonthId%20ge%20202301%20and%20MonthId%20le%20202312)%20and%20((CommodityId%20ge%2054%20and%20CommodityId%20le%2054))
raw = GET(paste('https://api.uktradeinfo.com/OTS?$filter=(MonthId%20ge%20202301%20and%20MonthId%20le%20202312)%20and%20((CommodityId%20ge%2054%20and%20CommodityId%20le%2054))'))

#convert to a character string
r2 <- rawToChar(raw$content)  

#check the class is character
class(r2)    

# now extract JSON from string object
r3 <- fromJSON(r2)

r4 <- r3$value

r5<- bind_rows(r4)

write_xlsx(r5,
           "raw_api_output.xlsx")

# Comtrade

# Extract trade terms
trade_terms_HS6 <-trade_terms %>%
  # Isolate list of CN8 codes from classification table, column 'CN8', extract unique codes and unlist
  select(HS6) %>%
  unique() %>%
  unlist()

trade_terms_HS6 <- trade_terms_HS6[1:499]

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

# Export locally
write_xlsx(bind_com,
           "bind_com.xlsx")

