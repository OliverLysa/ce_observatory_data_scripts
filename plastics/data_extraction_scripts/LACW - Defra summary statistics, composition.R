##### **********************
# Purpose: Download and integrate waste composition data and defra collection statistics

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
              "onsr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Options and functions
# *******************************************************************************

# Turn off scientific notation
options(scipen=999)

# *******************************************************************************
# Data
# *******************************************************************************

## Import and clean composition data

composition <- read_excel("./raw_data/waste_composition/UK NATIONAL COMPOSITION ESTIMATES 2017.xlsx",
                   sheet = "ENGLAND") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(2,5,15,16) %>%
  na.omit() %>%
  slice(-c(1,2,87)) %>%
  rename(category_level = 1,
         waste_type = 2) %>%
  filter(category_level == "3") %>%
  select(-category_level) %>%
  pivot_longer(-waste_type,
               names_to = "collection_route",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  group_by(collection_route, waste_type) %>%
  summarise(value = sum(value)) %>%
  mutate(freq = value / sum(value)) %>%
  mutate(collection_route = case_when(str_detect(collection_route, "household_recycling_total") ~ "recycling",
                          str_detect(collection_route, "household_residual_total") ~ "residual")) %>%
  select(-value)

write_csv(composition,
         "./cleaned_data/waste_collection_composition_all.csv") 

# Import and clean tonnages data 

download.file(
  "https://assets.publishing.service.gov.uk/media/65b8f10f4ec51d0014c9f160/WFH_England_Data_202223.ods",
  "./raw_data/WFH_England_Data_202223.ods")

collection_flows <- read_ods("./raw_data/WFH_England_Data_202223.ods",
                          sheet = "WfH_Calendar_") %>%
  row_to_names(1) %>%
  slice(2,3,7) %>%
  rename(collection_route = 1) %>%
  mutate_at(
    .vars = 2:14,
    .funs = as.numeric
  ) %>%
  pivot_longer(-collection_route,
         names_to = "year",
         values_to = "tonnages") %>%
  mutate(collection_route = case_when(str_detect(collection_route, "of which sent for dry recycling") ~ "recycling",
                                      str_detect(collection_route, "of which sent for organic recycling") ~ "recycling",
                                      str_detect(collection_route, "Residual waste") ~ "residual")) %>%
  group_by(collection_route, year) %>%
  summarise(tonnages = sum(tonnages)) %>%
  mutate(tonnages = tonnages *1000)

# # download.file(
# #   "https://assets.publishing.service.gov.uk/media/65e1b9ec3f6945001103606d/LA_and_Regional_Spreadsheet_2022-23_for_Web_revised.ods",
# #   "./raw_data/LA_collection.ods")
# # 
collection_flows_LA <- read_ods("./raw_data/LA_collection.ods",
                             sheet = "Table_1") %>%
  row_to_names(3) %>%
  select(1,2,5,6,21:23) %>%
  clean_names() %>%
  filter(authority_type != "Collection") %>%
  mutate_at(c(5:7), as.numeric) %>%
  group_by(financial_year,region) %>%
  summarise(recycling = sum(local_authority_collected_waste_sent_for_recycling_composting_reuse_tonnes),
            residual = sum(local_authority_collected_waste_not_sent_for_recycling_tonnes),
            rejects = sum(local_authority_collected_estimated_rejects_tonnes)) %>%
  select(-rejects) %>%
  pivot_longer(-c(financial_year,region),
               names_to = "collection_route",
               values_to = "tonnages") %>%
  group_by(financial_year) %>%
  summarise(value = sum(tonnages))

#  Join data
combined_collection <-
  left_join(collection_flows_LA, composition, "collection_route") %>%
  mutate(value = tonnages * freq) %>%
  select(-c(freq,tonnages)) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  mutate(collection_route = str_to_title(collection_route)) %>%
  rename(year = financial_year)

DBI::dbWriteTable(con,
                  "LACW_composition",
                  combined_collection,
                  overwrite = TRUE)

## Treatment shares
treatment_shares_LA <- read_ods("./raw_data/LA_collection.ods",
                                sheet = "Table_2a") %>%
  row_to_names(6) %>%
  clean_names() %>%
  slice(1:10) %>%
  filter(!grepl('percentage', na)) %>%
  select(1:24) %>%
  rename(route = 1) %>%
  pivot_longer(-route, 
               names_to = "year",
               values_to = "value") %>%
  mutate(year = substr(year, 2, 5)) %>%
  mutate(route = gsub("Incineration with EfW", "Incineration", route)) %>%
  mutate(route = gsub("Incineration without EfW 1", "Incineration", route)) %>%
  mutate_at(c('year','value'), as.numeric) %>%
  filter(!grepl('Recycled|Other', route)) %>%
  group_by(route, year) %>%
  summarise(value = sum(value)) %>%
  ungroup() %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  select(route, year, percentage)

## Wales
# Composition data
# Collection data
# https://statswales.gov.wales/Catalogue/Environment-and-Countryside/Waste-Management/Local-Authority-Municipal-Waste/annualwastereusedrecycledcomposted-by-localauthority-source-year
