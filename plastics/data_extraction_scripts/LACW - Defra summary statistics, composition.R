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
# *******************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./scripts/functions.R", 
       local = knitr::knit_global())

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

## Wales
# Composition data
# Collection data
# https://statswales.gov.wales/Catalogue/Environment-and-Countryside/Waste-Management/Local-Authority-Municipal-Waste/annualwastereusedrecycledcomposted-by-localauthority-source-year

## Q100 - treatment routes

# 2022-23 

# download.file(
#   "https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Q100_Waste_collection_data_England_2022_23.csv",
#   "./raw_data/collection/Q100_Waste_collection_data_England_2022_23.csv"
# )

Q100_22_23 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2022_23.csv") %>%
  row_to_names(1) %>%
  clean_names() %>%
  # filter(str_detect(material, 'Exporter')) %>%
  select(5,7,12,21,23) %>%
  mutate(year = 2022) %>%
  mutate_at(c('total_tonnes'), as.numeric) %>%
  filter(facility_type != "Final Destination") %>%
  dplyr::rename(value = 4) %>%
  ungroup() %>%
  as.data.frame() %>%
  mutate(material=replace_na(material, "Not specified")) %>%
  group_by(authority, facility_type, material, year) %>%
  summarise(value = sum(value)) %>%
  ungroup()

# Q100$period <- 
#   factor(Q100$period, levels = c("Apr 22 - Jun 22",
#                                "Jul 22 - Sep 22",
#                                "Oct 22 - Dec 22",
#                                "Jan 23 - Mar 23"))


# 2021-22 

# download.file(
#   "https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Q100_Waste_collection_data_England_2021-22.csv",
#   "./raw_data/collection/Q100_Waste_collection_data_England_2021_22.csv"
# )

Q100_21_22 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2021_22.csv") %>%
  row_to_names(1) %>%
  clean_names() %>%
  # filter(str_detect(material, 'Exporter')) %>%
  select(5,7,12,21,23) %>%
  mutate(year = 2021) %>%
  mutate_at(c('total_tonnes'), as.numeric) %>%
  filter(facility_type != "Final Destination") %>%
  dplyr::rename(value = 4) %>%
  ungroup() %>%
  as.data.frame() %>%
  mutate(material=replace_na(material, "Not specified")) %>%
  group_by(authority, facility_type, material, year) %>%
  summarise(value = sum(value)) %>%
  ungroup()

# 2020-21

# download.file(
#   "https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Q100_Waste_collection_data_England_2020-21.csv",
#   "./raw_data/collection/Q100_Waste_collection_data_England_2020_21.csv"
# )

Q100_20_21 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2020_21.csv") %>%
  row_to_names(1) %>%
  clean_names() %>%
  # filter(str_detect(material, 'Exporter')) %>%
  select(5,7,12,21,23) %>%
  mutate(year = 2020) %>%
  mutate_at(c('total_tonnes'), as.numeric) %>%
  filter(facility_type != "Final Destination") %>%
  dplyr::rename(value = 4) %>%
  ungroup() %>%
  as.data.frame() %>%
  mutate(material=replace_na(material, "Not specified")) %>%
  group_by(authority, facility_type, material, year) %>%
  summarise(value = sum(value)) %>%
  ungroup()

# 2019-20

# download.file(
#   "https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Q100_Waste_collection_data_England_2019-20.csv",
#   "./raw_data/collection/Q100_Waste_collection_data_England_2019_20.csv"
# )

Q100_19_20 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2019_20.csv") %>%
  row_to_names(1) %>%
  clean_names() %>%
  # filter(str_detect(material, 'Exporter')) %>%
  select(5,7,12,21,23) %>%
  mutate(year = 2019) %>%
  mutate_at(c('total_tonnes'), as.numeric) %>%
  filter(facility_type != "Final Destination") %>%
  dplyr::rename(value = 4) %>%
  ungroup() %>%
  as.data.frame() %>%
  mutate(material=replace_na(material, "Not specified")) %>%
  group_by(authority, facility_type, material, year) %>%
  summarise(value = sum(value)) %>%
  ungroup()

# 2018-19

# download.file(
#   "http://data.defra.gov.uk/Waste/Q100_Waste_collection_data_England_2018-19.csv",
#   "./raw_data/collection/Q100_Waste_collection_data_England_2018_19.csv"
# )

Q100_18_19 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2018_19.csv") %>%
  row_to_names(1) %>%
  clean_names() %>%
  # filter(str_detect(material, 'Exporter')) %>%
  select(5,7,12,21,23) %>%
  mutate(year = 2018) %>%
  mutate_at(c('total_tonnes'), as.numeric) %>%
  filter(facility_type != "Final Destination") %>%
  dplyr::rename(value = 4) %>%
  ungroup() %>%
  as.data.frame() %>%
  mutate(material=replace_na(material, "Not specified")) %>%
  group_by(authority, facility_type, material, year) %>%
  summarise(value = sum(value)) %>%
  ungroup()

# # 2017-18
# 
# download.file(
#   "http://data.defra.gov.uk/Waste/Collection_data_England_2017_2018.csv",
#   "./raw_data/collection/Q100_Waste_collection_data_England_2017_18.csv"
# )
# 
# Q100_17_18 <- read_csv("./raw_data/collection/Q100_Waste_collection_data_England_2017_18.csv") %>%
#   # row_to_names(1) %>%
#   clean_names() %>%
#   # filter(str_detect(material, 'Exporter')) %>%
#   select(5,7,12,21,23) %>%
#   mutate(year = 2017) %>%
#   mutate_at(c('total_tonnes'), as.numeric) %>%
#   filter(facility_type != "Final Destination") %>%
#   dplyr::rename(value = 4) %>%
#   ungroup() %>%
#   as.data.frame() %>%
#   mutate(material=replace_na(material, "Not specified")) %>%
#   group_by(authority, facility_type, material, year) %>%
#   summarise(value = sum(value)) %>%
#   ungroup()


Q100_all <-
  rbindlist(
    list(
      Q100_22_23,
      Q100_21_22,
      Q100_20_21,
      Q100_19_20,
      Q100_18_19
    ),
    use.names = TRUE
  )

DBI::dbWriteTable(con,
                  "q100",
                  Q100_all,
                  overwrite = TRUE)


