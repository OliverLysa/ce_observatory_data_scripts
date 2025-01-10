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

# DOMESTIC RESIDUAL
# LA - residual
LA_residual_sankey <- total_residual %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(value = total_residual * LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "LA collection",
         target = "Residual treatment")

# Non-LA - residual
Non_LA_residual_sankey <- total_residual %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(value = total_residual * Non_LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "Non LA collection",
         target = "Residual treatment")

## DOMESTIC INCINERATION
incineration_sankey <- residual_split %>%
  select(year, material, incineration) %>%
  rename(value = incineration) %>%
  mutate(source = "Residual treatment",
         target = "Incineration")

## DOMESTIC LANDFILL
landfill_sankey <- residual_split %>%
  select(year, material, landfill) %>%
  rename(value = landfill) %>%
  mutate(source = "Residual treatment",
         target = "Landfill")

# EXPORTS
# LA - exports
LA_overseas_recycling_sankey <- 
  overseas_recycling_polymers %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(value = tonnes * LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "LA collection",
         target = "Overseas recycling")

# Non LA - exports
Non_LA_overseas_recycling_sankey <- 
  overseas_recycling_polymers %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(value = tonnes * Non_LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "Non LA collection",
         target = "Overseas recycling")

# DOMESTIC RECYCLING
# LA - domestic
LA_domestic_recycling_sankey <- 
  domestic_recycling_polymers %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(value = tonnes * LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "LA collection",
         target = "Domestic recycling")

# Non LA - domestic
Non_LA_domestic_recycling_sankey <- 
  domestic_recycling_polymers %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(value = tonnes * Non_LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "Non LA collection",
         target = "Domestic recycling")

# REJECTS
# NPWD - difference between gross and net

## Domestic recycling > End uses
domestic_recycling_polymers <- LA_domestic_recycling_sankey %>%
  bind_rows(Non_LA_domestic_recycling_sankey) %>%
  group_by(year, material) %>%
  summarise(value = sum(value)) %>%
  mutate(source = "Domestic recycling",
         target = material)

# Import end use splits
end_uses <- 
  read_csv("./raw_data/end_uses.csv")

# Calculate the end use tonnages
polymers_end_uses <- domestic_recycling_polymers %>%
  left_join(end_uses) %>%
  select(year, material, application, share) %>%
  na.omit()

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
    dumping_sankey,
    LA_overseas_recycling_sankey,
    Non_LA_overseas_recycling_sankey,
    LA_domestic_recycling_sankey,
    Non_LA_domestic_recycling_sankey,
    LA_residual_sankey,
    Non_LA_residual_sankey,
    landfill_sankey,
    incineration_sankey,
    domestic_recycling_polymers),
  use.names = TRUE) %>%
  mutate(product = "Packaging")

write_csv(plastic_packaging_sankey_flows, 
          "sankey_all.csv")
