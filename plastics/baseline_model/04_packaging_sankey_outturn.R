##### **********************
# Author: Oliver Lysaght
# Purpose: Bind tables together to produce the flows in a plastic packaging sankey for the UK 2014-23

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
pol_pom_sankey <- POM_packaging_composition %>%
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
POM_1_sankey <- POM_packaging_composition %>%
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
POM_2_sankey <- POM_packaging_composition %>%
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
POM_2_alt_sankey <- POM_packaging_composition %>%
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
WG_sankey <- POM_2_alt %>% 
  ungroup() %>%
  dplyr::select(-c(source)) %>%
  rename(source = target) %>%
  mutate(target = "WG", .before = material)
  
############## COLLECTION AND LITTERING

## LACW
LA_collection_sankey <- LA_collection %>%
  mutate(source = "WG",
         target = "LA collection") %>%
  rename(value = WG_ex_LA)

## NON-LA WMC Collection
Non_LA_collection_sankey <- Non_LA_collection %>%
  mutate(source = "WG",
         target = "Non LA collection") %>%
  rename(value = WG_ex_Non_LA)

# LITTERING
litter_sankey <- litter %>%
  mutate(source = "WG", .before = variable) %>%
  rename(target = variable)

## ILLEGAL COLLECTION FOR DUMPING
illegal_collection_sankey <- illegal_collection %>%
  mutate(source = "WG", .before = variable) %>%
  rename(target = variable)

############## POST-COLLECTION TREATMENT

# DUMPING
dumping_sankey <- illegal_collection_sankey %>%
  mutate(source = "Illegal collection",
         target = "Dumping")

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


# *******************************************************************************
# Construct the sankey stages

### Bind the sankey stages together
plastic_packaging_sankey_flows <- rbindlist(
  list(
    pol_pom,
    POM_1,
    POM_2_alt,
    WG_sankey,
    LA_collection_sankey,
    Non_LA_collection_sankey,
    litter_sankey,
    illegal_collection_sankey,
    dumping_sankey),
  use.names = TRUE) %>%
  mutate(product = "Packaging")

write_csv(sankey_all, "sankey_all.csv")
