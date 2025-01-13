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
         target = "Placed on the market") %>%
  select(year,
         source,
         target,
         material,
         value)

# POM > End use
POM_1_sankey <- POM_packaging_composition %>%
  group_by(year, category, material) %>%
  summarise(value = sum(value)) %>%
  mutate(source = "Placed on the market") %>%
  rename(target = category) %>%
  select(year,
         source,
         target,
         material,
         value)

# End use > application
# POM_2_sankey <- POM_packaging_composition %>%
#   group_by(year, category, type, material) %>%
#   summarise(value = sum(value)) %>%
#   rename(source = category,
#          target = type) %>%
#   select(year,
#          source,
#          target,
#          material,
#          value)

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
WG_sankey <- POM_2_alt_sankey %>% 
  ungroup() %>%
  dplyr::select(-c(source)) %>%
  rename(source = target) %>%
  mutate(target = "Waste generated", .before = material)
  
############## COLLECTION AND LITTERING

## LACW
LA_collection_sankey <- LA_collection %>%
  mutate(source = "Waste generated",
         target = "LA collection") %>%
  rename(value = WG_ex_LA)

## NON-LA WMC Collection
Non_LA_collection_sankey <- Non_LA_collection %>%
  mutate(source = "Waste generated",
         target = "Non LA collection") %>%
  rename(value = WG_ex_Non_LA)

# LITTERING
litter_sankey <- litter %>%
  mutate(source = "Waste generated", .before = variable) %>%
  rename(target = variable)

## ILLEGAL COLLECTION FOR DUMPING
illegal_collection_sankey <- illegal_collection %>%
  mutate(source = "Waste generated", .before = variable) %>%
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
         target = "Domestic residual treatment")

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
         target = "Domestic residual treatment")

## Residual treatment > Incineration
incineration_sankey <- residual_split_LA %>%
  select(year, material, incineration) %>%
  rename(value = incineration) %>%
  mutate(source = "Domestic residual treatment",
         target = "Incineration")

## Residual treatment > landfill
landfill_sankey <- residual_split_LA %>%
  select(year, material, landfill) %>%
  rename(value = landfill) %>%
  mutate(source = "Domestic residual treatment",
         target = "Landfill")

# LA collection > Sorting
LA_sorting_sankey <- sorting %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(value = sorting * LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "LA collection",
         target = "Sorting")

# Non-LA collection > Sorting
Non_LA_sorting_sankey <- sorting %>%
  left_join(waste_split, by = "year") %>%
  ungroup() %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(value = sorting * Non_LA_share) %>%
  select(year, material, value) %>%
  mutate(source = "Non LA collection",
         target = "Sorting")

# Sorting > Exports
sorting_exports_sankey <- 
  overseas_recycling_polymers %>%
  mutate(source = "Sorting",
         target = "Overseas recycling") %>%
  rename(value = tonnes)

# Sorting > Domestic
sorting_domestic_sankey <- 
  domestic_recycling_polymers %>%
  mutate(source = "Sorting",
         target = "Domestic recycling") %>%
  rename(value = tonnes)

# Sorting > waste - rejects
sorting_rejects_sankey <-
  sorting %>%
  select(year, material, rejects) %>%
  rename(value = rejects) %>%
  mutate(source = "Sorting",
         target = "Recycling rejects")

## Domestic recycling > End uses
domestic_recycling_polymers_split <- sorting_domestic_sankey %>%
  group_by(year, material) %>%
  summarise(value = sum(value)) %>%
  mutate(source = "Domestic recycling",
         target = material) %>%
  mutate(prefix = "r") %>%
  unite(target, prefix, target, sep = "_", remove = TRUE)  %>%
  mutate(target = str_to_upper(target)) %>%
  mutate(target = gsub("R_OTHER", "R_Other", target))

# Import end use splits
end_uses <- 
  read_csv("./raw_data/end_uses.csv")

# Calculate the end use tonnages
polymers_end_uses <- domestic_recycling_polymers_split %>%
  left_join(end_uses) %>%
  select(year, material, application, value, share, source, target) %>%
  na.omit() %>%
  mutate(value = value * share) %>%
  mutate(source = target) %>%
  select(-target) %>%
  rename(target = application) %>%
  select(-c("share"))

# Exports of plastic waste
recycling_exports_destinations <- 
  sorting_exports_sankey %>%
  select(year, material, value) %>%
  left_join(exports_all_split, by = "year")%>%
  mutate(value = value * percentage) %>%
  select(year, material, value, country) %>%
  rename(target = country) %>%
  mutate(source = "Overseas recycling")

# *******************************************************************************
# Construct the sankey stages

### Bind the sankey stages together
plastic_packaging_sankey_flows <- rbindlist(
  list(
    pol_pom_sankey,
    POM_1_sankey,
    POM_2_alt_sankey,
    WG_sankey,
    LA_collection_sankey,
    Non_LA_collection_sankey,
    litter_sankey,
    illegal_collection_sankey,
    dumping_sankey,
    LA_sorting_sankey,
    Non_LA_sorting_sankey,
    sorting_rejects_sankey,
    sorting_exports_sankey,
    sorting_domestic_sankey,
    LA_residual_sankey,
    Non_LA_residual_sankey,
    landfill_sankey,
    incineration_sankey,
    domestic_recycling_polymers_split),
  use.names = TRUE) %>%
  mutate(product = "Packaging") %>%
  filter(year >= 2014) %>%
  mutate(material = str_to_upper(material)) %>%
  mutate(material = gsub("OTHER", "Other", material))

write_csv(plastic_packaging_sankey_flows, 
          "sankey_all.csv")

plastic_packaging_sankey_flows |>
  e_charts() |>
  e_sankey(source, target, value) |>
  e_title("Sankey chart")

DBI::dbWriteTable(con,
                  "plastic_packaging_sankey_flows",
                  plastic_packaging_sankey_flows,
                  overwrite = TRUE)

plastic_packaging_sankey_flows_detail <- rbindlist(
  list(
    polymers_end_uses,
    recycling_exports_destinations),
  use.names = TRUE) %>%
  mutate(product = "Packaging") %>%
  filter(year >= 2014) %>%
  mutate(material = str_to_upper(material)) %>%
  mutate(material = gsub("OTHER", "Other", material))

write_csv(plastic_packaging_sankey_flows_detail, 
          "sankey_detail.csv")

DBI::dbWriteTable(con,
                  "plastic_packaging_sankey_flows_detail",
                  plastic_packaging_sankey_flows_detail,
                  overwrite = TRUE)


