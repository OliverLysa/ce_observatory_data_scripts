##### **********************

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
require(readODS)
require(ggplot2)
require(plotly)
require(leaflet)
require(leafletplugins)
require(sf)
require(broom)
require(netstat)
require(ggridges)
library(geojson)
library(geojsonsf)
require(jsonlite)

# *******************************************************************************
# Options and functions
# *******************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./functions.R", 
       local = knitr::knit_global())

# *******************************************************************************
# Options and functions

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

# Used: https://mapshaper.org/ to simplify the map

# read dataset
shapefile <-
  sf::st_read(
    "./raw_data/geospatial/Local_Authority_Districts_December_2023_Boundaries_UK_BFE_-2600600853110041429/LAD_DEC_2023_UK_BFE.shp",
    quiet = TRUE
  )

# Set projection
shapefile <-
  st_transform(shapefile, crs = '+proj=longlat +datum=WGS84')

# Left join value data to shapefile
shapefile_data <- left_join(shapefile, expenditures,
                       by = c("LAD23CD" = "ONS Code"))

# Convert to geoJSON for javascript leaflet
geo_json = st_as_sf(shapefile_data)

# Write to geoJSON format
st_write(geo_json, "geo_json_trial.geojson")
# This can be used in javascript

# Write table
DBI::dbWriteTable(con,
                  "map_LA_expenditure",
                  geo_json,
                  overwrite = TRUE)

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
