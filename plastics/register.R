# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx",
  "tabulizer",
  "docxtractr",
  "campfin",
  "rjson",
  "zipcodeR",
  "ggmap")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Accredited reprocessors

#### Data for mapping reprocessors

# # Specify JSON file
# json_2024 <- 
#   fromJSON(file="./plastics/NPWD_registers/json/final_json_Public Register 2024.json")
# 
# # Output
# output_dataframe <- data.frame(matrix(unlist(json_2024), 
#                                      ncol = length(json_data[[1]]), byrow = TRUE), stringsAsFactors = FALSE)

# Import csv file-list
files_list <- 
  list.files("./plastics/NPWD_registers/csv",
             pattern='.csv')

# Import data and create postcode column
csv_data <- 
  lapply(paste("./plastics/NPWD_registers/csv/",
               files_list,sep = ""), read_csv) %>%
  dplyr::bind_rows() %>%
  mutate(year = substrRight(last_changed, 4)) %>%
  mutate(postcode = substrRight(site_address, 8)) %>%
  mutate_at(c('postcode'), trimws) 

# Convert postcode to lat/long
# Require an API key from Google Maps Platform
csv_data$location <- 
  geocode(csv_data$postcode)

# Prepare table for upload
geo_data <- csv_data %>%
  as.data.frame() %>%
  clean_names() %>%
  dplyr::mutate(LONG = location$lon, .before = 1) %>%
  dplyr::mutate(LAT = location$lat, .before = 1) %>%
  select(1,2,4:10,13:16) %>%
  na.omit()

DBI::dbWriteTable(con,
                  "Packaging_reprocessors_spatial",
                  geo_data,
                  overwrite = TRUE)

write_xlsx(geo_data,
           "./cleaned_data/register_geo_data.xlsx")

leaflet(geo_data) %>% addTiles() %>%
  addCircles(lng = ~LONG, lat = ~LAT, 
                   popup = ~accredited_organisation)
