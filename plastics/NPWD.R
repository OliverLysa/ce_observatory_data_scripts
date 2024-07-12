##### **********************
# National Packaging Waste Database
# Description: Used by obligated businesses and compliance schemes to register with DA-level environment agencies and for preprocessors and exporters to submit quarterly returns on, and issue, EPRNS and ePERNs.
# Geographical scope: UK-wide
# Frequency of updates: Monthly - Quarterly
# 

# Steps
# 1. Extract the NPWD data
# 2. Bin the files into different variables covered 
  
# *******************************************************************************
# Require packages
#********************************************************************************

require(writexl)
require(dplyr)
require(tidyverse)
require(readODS)
require(janitor)
require(data.table)
require(xlsx)
require(readxl)
require(reticulate)

con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 6543,
                 user = 'postgres.qowfjhidbxhtdgvknybu',
                 password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Options and functions
#********************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./scripts/functions.R", 
       local = knitr::knit_global())

# *******************************************************************************
# Download and data preparation
#********************************************************************************
#

## Recycling summary 

# Following python script downloading all files from NPWD, list files in groups corresponding to the variables they cover and file type - recycling and recovery summary
quarterly_recycling_file_list <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='Recycling_Summary.+xls')

# Doing this for each variation in naming from the EA
quarterly_recycling_file_list2 <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='_RRS.+xls')

# Removing those meeting the pattern but containing monthly data
quarterly_recycling_file_list2 <-
  quarterly_recycling_file_list2[!grepl(pattern = "Monthly", quarterly_recycling_file_list2)]

# Doing this for each variation in naming from the EA
quarterly_recycling_file_list3 <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='recovery_summary.+xls')

# Bind list of file names
quarterly_recycling_file_list_all <- c(quarterly_recycling_file_list,
                                       quarterly_recycling_file_list2,
                                       quarterly_recycling_file_list3)

# Import those files and bind to a single df
quarterly_recycling_df <- 
  lapply(paste("./raw_data/NPWD_downloads/",
               quarterly_recycling_file_list_all,sep = ""), read_excel) %>%
  dplyr::bind_rows() %>%
  select(where(not_all_na)) %>%
  clean_names() %>% 
  mutate(x2 = coalesce(x2, national_packaging_waste_database)) %>%
  fill(2, .direction = "down") %>%
  filter(! str_detect(x2, 'Table 3|Summary of Recovery and Recycling|Summary of Recycling')) 

# Create non-detailed summary table
summary_table <- 
  quarterly_recycling_df %>%
  filter(str_detect(x2, 'Table 1')) %>%
  select(where(not_all_na)) %>%
  mutate(x4 = coalesce(x4, x3)) %>%
  mutate(x8 = coalesce(x8, x10),
         x8 = coalesce(x8, x7)) %>%
  mutate(x12 = coalesce(x12, x14)) %>%
  mutate(x12 = coalesce(x12, x10)) %>%
  mutate(x20 = coalesce(x20, x23)) %>%
  mutate(x20 = coalesce(x20, x18)) %>%
  mutate(x20 = coalesce(x20, x21)) %>%
  select(x2,x4,x8,x12,x20) %>%
  row_to_names(row_number = 2) %>%
  na.omit() %>%
  rename(year = 1, 
         category = 2,
         `UK reprocessing` = 3,
         `Overseas reprocessing` = 4,
         `PRNs issued` = 5) %>%
  mutate(year = gsub("[^0-9]", "", year)) %>%
  mutate(across(c('year'), substr, 2, nchar(year))) %>%
  mutate(year = substr(year, 1, 4)) %>%
  mutate(year = gsub("1202", '2020', year),
         year = gsub("2202", '2020', year),
         year = gsub("3202", '2020', year),
         year = gsub("4202", '2020', year)) %>%
  pivot_longer(-c(year, category),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  group_by(year, category, variable) %>%
  summarise(value = sum(value))

DBI::dbWriteTable(con,
                  "packaging_recovery_recycling",
                  summary_table,
                  append: TRUE)

# Create non-detailed summary table

