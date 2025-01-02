##### **********************
# Author: Oliver Lysaght
# Purpose: Produce a continuous plastic packaging sankey for England & Wales (2012-23)

# *******************************************************************************
# Packages
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
  "methods",
  "forecast"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

###### KPIs

# POM
POM_WG_KPI <- POM_packaging_composition_geo_breakdown %>%
  filter(country %in% c("England", "Wales")) %>%
  group_by(year, material) %>%
  summarise(POM = sum(tonnes)) %>%
  mutate(across(c('POM'), round, 2)) %>%
  mutate(product = "Packaging") %>%
  filter(! year < 2014) %>%
  mutate(material = gsub("OTHER", "Other", material))

# Quantity recycled
domestic_recycling <- 
  left_join(domestic_recycling_polymers, population_outturn, by = "year") %>%
  mutate(tonnes = tonnes * percentage) %>%
  filter(country %in% c("England", "Wales")) %>%
  group_by(year, material) %>%
  summarise(domestic_recycling = sum(tonnes)) %>%
  mutate(material = str_to_upper(material)) %>%
  mutate(material = gsub("OTHER", "Other", material))

# Quantity recycled
overseas_recycling <- 
  left_join(overseas_recycling_polymers, population_outturn, by = "year") %>%
  mutate(tonnes = tonnes * percentage) %>%
  filter(country %in% c("England", "Wales")) %>%
  group_by(year, material) %>%
  summarise(overseas_recycling = sum(tonnes)) %>%
  mutate(material = str_to_upper(material)) %>%
  mutate(material = gsub("OTHER", "Other", material))

# Combine the KPIs
KPI_all <-
  left_join(POM_WG_KPI, domestic_recycling, by=c('year','material')) %>%
  left_join(., overseas_recycling, by=c('year','material'))

DBI::dbWriteTable(con,
                  "packaging_KPIs",
                  KPI_all,
                  overwrite = TRUE)