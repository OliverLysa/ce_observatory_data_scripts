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

## Q100

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
