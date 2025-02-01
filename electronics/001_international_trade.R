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
# Functions and options
# *******************************************************************************
# Import functions
source("Functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Data extraction and tidying
# *******************************************************************************
#

# *******************************************************************************
# Data extraction - UKTradeInfo

# Import full list of trade codes
trade_terms <- read_xlsx(
  "./electronics/cn_correspondence_through_24.xlsx") %>%
  select(cn) %>%
  unique()

# Create a comma separated list easy to search in the API interface of the Data Observatory
trade_terms <- 
  data.frame(cn = apply(trade_terms, 1, function(x) paste0(as.character(x), ',')))

trade_terms <- 
  paste(unlist(trade_terms), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms, "./electronics/trade_terms_to_search.csv")

# Import the data extracted from the API
trade_all <- 
  map_df(list.files("./electronics/trade_data/", full.names = TRUE), read_csv)

# Summarise results in value, mass and unit terms grouped by year, flow type and trade code (this then obscures trade country source/destination)
summary_trade <- trade_all %>%
  unique() %>%
  group_by(FlowType, 
           Cn8,
           Year,
           Description) %>%
  summarise(value = sum(Value), 
            netmass = sum(NetMass), 
            suppunit = sum(SuppUnit)) %>%
  # Pivot results longer
  pivot_longer(-c(Year, 
                  FlowType,
                  Description, 
                  Cn8),
               names_to = "Variable",
               values_to = 'Value') %>%
  clean_names()

# Import UNU CN8 correspondence correspondence table in tabular form
UNU_correlation <- read_xlsx(
  "./electronics/cn_correspondence_through_24.xlsx") %>%
  rename(cn8 = cn) %>%
  mutate_at(c('cn8','year'), as.numeric) %>%
  filter(year >= 2000)
    
# Summarise trade data by UNU
trade_combined_UNU_cn <- left_join(# Join the correspondence codes and the trade data
  UNU_correlation,
     summary_trade,
  by = c("year", "cn8")) # %>%
  # filter(if_any(c(value), is.na)) %>%
  # filter(year != 2024) # %>%
  # select(1) %>%
  # unique() %>%
  # mutate_at(c('cn8'), trimws) %>%
  # filter(! cn8 %in% c("852550",
  #                     "950430"))

write_csv(trade_combined_UNU_cn,
          "./electronics/uk_tradeinfo_matched.csv")

# *******************************************************************************
# Data extraction - Comtrade

# set_primary_comtrade_key(key = "1984a29ad2da49f28eab4c7d1c8d5b3d")

# Import HS codes
hs_codes <-
  read_xlsx("./electronics/hs_correspondence_through_24.xlsx") %>%
  mutate_at(c('year'), as.numeric) %>%
  select(1) %>%
  unique() %>%
  # Unlist
  unlist()

# Function to use the comtrade R package to extract trade data from the Comtrade API
comtrade_extractor <- function(x) {
  trade_results <-
    ct_get_data(
      reporter =  c('GBR'),
      frequency = "A",
      flow_direction = c("export","import"),
      partner = "World",
      start_date = 1977,
      end_date = 1988,
      commodity_code = c(x)
    )
  trade_results <- trade_results %>%
    mutate(search_code = x)
  
  return(trade_results)
}

# 
# # Create a for loop that goes through the trade codes, extracts the data using the extractor function and prints the results to a list of dataframes
res <- list()
for (i in seq_along(hs_codes)) {
  res[[i]] <- comtrade_extractor(hs_codes[i])
  
  print(i)
  
}

# 
# # # Bind the list of returned dataframes to a single dataframe - do for each API run as limited to 12 years
GBR_13_24 <-
  dplyr::bind_rows(res)

GBR_01_12 <-
  dplyr::bind_rows(res)

GBR_89_00 <-
  dplyr::bind_rows(res)

# Bind datasets 
comtrade_all <-
  rbindlist(
    list(
      GBR_13_24,
      GBR_01_12,
      GBR_89_00
    ),
    use.names = TRUE
  ) %>%
  rename(year = ref_year)

# # Write
# write_xlsx(comtrade_all,
#            "./electronics/comtrade_all.xlsx")

comtrade_all <- read_xlsx(
  "./electronics/comtrade_all.xlsx") %>%
  rename(year = period)

# Import UNU CN8 correspondence correspondence table in tabular form
UNU_HS_correlation <- read_xlsx(
  "./electronics/hs_correspondence_through_24.xlsx") %>%
  rename(cmd_code = hs) %>%
  # mutate_at(c('year'), as.numeric) %>%
  filter(year <= 2023)

# Summarise trade data by UNU
trade_combined_UNU_hs <- left_join(# Join the correspondence codes and the trade data
  UNU_HS_correlation,
  comtrade_all,
  by = c("year", "cmd_code")) %>%
  filter(qty != 0 & qty_unit_code != 8) %>%
  drop_na(primary_value)

write_xlsx(trade_combined_UNU_hs,
           "./electronics/comtrade_matched.xlsx")


