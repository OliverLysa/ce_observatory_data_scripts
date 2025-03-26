##### **********************
# Author: Oliver Lysaght
# Purpose: Import preferred total packaging placed on market data, estimate flows by polymer and application, apportion to countries across the UK

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c("writexl",
              "readxl",
              "readODS",
              "tidyverse",
              "data.table",
              "janitor",
              "xlsx",
              "zoo")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Analysis
# *******************************************************************************

###############
# FLOW GROUP 1

# Imports the latest version of the Defra UK Statistics on Waste (https://www.gov.uk/government/statistics/uk-waste-data)
# And imports the data on packaging
official_defra_packaging_pom <- read_ods( 
  "./raw_data/UK_Statistics_on_Waste_dataset_September_2024_accessible (1).ods",
  sheet = "Packaging") %>%
  row_to_names(6) %>%
  clean_names() %>%
  filter(material != "Total recycling and recovery", 
         material != "Total recycling") %>%
  filter(! str_detect(material, 'Metal')) %>%
  mutate(material = gsub("of which: ", "", material)) %>%
  mutate(material = gsub("of which:", "", material)) %>%
  pivot_longer(-c(year,material,achieved_recovery_recycling_rate),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('achieved_recovery_recycling_rate','value'), as.numeric) %>%
  na.omit() %>%
  dplyr::rename(rate = 3) %>%
  mutate(value = value * 1000) %>%
  mutate(rate = rate * 100) %>%
  mutate(variable = case_when(str_detect(variable, "packaging_waste_arising") ~ "Arisings",
                              str_detect(variable, "total_recovered_recycled") ~ "Recovered/recycled")) %>% 
  mutate_at(vars('rate','value'), funs(round(., 2))) %>%
  mutate_at(c('year'), as.numeric) %>%
  select(-rate) %>%
  filter(variable == "Arisings", material == "Plastic")

############ APPLICATION AND POLYMER COMPOSITION
# Import data
BOM <-
  # Read in the absolute data (cleaned from separate pdf files published by Wrap/Valpak)
  read_excel("./cleaned_data/plastic_packaging_composition.xlsx", sheet = "compiled_mass") %>%
  clean_names() %>%
  # Pivot the table longer
  pivot_longer(-c(year, category, type),
               names_to = "material",
               values_to = "value") %>%
  # Then wider to be able to add additional years for the extrapolation and interpolation
  pivot_wider(names_from = year, values_from = value) %>%
  mutate(
    '2012' = NA,
    '2013' = NA,
    '2014' = NA,
    '2015' = NA,
    '2016' = NA,
    '2018' = NA,
    '2020' = NA,
    '2023' = NA,
    '2024' = NA
  ) %>%
  pivot_longer(-c(material, category, type),
               names_to = "year",
               values_to = "value") %>%
  group_by(material, category, type) %>%
  arrange(year, .by_group = TRUE) %>%
  group_by(material, category, type) %>%
  # Interpolation and extrapolation to fill gaps
  mutate(value = na.approx(
    value,
    na.rm = FALSE,
    maxgap = Inf,
    rule = 2
  )) %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  mutate_at(c('year'), as.numeric) %>%
  select(-value)

# Join total POM tonnages and bill of materials and multiply to get the POM by end use, polymer and application
POM_packaging_composition <-
  left_join(official_defra_packaging_pom, BOM, by = "year") %>%
  mutate(tonnes = value * percentage) %>%
  select(year, category, type, material.y, tonnes) %>%
  rename(material = 4, value = 5) # %>%
  # filter(material == "pet") %>%
  # group_by(year) %>%
  # summarise(value = sum(value)) # %>%
# mutate(material = str_to_upper(material)) %>%
# mutate(material = gsub("OTHER", "Other", material))

# Scale to England and Wales based on population - Not used in the current output but kept in for illustrative purposes

# Download population data
# download.file(
#   "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatestimeseriesdataset/current/pop.csv",
#   "./raw_data/population_UK_wide.csv"
# )

# Import population data
# population_outturn <-
#   read_csv("./raw_data/population_UK_wide.csv") %>%
#   slice(-c(1:6)) %>%
#   select(1, 2, 4, 7, 8) %>%
#   rename(year = 1) %>%
#   pivot_longer(-c(year), names_to = "country", values_to = "value") %>%
#   mutate(country = gsub(" population mid-year estimate", "", country)) %>%
#   mutate_at(c('value', 'year'), as.numeric) %>%
#   group_by(year) %>%
#   mutate(percentage = (value / sum(value))) %>%
#   select(-value)

# Left join on population data
# POM_packaging_composition_geo_breakdown <-
#   left_join(POM_packaging_composition, population_outturn, by = "year") %>%
#   mutate(tonnes = value * percentage) %>%
#   mutate(material = str_to_upper(material)) %>%
#   select(year, category, type, material, country, tonnes)
