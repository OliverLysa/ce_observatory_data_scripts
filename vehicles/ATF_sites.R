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
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "onsr",
              "ggmap")

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

# https://environment.data.gov.uk/public-register/view/api-reference

# Import the data
ATF_locations <- read_csv("./raw_data/end-of-life-vehicles/end-of-life-vehicles.csv") %>%
  clean_names() %>%
  mutate(year_issed = str_sub(date_issued, 1, 4))

# Convert postcode to lat/long
# Require an API key from Google Maps Platform
# 29 not classified
ATF_locations$location <- 
  ggmap::geocode(ATF_locations$postcode)

# Prepare table for upload
ATF_locations <- ATF_locations %>%
  as.data.frame() %>%
  dplyr::mutate(LONG = location$lon, .before = 1) %>%
  dplyr::mutate(LAT = location$lat, .before = 1) 

# Final table
ATF_locations_final <- ATF_locations %>%
  select(1,2,3,4,5,6,9,10,12) %>%
  na.omit() 

# 
write.csv(ATF_locations_final, "./cleaned_data/ATF_locations.csv")
