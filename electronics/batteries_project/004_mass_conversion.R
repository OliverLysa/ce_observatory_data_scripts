##### **********************
# Author: Oliver Lysaght
# Purpose: Convert unit-level data to mass terms
# Outputs: Apparent consumption in mass terms

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
              "janitor",
              "devtools",
              "knitr")

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

# Import average mass data by UNU from WOT project
UNU_mass <- read_csv(
  "./electronics/batteries_project/raw_data_inputs/htbl_Key_Weight.csv") %>%
  clean_names() %>%
  group_by(unu_key, year) %>%
  summarise(value = mean(average_weight)) %>%
  rename(unu =1)

# Read in interpolated inflow data and filter to consumption of units
inflow_indicators <-
  read_csv("./electronics/batteries_project/cleaned_data/inflow_indicators_interpolated.csv") %>%
  mutate_at(c('year'), as.numeric) %>%
  # filter(indicator == "apparent_consumption") %>%
  na.omit() %>%
  mutate(variable = "inflow") %>%
  rename(unu = unu_key)

# Join by unu key and year
inflow_mass <- left_join(inflow_indicators, UNU_mass, by = c("year", "unu")) %>%
  mutate_at(c("value.y"), as.numeric) %>%
  mutate(mass_inflow = (value.x*value.y)/1000) %>%
  select(c(`unu`,
           `year`,
           mass_inflow)) %>%
  rename(year = 2,
         value = 3) %>%
  mutate(variable = "inflow") %>%
  mutate(unit = "mass")

inflow_mass_wide <- inflow_mass %>%
  pivot_wider(names_from = unu,
            values_from = value)

# Write xlsx to the cleaned data folder
write_csv(inflow_mass, 
           "./electronics/batteries_project/cleaned_data/inflow_unu_mass.csv")

write_csv(inflow_mass_wide, 
          "./electronics/batteries_project/cleaned_data/inflow_unu_mass_wide.csv")

