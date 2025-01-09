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
#######################
## Collection stage

# LA collected
# Total LA collected - calculated based on total LACW/waste generation (excl.) construction. 
# LA collected residual vs. recycling collection based on LACW statistics
# England collection - https://statswales.gov.wales/Catalogue/Environment-and-Countryside/Waste-Management/Local-Authority-Municipal-Waste/annualwastereusedrecycledcomposted-by-localauthority-source-year
# Wales collection - https://statswales.gov.wales/Catalogue/Environment-and-Countryside/Waste-Management/Local-Authority-Municipal-Waste/annualwastereusedrecycledcomposted-by-localauthority-source-year
# Multiply WG by this share
# Map from the Wrap categories 

# Non-LA WMC collected - share

# Collected for dumping
# Dumping rate - 0.006
# # Polymer breakdown for littering equals WG composition in a given year - 0.4% applied to each polymer equally
dumping <- EOL_packaging_composition %>%
  group_by(year,material) %>%
  summarise(value = sum(tonnes)) %>%
  ungroup() %>%
  filter(year <= 2023) %>%
  mutate(value = value*0.006) %>%
  mutate(variable = "Littering") 

# Littering rate - 0.004
# # Polymer breakdown for littering equals WG composition in a given year - 0.4% applied to each polymer equally
litter <- EOL_packaging_composition %>%
  group_by(year,material) %>%
  summarise(value = sum(tonnes)) %>%
  ungroup() %>%
  filter(year <= 2023) %>%
  mutate(value = value*0.004) %>%
  mutate(variable = "Littering") 

#######################
## Treatment (1st stage)

# Exported - sent for overseas treatment (recycling)
## Import the defra-valpak polymer and application conversion
# HDPE bottle - 1 to 1 match
# PET bottles - 1 to 1 match
# Mixed - bottles - takes polymer breakdown for equivalent years' bottles excl. HDPE and PET
# PTT - takes polymer breakdown from equivalent years' PTT polymer BOM
# Packaging film - takes polymer breakdown from equivalent years' film BOM
# Other - takes polymer breakdown from equivalent years' other
# 100% packaging - percentage for all categories but other
# Other - Split of other
defra_eol_valpak_conversion_table <-
  read_excel("./plastics/baseline_model/conversion-tables/defra_recycling_valpak_conversion.xlsx") %>%
  select(-ROW_CHECK) %>%
  clean_names() %>%
  rename(material_2 = defra_category)

## Import the overseas data detailed
overseas_recycling_polymers <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_exported",
         material_1 == "Plastic",
         year != "2024") %>%
  mutate(material_2 = gsub("\\(Agreed with local agency office or based on sampling\\)", "", material_2)) %>%
  mutate(material_2 = gsub("\\(Agreed with local agency office\\)", "", material_2)) %>%
  mutate(material_2 = gsub("Other  - ", "", material_2)) %>%
  mutate_at(c('year'), as.numeric) %>%
  mutate_at(c('material_2'), trimws) %>%
  left_join(defra_eol_valpak_conversion_table) %>%
  select(-c(material_1, variable)) %>%
  pivot_longer(-c(year,material_2,value),
               names_to = "category",
               values_to = "share") %>%
  mutate(tonnes = value * share) %>%
  group_by(year,category) %>%
  summarise(tonnes = sum(tonnes, na.rm = TRUE)) %>%
  separate(category, c("application", "material"), "_") %>%
  group_by(year,material) %>%
  summarise(tonnes = sum(tonnes, na.rm = TRUE))

# Sent for domestic treatment
## Sorting and recycling facilities
domestic_recycling_polymers <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(variable == "net_received",
         material_1 == "Plastic",
         year != "2024") %>%
  mutate(material_2 = gsub("\\(Agreed with local agency office or based on sampling\\)", "", material_2)) %>%
  mutate(material_2 = gsub("\\(Agreed with local agency office\\)", "", material_2)) %>%
  mutate(material_2 = gsub("Other  - ", "", material_2)) %>%
  mutate_at(c('year'), as.numeric) %>%
  mutate_at(c('material_2'), trimws) %>%
  left_join(defra_eol_valpak_conversion_table) %>%
  select(-c(material_1, variable)) %>%
  pivot_longer(-c(year,material_2,value),
               names_to = "category",
               values_to = "share") %>%
  mutate(tonnes = value * share) %>%
  group_by(year,category) %>%
  summarise(tonnes = sum(tonnes, na.rm = TRUE)) %>%
  separate(category, c("application", "material"), "_") %>%
  group_by(year,material) %>%
  summarise(tonnes = sum(tonnes, na.rm = TRUE))

# Total residual
# WG - recycling - dumping

#######################
## Treatment (2nd stage)

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

## Incineration

## RDF exports (out of residual)
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

## Recycling end uses

