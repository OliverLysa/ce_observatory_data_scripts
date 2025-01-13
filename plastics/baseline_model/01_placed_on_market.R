##### **********************
# Author: Oliver Lysaght
# Purpose: Import preferred total packaging placed on market data, estimate flows by polymer and application, apportion to countries across the UK

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "writexl",
  "readxl",
  "readODS",
  "tidyverse",
  "data.table",
  "janitor",
  "xlsx"
)

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
# Data extraction

############ DEFRA PACKAGING STATISTICS
official_defra_packaging_pom <-
  read_xlsx("./cleaned_data/Defra_packaging_all.xlsx") %>%
  mutate_at(c('year'), as.numeric) %>%
  select(-rate) %>%
  filter(variable == "Arisings", material == "Plastic")

############ APPLICATION AND POLYMER COMPOSITION
# Import data
BOM <-
  # Read in the absolute data
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
  # mutate(material = str_to_upper(material)) %>%
  # mutate(material = gsub("OTHER", "Other", material))

# Scale to England and Wales based on population - Final demand, GDP, GDHI or weighted population could be alternative ways

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
