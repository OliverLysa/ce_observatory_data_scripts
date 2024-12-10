## Q100 - treatment routes

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
