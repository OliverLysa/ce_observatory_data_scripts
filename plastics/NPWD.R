##### **********************
# National Packaging Waste Database
# Description: Used by obligated businesses and compliance schemes to register with DA-level environment agencies and for preprocessors and exporters to submit quarterly returns on, and issue, EPRNS and ePERNs.
# Geographical scope: UK-wide
# Frequency of updates: Monthly - Annual
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
  summarise(value = sum(value)) %>%
  filter(year != "2024")

DBI::dbWriteTable(con,
                    "packaging_recovery_recycling",
                    summary_table,
                    overwrite = TRUE)

write_xlsx(summary_table,
                 "./cleaned_data/NPWD_recycling_recovery_summary.xlsx")

# Detail table
detail_table <- 
quarterly_recycling_df %>%
  mutate(year=ifelse(grepl("Table 1",x2), as.character(x2), NA), .before = x2) %>%
  mutate(year = gsub("[^0-9]", "", year)) %>%
  mutate(across(c('year'), substr, 2, nchar(year))) %>%
  mutate(year = substr(year, 1, 4)) %>%
  fill(year, .direction = "down") %>%
  mutate(year = gsub("1202", '2020', year),
         year = gsub("2202", '2020', year),
         year = gsub("3202", '2020', year),
         year = gsub("4202", '2020', year)) %>%
  filter(! str_detect(x2, 'Table 1')) %>%
  rename(tab = 1) %>%
  mutate(tab=ifelse(grepl("Table",tab), tab, NA), .before = x2) %>%
  mutate(rep=ifelse(grepl("Reprocessors",x2), x2, NA), .before = x2) %>%
  mutate(exp=ifelse(grepl("Exporters",x2), x2, NA), .before = x2) %>%
  mutate(combined = coalesce(tab, rep, exp), .before = x2) %>%
  fill(combined, .direction = "down") %>%
  filter(! combined %in% c("Reprocessors", "Exporters")) %>%
  select(-c(tab, rep, combined)) %>%
  row_to_names(row_number = 2) %>%
  clean_names() %>%
  select(where(not_all_na)) %>%
  mutate(na_3 = coalesce(na_3, na_4)) %>%
  mutate(gross1_received = coalesce(gross1_received, gross1_exported, gross1_total)) %>%
  # delete gross1exported where matching with gross1
  mutate_at(c('gross1_received','gross1_exported','gross1_total','na_8','na_10','net2_exported'), as.numeric) %>%
  mutate(gross1_exported = ifelse(gross1_received == gross1_exported, NA, gross1_exported)) %>%
  mutate(gross1_total = ifelse(gross1_received == gross1_total, NA, gross1_total)) %>%
  mutate(gross1_exported = coalesce(gross1_exported, na_8, gross1_total, na_10)) %>%
  mutate(gross_total = gross1_received + gross1_exported) %>%
  mutate(net2_received = ifelse(net2_received == gross_total, NA, net2_received)) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  mutate(net2_exported = ifelse(net2_exported == gross_total, NA, net2_exported)) %>%
  mutate(net2_received = coalesce(net2_received, na_12)) %>%
  mutate(net2_received = coalesce(net2_received, na_13)) %>%
  mutate(net2_received = coalesce(net2_received, na_14)) %>%
  # mutate(net2_exported = coalesce(net2_received, na_14)) %>%
  mutate_at(c('net2_received','net2_exported','net2_total','na_17','na_13'), as.numeric) %>%
  mutate(net_total = net2_received + net2_exported) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  mutate(net2_exported = coalesce(net2_exported, net2_total)) %>%
  mutate(net2_exported = coalesce(net2_exported, na_13)) %>%
  mutate(net2_exported = coalesce(net2_exported, na_17)) %>%
  select(1:3,5,6,10,11,21) %>%
  mutate(net_total = net2_received + net2_exported) %>%
  drop_na(gross1_received) %>%
  rename(year = 1,
         material_1 = 2,
         material_2 = 3,
         `Gross received` = 4,
         `Gross exported` = 5,
         `Net received` =6,
          `Net exported`= 7,
         `Gross total` =8,
         `Net total` =9) %>%
  mutate(material_2 = coalesce(material_2, material_1)) %>%
  pivot_longer(-c(year, material_1, material_2),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  group_by(year, material_1, material_2, variable) %>%
  summarise(value = sum(value,na.rm =TRUE)) %>%
  filter(year != "2024") %>%
  unite(material_2, c(material_1, material_2), sep = " - ", remove = TRUE)

write_xlsx(detail_table,
           "./cleaned_data/NPWD_recycling_recovery_detail.xlsx")

# NA OMIT in calculation
  
DBI::dbWriteTable(con,
                  "packaging_recovery_recycling_detail",
                  detail_table,
                  overwrite = TRUE)
