##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate waste generated and stocks from inflow and lifespan data

# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "readODS",
  "tidyverse",
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
# Import data

###############
# FLOW GROUP 1

## Import the WG data modelled in excel using a sales-lifetime approach and split by polymer and region
WG <- 
  read_excel("./plastics/baseline_model/stock_outflow_excel_model.xlsx") %>%
  select(-c(1:6)) %>%
  row_to_names(4) %>%
  slice(-c(32:33)) %>%
  mutate(variable = "WG") %>%
  mutate_at(c('2012'), as.numeric) %>%
  pivot_longer(-variable, 
               names_to = "year",
               values_to = "value") %>%
  group_by(variable, year) %>%
  summarise(value = sum(value, na.rm = TRUE)) %>%
  mutate_at(c('year'), as.numeric)

# Left join total tonnages and composition (assumed to be the same as POM)
WG_packaging_composition <-
  left_join(WG, BOM, by = "year") %>%
  mutate(tonnes = value * percentage) %>%
  select(year, category, type, material, tonnes) %>%
  group_by(year,material) %>%
  summarise(value = sum(tonnes)) %>%
  filter(year <= 2023)
