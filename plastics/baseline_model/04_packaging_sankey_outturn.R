##### **********************
# Author: Oliver Lysaght
# Purpose: Produce a plastic packaging sankey for England & Wales 2014-23

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

############## PLACED ON MARKET - EOL

# Polymer to POM
pol_pom <- POM_packaging_composition %>%
  group_by(year, material) %>%
  summarise(value = sum(value)) %>%
  mutate(source = material,
         target = "POM") %>%
  select(year,
         source,
         target,
         material,
         value)

# POM > End use
POM_1 <- POM_packaging_composition %>%
  group_by(year, category, material) %>%
  summarise(value = sum(value)) %>%
  mutate(source = "POM") %>%
  rename(target = category) %>%
  select(year,
         source,
         target,
         material,
         value)

# End use > application
POM_2 <- POM_packaging_composition %>%
  group_by(year, category, type, material) %>%
  summarise(value = sum(value)) %>%
  rename(source = category,
         target = type) %>%
  select(year,
         source,
         target,
         material,
         value)

#Alt - preserves the category
POM_2_alt <- POM_packaging_composition %>%
  group_by(year, category, type, material) %>%
  summarise(value = sum(value)) %>%
  rename(source = category,
         target = type) %>%
  unite(target, source, target, sep = " - ", remove = FALSE) %>%
  select(year,
         source,
         target,
         material,
         value)

############## WASTE GENERATED

# Import the official arisings data and join
WG <- read_excel("./cleaned_data/defra_packaging_all.xlsx") %>%
  mutate_at(c('year'), as.numeric) %>%
  select(-rate) %>%
  filter(variable == "Arisings",
         material == "Plastic") %>%
  select(-c(variable,material)) %>%
  left_join(BOM, by) %>%
  mutate(tonnes = value.x * value.y) %>%
  select(year.x,
         type,
         material,
         tonnes) %>%
  group_by(year.x,
           type,
           material) %>%
  summarise(value = sum(tonnes)) %>%
  rename(year = 1,
         source = 2) %>%
  mutate(target = "WG") %>%
  select(year,
         source,
         target,
         material,
         value)

############## COLLECTION AND LITTERING

## LACW

# LITTERING

litter <- EOL_packaging_composition %>%
  group_by(year) %>%
  summarise(total = sum(collected)) %>%
  ungroup() %>%
  left_join(waste_generated) %>%
  mutate(litter = value - total) %>%
  select(-c(source, target, value, total)) %>%
  mutate(target = "litter") %>%
  rename(value = litter)

############## POST-COLLECTION TREATMENT

# EXPORTS
## FOR RECYCLING
export_recycling <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(material_1 == "Plastic") %>%
  filter(grepl("export",variable)) %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value))

# DOMESTIC RECYCLING
domestic_recycling <- read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(material_1 == "Plastic") %>%
  filter(grepl("received",variable)) %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value))

# REJECTS
# NPWD - difference between gross and net

# DOMESTIC RESIDUAL
## TOTAL RESIDUAL CAN BE CALCULATED AS POM - TOTAL RECYCLING (DOMESTIC & OVERSEAS) EXCLUDING REJECTS 
# Calculate collection routes using transfer coefficients
treatment_formal_domestic <-
  left_join(formal_domestic_treatment, tc_formal_domestic_treatment) %>%
  rename(target = route) %>%
  mutate(value = value * share) %>%
  select(-share)

## DOMESTIC INCINERATION

## DOMESTIC LANDFILL

# DUMPING
## FLY-TIPPING DATA

# *******************************************************************************
# Construct the sankey stages

### Bind the sankey stages together
plastic_packaging_sankey_flows <- rbindlist(
  list(
    pol_pom,
    POM_1,
    POM_2,
    WG),
  use.names = TRUE) %>%
  # filter(year != 2023) %>%
  mutate(product = "Packaging")

write_csv(sankey_all, "sankey_all.csv")
