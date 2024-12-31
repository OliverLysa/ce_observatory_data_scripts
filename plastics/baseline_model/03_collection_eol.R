##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate collection and post-collection treatment routes for plastic packaging.
# An assessment of absolute tonnes made first for the baseline model, followed by conversion of these into transfer coefficients for the vensim model. 

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
# Import waste generation data
waste_generated <- read_csv("stock_outflow.csv") %>%
  filter(variable == "outflow") %>%
  select(-variable) %>%
  mutate(source = "POM", target = "WG")

#######################
## Collection stage
# Variables

# RVM collected
0

# Littering rate - 0.004 i.e. 0.4% applied to each polymer equally
litter <- collection %>%
  group_by(year) %>%
  summarise(total = sum(collected)) %>%
  ungroup() %>%
  left_join(waste_generated) %>%
  mutate(litter = value - total) %>%
  select(-c(source, target, value, total)) %>%
  mutate(target = "litter") %>%
  rename(value = litter)

# Polymer breakdown for littering equals WG composition in a given year

# LA collected
# What share does LACW make up of total plastic packaging generated?
# Total LA collected - calculated based on total LACW/waste generation (excl.) construction. 
# LA collected residual vs. recycling based on LACW statistics

# Non-LA WMC collected
# Calculated as WG - LA collected - litter

# Calculate collection shares as a percentage

#######################
## Post collection initial treatment

# Sent for reuse
0

# Exported - sent for overseas treatment (recycling)
overseas_recycling <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_exported",
         material_1 == "Plastic",
         year != "2024") %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value))

# What percentage of this flow is made up from specific polymers and applications? Convert into polymers and applications
# For the years after 2020, we can make better estimates of the different shares of polymers going to different EOL routes

## Import the overseas data detailed
overseas_recycling_polymers <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_exported",
         material_1 == "Plastic",
         year != "2024") %>%
  mutate(material_2 = gsub("\\(Agreed with local agency office or based on sampling\\)", "", material_2)) %>%
  mutate(material_2 = gsub("\\(Agreed with local agency office\\)", "", material_2))

defra_eol_valpak_conversion_table <- BOM %>%
  group_by(type, material, year) %>%
  summarise(percentage = sum(percentage))

## Imported the defra-valpak polymer and application conversion
# HDPE bottle - 1 to 1 match
# PET bottles - 1 to 1 match
# Mixed - bottles - takes polymer breakdown for equivalent years' bottles excl. HDPE and PET
# PTT - takes polymer breakdown from equivalent years' PTT polymer BOM
# Packaging film - takes polymer breakdown from equivalent years' film BOM
# Other - takes polymer breakdown from equivalent years'

# Sent for domestic treatment
## Sorting and recycling facilities
domestic_recycling <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_received",
         material_1 == "Plastic",
         year != "2024") %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value))

## Residual
## Landfill
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

# Incineration

# Construct transfer coefficients
tc_treatment_initial <- read_csv("./plastics/material_flows_baseline/tc_treatment_initial.csv")

# Calculate collection routes using transfer coefficients
treatment_initial <-
  left_join(initial_treatment, tc_treatment_initial) %>%
  rename(source = target, target = route) %>%
  mutate(value = value * share) %>%
  select(-c(share))

#######################

## RDF exports
residual_exp_combined <-
  read_csv("./cleaned_data/RDF_exports.csv") %>%
  clean_names() %>%
  group_by(year) %>%
  summarise(value = sum(total)) %>%
  # Calculate share that is plastic
  mutate(plastic = value * 0.2) %>%
  # 60% of plastic is packaging
  mutate(plastic_packaging = plastic * 0.6)

# Recycling rejects (Recycling waste)
rejects <-
  read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(material_1 == "Plastic") %>%
  filter(grepl("received", variable)) %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value)) %>%
  pivot_wider(names_from = variable, values_from = value)

# Each polymer from domestic recycling less the rejects

#######################

# End use splits for domestic recycling

