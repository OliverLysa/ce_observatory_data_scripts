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

# *******************************************************************************
# Options and functions

#********************************************************************************

# Following python script downloading all files from NPWD, list files in groups corresponding to the variables they cover and file type - recycling and recovery summary
pollution_inventory_files <- 
  list.files("./raw_data/Pollution Inventory/",
             pattern='Pollution.+xlsx')

a <- expand_grid(
  file = list.files("./raw_data/Pollution Inventory", full.names = TRUE),
  sheet = seq(2)
) %>%
  transmute(data = file %>% map2(sheet, ~ read_excel(path = .x, sheet = .y))) %>%
  pull(data) %>%
  dplyr::bind_rows()

