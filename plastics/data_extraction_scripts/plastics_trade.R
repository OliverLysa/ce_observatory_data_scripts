##### **********************
# Purpose: Restructure trade data downloaded from the UKTradeInfo API interface in the observatory content management system

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

# Primary plastics
# 39076020
# 39076080
# 39076100
# 39076900
# 39206212
# 39206219
# 39206290
# 39206900

PET_primary_1 <-
  # Import data
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202406 - 39076020 to 39076900.csv") 

PET_primary_2 <-
  # Import data
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202406 - 39206212 to 39206290.csv") 

PET_primary <-
  PET_primary_1 %>%
  bind_rows(PET_primary_2) %>%
  filter(! Cn8 %in% c("39206212")) %>%
  unite(Description, Cn8, Description, sep = " - ") %>%
  select(1, 5:10) %>%
  mutate(NetMass = NetMass /1000) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  pivot_longer(-c(Description, Year, FlowType, Country),
               names_to = "Variable",
               values_to = "Value") %>%
  filter(Variable != "SuppUnit") 

DBI::dbWriteTable(con, "plastic_PET_primary",
                  PET_primary,
                  overwrite = TRUE)

# Import all packaging scrap data

trade_codes <- (c(391510,
                  391510,
                  391530,
                  391590))

# Plastic waste/scrap
plastic_waste_trade_all <-
  # Import data
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202409 - 391510 to 391590.csv") %>%
  unite(Description, Cn8, Description, sep = " - ") %>%
  select(1, 5:10) %>%
  mutate(NetMass = NetMass /1000) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  pivot_longer(-c(Description, Year, FlowType, Country),
               names_to = "Variable",
               values_to = "Value") %>%
  filter(Variable != "SuppUnit") %>%
  group_by(Year, Variable, Description, FlowType, Country) %>%
  summarise(sum = sum(Value))

DBI::dbWriteTable(con, "plastic_waste_exports_all",
                  plastic_waste_exports_all,
                  overwrite = TRUE)
