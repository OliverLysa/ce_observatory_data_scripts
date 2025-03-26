##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate collection and treatment routes for plastic packaging to input to the baseline MFA

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
# Analysis
# *******************************************************************************

#######################
# FLOW GROUP 4 - Illegal collection and dumping 
# # Polymer breakdown for dumping equals WG composition in a given year - 0.6% applied to each polymer equally
# WG variable defiend in script 02
illegal_collection <- WG_packaging_composition %>%
  mutate(value = value*0.006) %>%
  mutate(variable = "Illegal collection")

# Import fly-tipping data to sense-check against
flytipping_all <-
  read_ods("./raw_data/flytipping_la.ods", sheet = "LA_incidents") %>%
  select(1,3,16:30) %>%
  row_to_names(2)

flytipping <- flytipping_all %>%
  dplyr::filter(!grepl('Total', `LA Name`)) %>%
  pivot_longer(-c(Year, `LA Name`),
               names_to = "type",
               values_to = "value") %>%
  mutate(Year = str_remove(Year, "-.+")) %>%
  mutate_at(c('value','Year'), as.numeric) %>%
  na.omit() %>%
  rename(Year = 1,
         LA = 2,
         type = 3,
         value = 4) %>%
  mutate_at(c('LA'), trimws)

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

## Dumping - illegal collection figure defined earlier in script
dumping <- illegal_collection %>%
  mutate(variable = "Dumping")

#######################
# FLOW GROUP 3
# Littering rate
# Polymer breakdown for littering equals WG composition in a given year - 4% applied to each polymer equally
# https://www.wwf.org.uk/sites/default/files/2018-03/WWF_Plastics_Consumption_Report_Final.pdf
litter <- WG_packaging_composition %>%
  mutate(value = value*0.04) %>%
  mutate(variable = "Littering")

#######################
# FLOW GROUP 2
collection_flows_LA <- read_ods("./raw_data/LA_collection.ods",
                             sheet = "Table_1") %>%
  row_to_names(3) %>%
  select(1,2,5,6,21:23) %>%
  clean_names() %>%
  filter(authority_type != "Collection") %>%
  mutate_at(c(5:7), as.numeric) %>%
  group_by(financial_year,region) %>%
  summarise(recycling = sum(local_authority_collected_waste_sent_for_recycling_composting_reuse_tonnes),
            residual = sum(local_authority_collected_waste_not_sent_for_recycling_tonnes),
            rejects = sum(local_authority_collected_estimated_rejects_tonnes)) %>%
  select(-rejects) %>%
  pivot_longer(-c(financial_year,region),
               names_to = "collection_route",
               values_to = "tonnages") %>%
  group_by(financial_year) %>%
  summarise(value = sum(tonnages))

# LA collected - split is based on England and scaled to the UK
# Calculated based on LACW over total waste generation (excl.) construction
# Import total LA collected from Defra statistics
LA_collected <- collection_flows_LA %>%
  mutate(year = substr(financial_year, 1, 4)) %>%
  select(-financial_year) %>%
  rename(LA = value)

# England waste generation
waste_gen_england <- read_ods("./raw_data/UK_Statistics_on_Waste_dataset_September_2024_accessible (1).ods",
                      sheet= "Waste_Gen_Eng_2010-22") %>%
  row_to_names(6) %>%
  clean_names() %>%
  select(-22) %>%
  slice(-1) %>%
  unite(ewc_stat, na_2, na_3, sep = " - ") %>%
  rename(year = 1,
         type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  mutate(region = "England",
         variable = "generation")

# Import total waste collected data from Defra (excl. construction)
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
# FLOW GROUP 8

# Exported - sent for overseas treatment (recycling)
## Import the defra-valpak polymer and application conversion table
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

#######################
# FLOW GROUP 7

rejects <- read_ods("./raw_data/LA_collection.ods",
                    sheet = "Table_1") %>%
  row_to_names(3) %>%
  select(1,2,5,6,23) %>%
  clean_names() %>%
  filter(authority_type != "Collection") %>%
  mutate_at(c(5), as.numeric) %>%
  group_by(financial_year) %>%
  summarise(rejects = sum(local_authority_collected_estimated_rejects_tonnes)) 

# Calculate rejects as a percentage
collection_flows_LA <- read_ods("./raw_data/LA_collection.ods",
                                sheet = "Table_1") %>%
  row_to_names(3) %>%
  select(1,2,5,6,21:23) %>%
  clean_names() %>%
  filter(authority_type != "Collection") %>%
  mutate_at(c(5:7), as.numeric) %>%
  group_by(financial_year,region) %>%
  summarise(recycling = sum(local_authority_collected_waste_sent_for_recycling_composting_reuse_tonnes),
            residual = sum(local_authority_collected_waste_not_sent_for_recycling_tonnes),
            rejects = sum(local_authority_collected_estimated_rejects_tonnes)) %>%
  select(-rejects) %>%
  pivot_longer(-c(financial_year,region),
               names_to = "collection_route",
               values_to = "tonnages") %>%
  filter(collection_route == "recycling") %>%
  group_by(financial_year) %>%
  summarise(value = sum(tonnages))
  
rejects_share <- left_join(collection_flows_LA,
                           rejects) %>%
  mutate(share = rejects/value)

## Local Authority Collected Waste Estimated Rejects
## Rejects shared variable derived from running LACW_rejects.R in the data extraction folder
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

## Combine the NPWD rejects and WDF rejects to produce a total rejects across collection and treatment stages
rejects_WDF_NPWD_combined <- rejects_WDF %>%
  left_join(rejects_NPWD) %>%
  mutate(total_losses = share + reject_percentage) %>%
  select(year, total_losses)

MF_data_out_21 <-   # Read in file
  read_excel("./raw_data/MF_Data_January_to_December_2021.xlsx",
             sheet = "Output") %>%
  clean_names() %>%
  group_by(material_type_if_som) %>%
  summarise(mean_target_all = mean(total_target_materials_percent, na.rm = TRUE),
            mean_non = mean(total_non_recyclable_materials_percent, na.rm = TRUE))

MF_data_out_20 <-   # Read in file
  read_excel("./raw_data/MF_Data_January_to_December_2020.xlsx",
             sheet = "Output") %>%
  clean_names() %>%
  group_by(material_type_if_som) %>%
  summarise(mean_target_all = mean(total_target_materials_percent, na.rm = TRUE),
            mean_non = mean(total_non_recyclable_materials_percent, na.rm = TRUE))

averaged_mf <- MF_data_out_20 %>%
  bind_rows(MF_data_out_21) %>%
  filter(material_type_if_som == "Plastic") %>%
  summarise(mean = mean(mean_target_all))

## Material facility rejects
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

#######################
# FLOW GROUP 6
# WG - recycling - dumping
total_residual <- 
  WG_packaging_composition_excl_lit_dump %>%
  left_join(sorting, by = c("year", "material")) %>%
  filter(year >= 2014) %>%
  mutate(total_residual = WG_ex - sorting) %>%
  select(year, material, total_residual)

#######################
# FLOW GROUP 9
## Get split of residual treatment into incineration or landfill - England used as data available through 2022
residual_treatment <- read_ods("./raw_data/UK_Statistics_on_Waste_dataset_September_2024_accessible (1).ods", sheet = "Waste_Tre_Eng_2010-22") %>%
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

## Treatment shares
treatment_shares_LA <- read_ods("./raw_data/LA_collection.ods",
                                sheet = "Table_2a") %>%
  row_to_names(6) %>%
  clean_names() %>%
  slice(1:10) %>%
  filter(!grepl('percentage', na)) %>%
  select(1:24) %>%
  rename(route = 1) %>%
  pivot_longer(-route, 
               names_to = "year",
               values_to = "value") %>%
  mutate(year = substr(year, 2, 5)) %>%
  mutate(route = gsub("Incineration with EfW", "Incineration", route)) %>%
  mutate(route = gsub("Incineration without EfW 1", "Incineration", route)) %>%
  mutate_at(c('year','value'), as.numeric) %>%
  filter(!grepl('Recycled|Other', route)) %>%
  group_by(route, year) %>%
  summarise(value = sum(value)) %>%
  ungroup() %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  select(route, year, percentage)

## Import LACW treatment data as an alternative data point/proxy for this split (used instead of the UK Stats figures)
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

# Use the proportions derived to then split total residual into incineration and landfill
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

#######################
# FLOW GROUP 10

# Plastic waste/scrap
plastic_waste_trade_all <-
  # Import data
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202409 - 391510 to 391590.csv") %>%
  unite(Description, Cn8, Description, sep = " - ") %>%
  select(1, 5:10) %>%
  mutate(NetMass = NetMass /1000) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  pivot_longer(-c(Description, Year, FlowType, Country),
               names_to = "Variable",
               values_to = "Value") %>%
  filter(Variable != "SuppUnit") %>%
  group_by(Year, Variable, Description, FlowType, Country) %>%
  summarise(sum = sum(Value))

# Countries overseas recycling (figures from NPWD) then goes to
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

# Summarise the total to subtract the other from in the creation of a top 10
exports_all_summarised <-
  plastic_waste_export_split %>%
  group_by(year) %>%
  summarise(value = sum(value)) %>%
  left_join(exports_other, by = "year") %>%
  mutate(value = value.x - value.y) %>%
  select(year, value) %>%
  mutate(country = "Other")

# Finally bind the other row to the exports top table and get percentages for use in the sankey script
exports_all_split <- exports_top %>%
  bind_rows(exports_all_summarised) %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  select(-value)
  

