##### **********************
# Author: Oliver Lysaght
# Purpose:
# Inputs:  Environmental Permitting Regulations - Waste Sites Quarterly Summary
# Required annual updates:

# Note: This dataset contains information about currently effective inert landfill sites. It does not contain details of non-inert landfill sites and large waste treatment sites.  

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
  "ggmap",
  "fuzzyjoin",
  "DBI")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Import the data
EPR_sites <- read_excel("./raw_data/Permitted waste operations - end June 2024.xlsx",
                      sheet = "Waste Operations") %>%
  row_to_names(15) %>%
  clean_names() %>%
  mutate(facility_type_match = str_remove(primary_site_type, '(?<= ).*')) %>%
  mutate_at(c('facility_type_match'), trimws)

# Convert date to year
EPR_sites$date_issued <- 
  convert_to_date(EPR_sites$date_issued, character_fun = lubridate::dmy, string_conversion_failure = "warning") 

# Derive year issued from date
EPR_sites <- EPR_sites %>%
  mutate(year_issued = substr(date_issued, 1, 4)) 

# Import regime lookup
lookup <- read_excel("./raw_data/Permitted waste operations - end June 2024.xlsx",
                     sheet = "Site Type Key")  %>%
  row_to_names(2) %>%
  clean_names()

# Join regime type and construct postcode
EPR_sites <- 
  left_join(EPR_sites, lookup, by=c("facility_type_match" = "code")) %>%
  mutate(postcode = substrRight(site_address_and_postcode, 9)) %>%
  mutate(postcode = gsub(",","", postcode)) %>%
  mutate_at(c('postcode'), trimws)

# Convert postcode to lat/long
# Require an API key from Google Maps Platform
EPR_sites$location <- 
  geocode(EPR_sites$postcode)

EPR_sites_final <- EPR_sites %>% 
  mutate(regime=replace_na(regime, "Other"))

# Save table locally
write_csv(EPR_sites, 
           "./cleaned_data/EPR_sites_location.csv")

# Prepare table for upload
geo_data <- EPR_sites_final %>%
  as.data.frame() %>%
  clean_names() %>%
  dplyr::mutate(LONG = location$lon, .before = 1) %>%
  dplyr::mutate(LAT = location$lat, .before = 1) %>%
  select(1,2,3,5,6:8,10:11,15,17) %>%
  na.omit()

DBI::dbWriteTable(con,
                  "EPR_waste_sites",
                  geo_data,
                  overwrite = TRUE)
