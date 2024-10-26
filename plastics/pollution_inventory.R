##### **********************
# Pollution inventory

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

# Turn off scientific notation
options(scipen=999)

# *******************************************************************************
# Options and functions

#********************************************************************************

# Emissions below reporting threshold are not submitted.included here. 
# Route name - Receiving media for the substance - air, land, controlled waters or wastewater
# The regulated industry sector that the activity is covered by.

# Following python script downloading all files from NPWD, list files in groups corresponding to the variables they cover and file type - recycling and recovery summary
# pollution_inventory_files <- 
#   list.files("./raw_data/Pollution Inventory/",
#              pattern='Pollution.+xlsx')
# 
# a <- expand_grid(
#   file = list.files("./raw_data/Pollution Inventory", full.names = TRUE),
#   sheet = seq(2)
# ) %>%
#   transmute(data = file %>% map2(sheet, ~ read_excel(path = .x, sheet = .y))) %>%
#   pull(data) %>%
#   dplyr::bind_rows()

# Waste transfer
PI_transfer_22 <- read_excel("./raw_data/Pollution Inventory/2022 Pollution Inventory Dataset v2.xlsx",
                             sheet = 1) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2022)

PI_transfer_21 <- read_excel("./raw_data/Pollution Inventory/2021 Pollution Inventory Dataset.xlsx",
                             sheet = 1) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2021)

PI_transfer_20 <- read_excel("./raw_data/Pollution Inventory/2020 Pollution Inventory Dataset v2.xlsx",
                             sheet = 1) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2020)

PI_transfer_19 <- read_excel("./raw_data/Pollution Inventory/2019 Pollution Inventory Dataset v2.xlsx",
                             sheet = 1) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2019)

PI_transfer_18 <- read_excel("./raw_data/Pollution Inventory/2018 Pollution Inventory.xlsx",
                             sheet = 1) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2018)

PI_transfer_17 <- read_excel("./raw_data/Pollution Inventory/2017 Pollution Inventory Dataset.xlsx",
                             sheet = 1) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2017)

PI_transfer_16 <- read_excel("./raw_data/Pollution Inventory/2016 Pollution Inventory dataset - version 2.xlsx",
                             sheet = 2) %>%
  row_to_names(9) %>%
  select(8:14) %>%
  mutate(year = 2016)

PI_transfer_15 <- read_excel("./raw_data/Pollution Inventory/2015 Pollution Inventory Dataset.xlsx",
                             sheet = 1) %>%
  row_to_names(5) %>%
  select(5:11) %>%
  mutate(year = 2015)

PI_transfer_14 <- read_excel("./raw_data/Pollution Inventory/2014 Pollution Inventory Dataset.xlsx",
                             sheet = 1) %>%
  row_to_names(5) %>%
  select(5:11) %>%
  mutate(year = 2014)

PI_transfer_13 <- read_excel("./raw_data/Pollution Inventory/2013 Pollution Inventory Dataset.xlsx",
                             sheet = 1) %>%
  row_to_names(5) %>%
  select(5:11) %>%
  mutate(year = 2013)

PI_all <-
  rbindlist(
    list(
      PI_transfer_22,
      PI_transfer_21,
      PI_transfer_20,
      PI_transfer_19,
      PI_transfer_18,
      PI_transfer_17,
      PI_transfer_16,
      PI_transfer_15,
      PI_transfer_14,
      PI_transfer_13
    ),
    use.names = FALSE
  ) %>%
  clean_names() %>%
  mutate_at(c('quantity_released_kg'), as.numeric) %>%
  na.omit() %>%
  unite(regulated_industry_sub_sector, c(regulated_industry_sector, regulated_industry_sub_sector), sep = "-", remove = FALSE)

DBI::dbWriteTable(con,
                  "pollution-inventory",
                  PI_all,
                  overwrite = TRUE)


# Route name: The Waste Framework Directive reference for the disposal or recovery activity carried out e.g. D1, R5.
# 

