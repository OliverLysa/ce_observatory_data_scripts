##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate collection and treatment routes for plastic packaging.

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
  "janitor"
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

# Stop scientific notation of numeric values
options(scipen = 999)

# Delete columns where all are NAs
not_all_na <- function(x)
  any(!is.na(x))

# *******************************************************************************
#######################
# Collection stage

## Illegal collection for dumping

## Dumping rate - 0.006 (based on Iacovidou ) 
# # Polymer breakdown for littering equals WG composition in a given year - 0.6% applied to each polymer equally
illegal_collection <- WG_packaging_composition %>%
  mutate(value = value*0.006) %>%
  mutate(variable = "Illegal collection")

### Checked against Defra fly-tipping data
# Estimate the weight of the relevant categories
flytipping_totals <- flytipping %>%
  clean_names() %>%
  group_by(year, type) %>%
  summarise(value = sum(value)) %>%
  dplyr::filter(grepl('Black Bags', type)) %>%
  # Assuming 200 bags at 10 kg each - adjusted based on Brunel study
  mutate(weight_per_incident_kg = case_when(str_detect(type, "Commercial") ~ 2000,
                                            # Assuming 30 bags at 10 kg each              
                                            str_detect(type, "Household") ~ 300)) %>%
  mutate(weight_tonnes = (value * weight_per_incident_kg)/1000) %>%
  group_by(year) %>%
  summarise(weight_tonnes = sum(weight_tonnes)) %>%
  mutate(collection_route = "residual")

# Get composition of residual waste (taken as a proxy for composition of black bags fly-tipped)
composition <- 
  read_csv("./cleaned_data/waste_collection_composition_all.csv") %>%
  filter(collection_route == "residual") %>%
  filter(waste_type %in% c("PET bottles",
                           "HDPE bottles",
                           "Other plastic bottles",
                           "Pots, tubs & trays",
                           "Other dense plastic packaging",
                           "Polystyrene",
                           "Carrier bags",
                           "Other packaging plastic film")) %>%
  # group_by(waste_type) %>%
  summarise(freq = sum(freq)) %>%
  mutate(collection_route = "residual")

# Fly-tipping plastic packaging
fly_tipping <- left_join(flytipping_totals, composition) %>%
  mutate(value = weight_tonnes * freq)

# Littering rate
# Polymer breakdown for littering equals WG composition in a given year - 4% applied to each polymer equally
# https://www.wwf.org.uk/sites/default/files/2018-03/WWF_Plastics_Consumption_Report_Final.pdf
litter <- WG_packaging_composition %>%
  mutate(value = value*0.04) %>%
  mutate(variable = "Littering")

# LA collected - split is based on England and scaled to the UK
# Calculated based on LACW over total waste generation (excl.) construction
# Import total LA collected from Defra statistics
LA_collected <- collection_flows_LA %>%
  mutate(year = substr(financial_year, 1, 4)) %>%
  select(-financial_year) %>%
  rename(LA = value)

# Import total waste collected data from Defra
total_waste_collected <- 
  waste_gen_england %>%
  filter(type == "Total",
         # Filter out construction
         category != "Construction") %>%
  filter(!grepl("Total",ewc_stat)) %>%
  group_by(year) %>%
  summarise(value = sum(value))

# Calculate split across the two collection routes
waste_split <- 
  left_join(LA_collected, total_waste_collected, by = "year") %>%
  mutate(total = na.approx(value,
            na.rm = FALSE)) %>%
  mutate(LA_share = LA/total,
         Non_LA_share = 1 - LA_share) %>%
  mutate_at(c('year'), as.numeric) %>%
  select(year, LA_share, Non_LA_share)

# First subtract illegal collection and littering from waste generated to produce a value that can be multiplied by these shares
WG_packaging_composition_excl_lit_dump <- WG_packaging_composition %>%
  left_join(illegal_collection, by = c("year", "material")) %>%
  rename("WG" = value.x,
         "Illegal_collection" = value.y) %>%
  left_join(litter, by = c("year", "material")) %>%
  rename("litter" = value) %>%
  mutate(WG_ex = WG - Illegal_collection - litter) %>%
  select(year, material, WG_ex)

# Calculate LA collection
LA_collection <- WG_packaging_composition_excl_lit_dump %>%
  left_join(waste_split, by = "year") %>%
  filter(year >= 2014) %>%
  ungroup() %>%
  mutate(LA_share = na.approx(LA_share,
                           na.rm = FALSE,
                           maxgap = Inf,
                           rule = 2)) %>%
  mutate(WG_ex_LA = WG_ex * LA_share) %>%
  select(year, material, WG_ex_LA)

# Calculate non-LA collection
Non_LA_collection <- WG_packaging_composition_excl_lit_dump %>%
  left_join(waste_split, by = "year") %>%
  filter(year >= 2014) %>%
  ungroup() %>%
  mutate(Non_LA_share = na.approx(Non_LA_share,
                              na.rm = FALSE,
                              maxgap = Inf,
                              rule = 2)) %>%
  mutate(WG_ex_Non_LA = WG_ex * Non_LA_share) %>%
  select(year, material, WG_ex_Non_LA)

#######################
## Treatment (1st stage)

## Dumping
dumping <- illegal_collection %>%
  mutate(variable = "Dumping")

# Exported - sent for overseas treatment (recycling)
## Import the defra-valpak polymer and application conversion
# HDPE bottle - 1 to 1 match
# PET bottles - 1 to 1 match
# Mixed - bottles - takes polymer breakdown for equivalent years' bottles excl. HDPE and PET
# PTT - takes polymer breakdown from equivalent years' PTT polymer BOM
# Packaging film - takes polymer breakdown from equivalent years' film BOM
# Other - takes polymer breakdown from equivalent years' 'other' BOM
# 100% packaging - percentage for all categories but other
# Other - Split of other
defra_eol_valpak_conversion_table <-
  read_excel("./plastics/baseline_model/conversion-tables/defra_recycling_valpak_conversion2.xlsx") %>%
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

# Sent for domestic recycling
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

# Rejects
## Local Authority Collected Waste Estimated Rejects
rejects_WDF <- rejects_share %>%
  mutate(year = substr(financial_year, 1, 4)) %>%
  select(year, share)

## NPWD rejects (the difference between gross and net)
rejects_NPWD <-
  read_xlsx("./cleaned_data/NPWD_recycling_recovery_detail.xlsx") %>%
  filter(material_1 == "Plastic") %>%
  filter(grepl("total", variable)) %>%
  group_by(year, material_1, variable) %>%
  summarise(value = sum(value)) %>%
  pivot_wider(names_from = variable, values_from = value) %>%
  mutate(difference = gross_total - net_total,
         reject_percentage = difference/gross_total)

## Combine the NPWD rejects and WDF rejects
rejects_WDF_NPWD_combined <- rejects_WDF %>%
  left_join(rejects_NPWD) %>%
  mutate(total_losses = share + reject_percentage) %>%
  select(year, total_losses)

## Material facility rejects (import from MF script)
material_facility_rejects <- 
  # Takes the average of the reject rate across the two years
  averaged_mf %>%
  mutate(mean = mean/100,
         mean = 1 - mean) %>%
  mutate(application = "Packaging")
  
## Sorting - sum of recycling and rejects
sorting <- overseas_recycling_polymers %>%
  left_join(domestic_recycling_polymers, by = c("year", "material")) %>%
  rename(overseas = tonnes.x,
         domestic = tonnes.y) %>%
  mutate(total = overseas + domestic) %>%
  mutate(application = "Packaging") %>%
  left_join(material_facility_rejects) %>%
  # Redo the sorting calculation - We know the net figure - To get the original figure knowing the rejects rate, we need to do the following:
  # step 1. Subtract percentage losses in decimal format from 1 e.g. 1 - 0.15
  # step 2. divide the resulting value by that e.g. 150/0.85
  mutate(mean_adjust = 1 - mean,
         sorting = total/mean_adjust,
         rejects = sorting - total) %>%
  select(year, material, sorting, rejects)

# Total residual
# WG - recycling - dumping
total_residual <- 
  WG_packaging_composition_excl_lit_dump %>%
  left_join(sorting, by = c("year", "material")) %>%
  filter(year >= 2014) %>%
  mutate(total_residual = WG_ex - sorting) %>%
  select(year, material, total_residual)

#######################
## Treatment (2nd stage)

## Get split of residual treatment into incineration or landfill - England used as data available through 2022
residual_treatment <- read_ods("./raw_data/UK_Stats_Waste.ods", sheet = "Waste_Tre_Eng_2010-22") %>%
  row_to_names(7) %>%
  clean_names() %>%
  select(-11) %>%
  unite(ewc_stat, ewc_stat_code, ewc_stat_description, sep = " - ") %>%
  rename(type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value','year'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  filter(# ewc_stat == "07.4 - Plastic wastes",
    type == "Total",
    # types of treatment of interest
    category %in% c("Energy recovery",
                    "Incineration",
                    "Deposit onto or into land")) %>%
  mutate(category = gsub("Energy recovery", "Incineration", category),
         category = gsub("Deposit onto or into land", "Landfill", category)) %>%
  ungroup() %>%
  group_by(category, year) %>%
  summarise(value = sum(value)) %>%
  ungroup() %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  select(-value) %>%
  pivot_wider(names_from = category, values_from = percentage) %>%
  ungroup() %>%
  add_row(year = 2011) %>%
  add_row(year = 2013) %>%
  add_row(year = 2015) %>%
  add_row(year = 2017) %>%
  add_row(year = 2019) %>%
  add_row(year = 2021) %>%
  add_row(year = 2023) %>%
  arrange(year) %>%
  mutate(Incineration = na.approx(Incineration,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(Landfill = na.approx(Landfill,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2))

## Import LACW treatment data to use instead
residual_treatment_LA <- 
  treatment_shares_LA %>%
  pivot_wider(names_from = route, values_from = percentage) %>%
  ungroup() %>%
  add_row(year = 2023) %>%
  mutate(Incineration = na.approx(Incineration,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2)) %>%
  mutate(Landfill = na.approx(Landfill,
                                  na.rm = FALSE,
                                  maxgap = Inf,
                                  rule = 2))

# Use the proportions to then split total residual into incineration and landfill
residual_split <- total_residual %>%
  left_join(residual_treatment, by = c("year")) %>%
  mutate(incineration = total_residual * Incineration,
         landfill = total_residual * Landfill) %>%
  select(year, material, incineration,landfill)

# Use the proportions to then split total residual into incineration, landfill
residual_split_LA <- total_residual %>%
  left_join(residual_treatment_LA, by = c("year")) %>%
  mutate(incineration = total_residual * Incineration,
         landfill = total_residual * Landfill) %>%
  select(year, material, incineration,landfill)

## RDF exports (out of sorting)  
residual_exp_combined <-
  read_csv("./cleaned_data/RDF_exports.csv") %>%
  clean_names() %>%
  group_by(year) %>%
  summarise(value = sum(total)) %>%
  # Calculate share that is plastic
  mutate(plastic = value * 0.2) %>%
  # 60% of plastic is packaging
  mutate(plastic_packaging = plastic * 0.6)

# Countries overseas recycling then goes to
plastic_waste_export_split <- plastic_waste_trade_all %>%
  clean_names() %>%
  filter(variable == "NetMass") %>%
  filter(grepl('Exports', flow_type)) %>%
  group_by(year, country) %>%
  summarise(value = sum(sum)) 

# Get the top 9
exports_top <- plastic_waste_export_split %>%
  ungroup() %>%
  group_by(year) %>%
  top_n(9)

# Construct an 'other' category made up of the values not captured in the top 9 
exports_other <- exports_top %>%
  group_by(year) %>%
  summarise(value = sum(value)) 

# Summarise the total to subtract the other from
exports_all_summarised <-
  plastic_waste_export_split %>%
  group_by(year) %>%
  summarise(value = sum(value)) %>%
  left_join(exports_other, by = "year") %>%
  mutate(value = value.x - value.y) %>%
  select(year, value) %>%
  mutate(country = "Other")

# Finally bind the other row to the exports top table and get percentages
exports_all_split <- exports_top %>%
  bind_rows(exports_all_summarised) %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  select(-value)
  

