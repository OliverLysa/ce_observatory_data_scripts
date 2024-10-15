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

# *******************************************************************************
# Options and functions
#********************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./scripts/functions.R", 
       local = knitr::knit_global())

## Q100 - treatment routes

download.file(
  "https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Q100_Waste_collection_data_England_2022_23.csv",
  "./raw_data/collection/Q100_Waste_collection_data_England_2022_23.csv"
)

Q100 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2022_23.csv") %>%
  row_to_names(1) %>%
  clean_names() %>%
  filter(str_detect(material, 'PET')) %>%
  select(5,7,12,21) %>%
  mutate(year = 2022) %>%
  mutate_at(c('total_tonnes'), as.numeric) %>%
  group_by(authority, facility_type, year) %>%
  summarise(value = sum(total_tonnes))

DBI::dbWriteTable(con,
                  "q100",
                  Q100,
                  overwrite = TRUE)

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
  
combined_collection <-
  left_join(collection_flows, composition, "collection_route") %>%
  mutate(value = tonnages * freq) %>%
  select(-c(freq,tonnages)) %>%
  mutate(across(is.numeric, round, digits=2))

DBI::dbWriteTable(con,
                  "LACW_composition",
                  combined_collection,
                  overwrite = TRUE)
         