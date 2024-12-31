##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate collection and post-collection treatment routes for plastic packaging - first calculate transfer coefficients, then apply these to estimate the flows

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
  "methods"
)

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

# # Import functions
# source("functions.R",
#        local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# Delete columns where all are NAs
not_all_na <- function(x)
  any(!is.na(x))

# *******************************************************************************
# Import data
waste_generated <- read_csv("stock_outflow.csv") %>%
  filter(variable == "outflow") %>%
  select(-variable) %>%
  mutate(source = "POM", target = "WG")

#######################
## Collection stage
# Variables

# RVM collected
0

# LA collected - residual & recycling
# - Calculate based on LACW residual & recycling - total collection

# Non-LA WMC collected
# Based on C&I figures from Defra (and C,D)?

# Littering rate
litter <- collection %>%
  group_by(year) %>%
  summarise(total = sum(collected)) %>%
  ungroup() %>%
  left_join(waste_generated) %>%
  mutate(litter = value - total) %>%
  select(-c(source, target, value, total)) %>%
  mutate(target = "litter") %>%
  rename(value = litter)

# Calculate collection shares as a percentage

# Calculate collection routes using transfer coefficient
collection <-
  left_join(waste_generated, collection_shares) %>%
  mutate(collected = value * share) %>%
  select(-c(source, target, value, share)) %>%
  mutate(source = "WG")

#######################
## Post collection initial treatment (including sorting)

# Sent for reuse
0

# Sent for overseas treatment
overseas_recycling <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_exported",
         material_1 == "Plastic",
         year != "2024") %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value))

# Sent for domestic recycling
domestic_recycling <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_received",
         material_1 == "Plastic",
         year != "2024") %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value))

# Domestic residual

# Convert into the same BOM structure

# Dumped - fly-tipping (mis) - base residual composition on wrap collection of residual data
fly_tipping <- read_csv("./cleaned_data/flytipping.csv") %>%
  filter(type %in% c())
# Multiply by assumed weight
# Multiply by plastic packaging fraction

# Construct transfer coefficients
tc_treatment_initial <- read_csv("./plastics/material_flows_baseline/tc_treatment_initial.csv")

# Calculate collection routes using transfer coefficients
treatment_initial <-
  left_join(initial_treatment, tc_treatment_initial) %>%
  rename(source = target, target = route) %>%
  mutate(value = value * share) %>%
  select(-c(share))

#######################

# Mechanical recycling

# Recycling rejects
rejects <-
  read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(material_1 == "Plastic") %>%
  filter(grepl("received", variable)) %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value)) %>%
  pivot_wider(names_from = variable, values_from = value)

#######################

## Landfill and incineration
waste_treatment_england <- read_ods("./raw_data/UK_Stats_Waste.ods", sheet = "Waste_Tre_Eng_2010-22") %>%
  row_to_names(7) %>%
  clean_names() %>%
  select(-11) %>%
  unite(ewc_stat, ewc_stat_code, ewc_stat_description, sep = " - ") %>%
  rename(type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  filter(# ewc_stat == "07.4 - Plastic wastes",
    type == "Total",
    # Remove recycling
    category != "Recovery other than energy recovery except backfilling") %>%
  ungroup() %>%
  group_by(category, year) %>%
  summarise(value = sum(value))

## RDF exports
Exp_Combined <-
  read_csv("./cleaned_data/RDF_exports.csv") %>%
  clean_names() %>%
  group_by(year) %>%
  summarise(value = sum(total)) %>%
  # Calculate share that is plastic
  mutate(plastic = value * 0.2) %>%
  # 60% of plastic is packaging
  mutate(plastic_packaging = plastic * 0.6)

# Calculate collection routes using transfer coefficients
treatment_formal_domestic <-
  left_join(formal_domestic_treatment, tc_formal_domestic_treatment) %>%
  rename(target = route) %>%
  mutate(value = value * share) %>%
  select(-share)
