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
              "comtradr",
              "tabulizer")

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

options(java.parameters = "-Xmx16000m")
gc()

# *******************************************************************************
# Product classification
# *******************************************************************************
#

# 2023 CN - update to use the 2023 codes if different

# Import trade terms
trade_terms_23 <-
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
  slice(-c(1:67)) %>%
  select(HS6) %>%
  unique()

trade_terms <- 
  data.frame(HS6 = apply(trade_terms, 1, function(x) paste0(as.character(x), ',')))

trade_terms <- 
  paste(unlist(trade_terms), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms, "./textiles/23_trade_terms_search.csv")

# 2022 CN

# Import trade terms
trade_terms_22 <-
  # Import latest CN data linked to here
  read_csv("./classifications/cn2022.csv") %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  # Create HS shorter codes to filter by
  mutate(HS2 = substr(CN_CODE, 1, 2),
         HS6 = substr(CN_CODE, 1, 6)) %>%
  dplyr::filter(nchar(as.character(HS6))==6) %>%
  # Filter to HS 2 between 50 and 66
  filter(HS2 >=50, 
         HS2 <=66) %>%
  select(HS6) %>%
  unique()

trade_terms_22 <- 
  data.frame(HS6 = apply(trade_terms_22, 1, function(x) paste0(as.character(x), ',')))

trade_terms_22 <- 
  paste(unlist(trade_terms_22), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms_22, "./textiles/trade_codes/22_trade_terms_search.csv")

# 2021 CN

# Import trade terms
trade_terms_21 <-
  # Import latest CN data linked to here
  read_csv("./classifications/cn2021.csv") %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  # Create HS shorter codes to filter by
  mutate(HS2 = substr(CN_CODE, 1, 2),
         HS6 = substr(CN_CODE, 1, 6)) %>%
  dplyr::filter(nchar(as.character(HS6))==6) %>%
  # Filter to HS 2 between 50 and 66
  filter(HS2 >=50, 
         HS2 <=66) %>%
  select(HS6) %>%
  unique()

trade_terms_21 <- 
  data.frame(HS6 = apply(trade_terms_21, 1, function(x) paste0(as.character(x), ',')))

trade_terms_21 <- 
  paste(unlist(trade_terms_21), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms_21, "./textiles/trade_codes/21_trade_terms_search.csv")

# 2020 CN

# Import trade terms
trade_terms_20 <-
  # Import latest CN data linked to here
  read_csv("./classifications/CN2020_Self_Explanatory_Texts_EN_DE_FR.csv") %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  # Create HS shorter codes to filter by
  mutate(HS2 = substr(CN_CODE, 1, 2),
         HS6 = substr(CN_CODE, 1, 6)) %>%
  dplyr::filter(nchar(as.character(HS6))==6) %>%
  # Filter to HS 2 between 50 and 66
  filter(HS2 >=50, 
         HS2 <=66) %>%
  select(HS6) %>%
  unique()

trade_terms_20 <- 
  data.frame(HS6 = apply(trade_terms_20, 1, function(x) paste0(as.character(x), ',')))

trade_terms_20 <- 
  paste(unlist(trade_terms_20), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms_20, "./textiles/trade_codes/20_trade_terms_search.csv")

# 2019 CN

# Import trade terms
trade_terms_19 <-
  # Import latest CN data linked to here
  read_csv("./classifications/CN2019_Self_Explanatory_Texts_EN_DE_FR.csv") %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  # Create HS shorter codes to filter by
  mutate(HS2 = substr(CN_CODE, 1, 2),
         HS6 = substr(CN_CODE, 1, 6)) %>%
  dplyr::filter(nchar(as.character(HS6))==6) %>%
  # Filter to HS 2 between 50 and 66
  filter(HS2 >=50, 
         HS2 <=66) %>%
  select(HS6) %>%
  unique()

trade_terms_19 <- 
  data.frame(HS6 = apply(trade_terms_19, 1, function(x) paste0(as.character(x), ',')))

trade_terms_19 <- 
  paste(unlist(trade_terms_19), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms_19, "./textiles/trade_codes/19_trade_terms_search.csv")

# 2018 CN

# Import trade terms
trade_terms_18 <-
  # Import latest CN data linked to here
  read_csv("./classifications/CN2018_Self_Explanatory_Texts_EN_DE_FR.csv") %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  # Create HS shorter codes to filter by
  mutate(HS2 = substr(CN_CODE, 1, 2),
         HS6 = substr(CN_CODE, 1, 6)) %>%
  dplyr::filter(nchar(as.character(HS6))==6) %>%
  # Filter to HS 2 between 50 and 66
  filter(HS2 >=50, 
         HS2 <=66) %>%
  select(HS6) %>%
  unique()

trade_terms_18 <- 
  data.frame(HS6 = apply(trade_terms_18, 1, function(x) paste0(as.character(x), ',')))

trade_terms_18 <- 
  paste(unlist(trade_terms_18), collapse ="") %>%
  as.data.frame()

write_csv(trade_terms_18, "./textiles/trade_codes/18_trade_terms_search.csv")

# *******************************************************************************
# Summarise trade data 
# *******************************************************************************
#

# Import the data
trade_all <- 
  map_df(list.files("./raw_data/textiles_trade/", full.names = TRUE), read_csv)

textiles_trade_data <- trade_all %>%
  # unite(Description, Cn8, Description, sep = " - ") %>%
  select(2:11) %>%
  mutate(NetMass = NetMass /1000) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  pivot_longer(-c(Hs2, Hs4, Hs6, Description, Year, FlowType, Country),
               names_to = "Variable",
               values_to = "Value") %>%
# Format columns for the tree filter on frontend
  unite(Hs4, c(Hs2,Hs4), sep = "-", remove = FALSE) %>%
  unite(Hs6, c(Hs4,Hs6), sep = "-", remove = FALSE) 

# Export to database
DBI::dbWriteTable(con,
                  "textiles_trade_update",
                  textiles_trade_data,
                  overwrite: TRUE)

#############################

# COMTRADE route

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

