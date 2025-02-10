##### **********************
# Purpose: Download LA expenditure data

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
# Data
# *******************************************************************************

# 2020-2021

download.file(
  "https://assets.publishing.service.gov.uk/media/63525b0f8fa8f554c3ad8607/RO5_2020-21_data_by_LA.ods",
  "./raw_data/LA_expenditures_20_21.ods"
)

# Street cleansing (not chargeable to Highways)
street_cleansing <-
  read_ods("./raw_data/LA_expenditures_20_21.ods", sheet = 3) %>%
  select(1:3,5,251:257) %>%
  row_to_names(6) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Street cleansing")

waste_collection <-
  read_ods("./raw_data/LA_expenditures_20_21.ods", sheet = 3) %>%
  select(1:3,5,258:265) %>%
  row_to_names(6) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Waste collection")

waste_disposal <-
  read_ods("./raw_data/LA_expenditures_20_21.ods", sheet = 3) %>%
  select(1:3,5,266:273) %>%
  row_to_names(6) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Waste disposal")

trade_waste <-
  read_ods("./raw_data/LA_expenditures_20_21.ods", sheet = 3) %>%
  select(1:3,5,274:281) %>%
  row_to_names(6) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Trade waste")

recycling <-
  read_ods("./raw_data/LA_expenditures_20_21.ods", sheet = 3) %>%
  select(1:3,5,282:289) %>%
  row_to_names(6) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Recycling")

waste_minimisation <-
  read_ods("./raw_data/LA_expenditures_20_21.ods", sheet = 3) %>%
  select(1:3,5,290:297) %>%
  row_to_names(6) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Waste minimisation")

# Bind the data together
expenditures <-
  rbindlist(list(street_cleansing,
            waste_collection,
            waste_disposal,
            trade_waste,
            recycling,
            waste_minimisation),
            use.names=TRUE) %>%
  mutate(year = "2020-21")


# 2021-22

download.file(
  "https://assets.publishing.service.gov.uk/media/655e19a3c2dcb500140b82bc/RO5_2021-22_data_by_LA_Live.ods",
  "./raw_data/LA_expenditures_21_22.ods"
)

# Street cleansing (not chargeable to Highways)
street_cleansing_21_22 <-
  read_ods("./raw_data/LA_expenditures_21_22.ods", sheet = 4) %>%
  select(1:3,5,251:257) %>%
  row_to_names(11) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Street cleansing")

waste_collection_21_22 <-
  read_ods("./raw_data/LA_expenditures_21_22.ods", sheet = 4) %>%
  select(1:3,5,258:265) %>%
  row_to_names(11) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Waste collection")

waste_disposal_21_22 <-
  read_ods("./raw_data/LA_expenditures_21_22.ods", sheet = 4) %>%
  select(1:3,5,266:273) %>%
  row_to_names(11) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Waste disposal")

trade_waste_21_22 <-
  read_ods("./raw_data/LA_expenditures_21_22.ods", sheet = 4) %>%
  select(1:3,5,274:281) %>%
  row_to_names(11) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Trade waste")

recycling_21_22 <-
  read_ods("./raw_data/LA_expenditures_21_22.ods", sheet = 4) %>%
  select(1:3,5,282:289) %>%
  row_to_names(11) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Recycling")

waste_minimisation_21_22 <-
  read_ods("./raw_data/LA_expenditures_21_22.ods", sheet = 4) %>%
  select(1:3,5,290:297) %>%
  row_to_names(11) %>%
  na.omit() %>%
  pivot_longer(-c(1:4),
               names_to = "variable",
               values_to = "value") %>%
  mutate(expenditure_category = "Waste minimisation")

# Bind the data together
expenditures_21_22 <-
  rbindlist(list(street_cleansing_21_22,
                 waste_collection_21_22,
                 waste_disposal_21_22,
                 trade_waste_21_22,
                 recycling_21_22,
                 waste_minimisation_21_22),
            use.names=TRUE) %>%
  mutate(year = "2021-22")

expenditures <- expenditures %>%
  bind_rows(expenditures_21_22) %>%
  mutate_at(c('value'), as.numeric) %>%
  mutate(variable = gsub("\\(.*", "", variable)) %>%
  mutate_at(c('variable'), trimws)

# Used: https://mapshaper.org/ to simplify the map

# read dataset
shapefile <-
  sf::st_read(
    "./raw_data/geospatial/simplified_Local_Authority_Districts_December_2023_Boundaries_UK_BFE_7168133065712352501.geojson",
    quiet = TRUE
  )

# Set projection
shapefile <-
  st_transform(shapefile, crs = '+proj=longlat +datum=WGS84')

# Left join value data to shapefile
shapefile_data <- inner_join(shapefile, expenditures,
                            by = c("LAD23CD" = "ONS Code"))

# Write to geoJSON format
st_write(shapefile_data, "./cleaned_data/map_LA_expenditures_simplified.geojson")
# This can be used in javascript

DBI::dbWriteTable(con,
                  "map_LA_expenditures",
                  shapefile_data,
                  overwrite = TRUE)
