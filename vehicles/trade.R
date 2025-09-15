# Author: Oliver Lysaght
# Purpose: Calculate apparent consumption for vehicles

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
              "janitor")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading 
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Functions and options
# *******************************************************************************

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Trade
# *******************************************************************************
#

# Codes to remove as caravans
codes_to_remove <- c("87032311",
                     "87033211",
                     "87033311")

trade_data_vehicles <- read_csv("./raw_data/trade_data_vehicles.csv") %>%
  clean_names() %>%
  filter(! cn8 %in% codes_to_remove) %>%
  group_by(cn8, description, year, flow_type) %>%
  summarise(value = sum(value, na.rm = TRUE),
            net_mass = sum(net_mass, na.rm = TRUE),
            supp_unit = sum(supp_unit, na.rm = TRUE)) %>%
  pivot_longer(-c(cn8, description,year, flow_type),
               names_to = "variable",
               values_to = "value") %>%
  pivot_wider(names_from = flow_type,
              values_from = value) %>%
  clean_names() %>%
  # mutate(net_imports = eu_imports + non_eu_imports - eu_exports - non_eu_exports) %>%
  # select(cn8, description,year, variable, net_imports) %>%
  mutate(new_used = case_when(str_detect(description, "new") ~ "New",
                              str_detect(description, "used") ~ "Used")) %>%
  ungroup() %>%
  mutate(fuel = case_when(
    str_detect(description, "with only diesel") ~ "Diesel",
    str_detect(description, "with only spark-ignition internal combustion") ~ "Petrol",
    str_detect(description, "with only electric motor for propulsion") ~ "BEV",
    str_detect(description, "capable of being charged by plugging") ~ "PHEV",
    str_detect(description, "with both diesel engine and electric motor as motors for propulsion") ~ "HEV",
    str_detect(description, "with both spark-ignition internal combustion reciprocating piston engine and electric motor as motors for propulsion") ~ "HEV")) %>%
  na.omit() %>%
  group_by(fuel, variable, year) 

# %>%
#   summarise(value = sum(net_imports, na.rm = TRUE))

write_csv(trade_data_vehicles, "./cleaned_data/trade_data_vehicles_detail.csv")
