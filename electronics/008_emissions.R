##### **********************
# Author: Oliver Lysaght
# Required annual updates:
# The URL to download from

# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c("magrittr", 
              "writexl", 
              "readxl", 
              "dplyr", 
              "tidyverse", 
              "readODS", 
              "data.table", 
              "RSelenium", 
              "netstat", 
              "uktrade", 
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "RPostgreSQL")

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
# Import functions
source("./scripts/functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# Specify SIC codes of interest
filter <- c("26", "27", "28")

# Specify COICOP codes of interest
filter_list <- c("Household appliances",
                 "Tools and equipment for house and garden",
                 "Medical products appliances and equipment",
                 "Telephone and telefax equipment",
                 "Audio-visual photo and info processing equipment",
                 "Other recreational equipment etc")

# *******************************************************************************
# PRODUCTION EMISSIONS BY SIC - territorial basis

# Production emissions from BEIS (covering 7 Kyoto gases)
download.file(
  "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1086808/SIC-final-greenhouse-gas-emissions-tables-2020.xlsx",
  "./raw_data/UK greenhouse gas emissions by Standard Industrial Classification.xlsx"
)

# Create lookup for gases
gas_number <- c(1,2,3,4,5,6,7,8)
gas_name <- c('Total GHGs (ktCO2e)',
              'CO2 (ktCO2e)',
              'CH4 (ktCO2e)',
              'N2O (ktCO2e)',
              'HFCs (ktCO2e)',
              'PFCs (ktCO2e)',
              'SF6 (ktCO2e)',
              'NF3 (ktCO2e)')
gas_lookup <- data.frame(gas_number, gas_name)

# Read in sheet names and convert columns to character to enable bind
BEIS_emissions_sheets <- read_excel_allsheets_BEIS_emissions_SIC(
  "./raw_data/UK greenhouse gas emissions by Standard Industrial Classification.xlsx") %>%
  lapply(\(x) mutate(x, across(.fns = as.character)))

# Remove covering sheets containing cover and contents
BEIS_emissions_sheets = BEIS_emissions_sheets[-c(1:2,11)]

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
BEIS_emissions_data <-
  dplyr::bind_rows(BEIS_emissions_sheets) %>%
  rename(group = 2) %>%
  filter(!grepl('Total', group)) %>%
  filter(!grepl('name', group)) %>%
  filter(!grepl('[A-Z]', Section)) %>%
  filter(!grepl('-', Section)) %>%
  drop_na(2) %>%
  rename(group = 1,
         section = 2,
         group_name = 3) %>%
  mutate(gas_number = ((row_number()-1) %/% 120)+1) %>%
  right_join(gas_lookup, by = c("gas_number")) %>%
  select(-c(gas_number)) %>%
  pivot_longer(-c(group, section, group_name, gas_name),
               names_to = 'year',
               values_to = 'value') %>%
  mutate(source = "BEIS",
         basis = "territorial")

# Filtered dataset for chart electronics 
BEIS_emissions_electronics <- 
  BEIS_emissions_data %>%
  filter(group %in% filter) %>%
  select(-c(group,section)) %>%
  mutate_at(c('year','value'), as.numeric)

# Create chart
ggplot(BEIS_emissions_electronics, aes(x = year, y = value, group = group_name)) +
  facet_wrap(vars(gas_name), nrow = 4) +
  theme_light() +
  geom_line(aes(color=group_name), size= 1) +
  theme(legend.position="bottom")

# *******************************************************************************
# ACID RAIN PRECURSORS - RESIDENCY BASIS BASIS

# Download
download.file(
  "https://www.ons.gov.uk/file?uri=/economy/environmentalaccounts/datasets/ukenvironmentalaccountsatmosphericemissionsacidrainprecursoremissionsbyeconomicsectorandgasunitedkingdom/current/atmosphericemissionsacidrainprecursors.xlsx",
  "./raw_data/ACID RAIN PRECURSORS.xlsx"
)

# Create lookup for gases
precursor_number <- c(1,2,3,4)
name <- c('Total (ktSO2e)',
          'SO2 (ktSO2)',
          'NOX (ktSO2e)',
          'NH3 (ktSO2e)')
precursor_lookup <- data.frame(precursor_number, name)

# Read in sheet names and convert columns to character to enable bind
acid_rain_precursors_sheets <- read_excel_allsheets_ONS(
  "./raw_data/ACID RAIN PRECURSORS.xlsx") %>%
  lapply(\(x) mutate(x, across(.fns = as.character)))

# Remove covering sheets containing cover and contents
acid_rain_precursors_sheets = acid_rain_precursors_sheets[-c(1)]

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
acid_rain_precursors_data <-
  dplyr::bind_rows(acid_rain_precursors_sheets) %>%
  rename(SIC = 1,
         Section = 2,
         SIC_Description = 3) %>%
  drop_na(SIC, Section, SIC_Description) %>%
  mutate(precursor_number = ((row_number()-1) %/% 129)+1) %>%
  right_join(precursor_lookup, by = c("precursor_number")) %>%
  select(-c(precursor_number)) %>%
  pivot_longer(-c(SIC, Section, SIC_Description, name),
               names_to = 'year',
               values_to = 'value') %>%
  mutate_at(c('value'), as.numeric) %>%
  mutate(value = value * 1000) %>%
  rename(tonnes_SO2_equivalent = value) %>%
  mutate(source = "ONS Environmental Accounts",
         basis = "residency")

# *******************************************************************************
# HEAVY METAL POLLUTANTS - RESIDENCY BASIS BASIS

# Download
download.file(
  "https://www.ons.gov.uk/file?uri=/economy/environmentalaccounts/datasets/ukenvironmentalaccountsatmosphericemissionsheavymetalpollutantemissionsbyeconomicsectorandgasunitedkingdom/current/atmosphericemissionsheavymetals.xlsx",
  "./raw_data/HEAVY METAL POLLUTANTS.xlsx"
)

# Create lookup for gases
pollutant_number <- c(1,2,3,4,5,6,7,8,9,10)
pollutant_name <- c('Arsenic (tonnes)',
                    'Cadmium (tonnes)',
                    'Chromium (tonnes)',
                    'Copper (tonnes)',
                    'Lead (tonnes)',
                    'Mercury (tonnes)',
                    'Nickel (tonnes)',
                    'Selenium (tonnes)',
                    'Vanadium (tonnes)',
                    'Zinc (tonnes)')
pollutant_lookup <- data.frame(pollutant_number, pollutant_name)

# Read in sheet names and convert columns to character to enable bind
heavy_metal_pollutants_sheets <- read_excel_allsheets_ONS(
  "./raw_data/HEAVY METAL POLLUTANTS.xlsx") %>%
  lapply(\(x) mutate(x, across(.fns = as.character)))

# Remove covering sheets containing cover and contents
heavy_metal_pollutants_sheets = heavy_metal_pollutants_sheets[-c(1)]

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
heavy_metal_pollutants_data <-
  dplyr::bind_rows(heavy_metal_pollutants_sheets) %>%
  rename(SIC = 1,
         Section = 2,
         SIC_Description = 3) %>%
  drop_na(SIC, Section, SIC_Description) %>%
  mutate(pollutant_number = ((row_number()-1) %/% 129)+1) %>%
  right_join(pollutant_lookup, by = c("pollutant_number")) %>%
  select(-c(pollutant_number)) %>%
  pivot_longer(-c(SIC, Section, SIC_Description, pollutant_name),
               names_to = 'year',
               values_to = 'value') %>%
  mutate(source = "ONS Environmental Accounts",
         basis = "residency")

# *******************************************************************************
# OTHER POLLUTANTS - RESIDENCY BASIS BASIS

# Download
download.file(
  "https://www.ons.gov.uk/file?uri=/economy/environmentalaccounts/datasets/ukenvironmentalaccountsatmosphericemissionsemissionsofotherpollutantsbyeconomicsectorandgasunitedkingdom/current/atmosphericemissionsotherpollutants.xlsx",
  "./raw_data/OTHER POLLUTANTS.xlsx"
)

# Create lookup for gases
pollutant_number <- c(1,2,3,4,5,6)
pollutant_name <- c('PM10 (kt)',
                    'PM2.5 (kt)',
                    'CO (kt)',
                    'NMVOC (kt)',
                    'Benzene (kt)',
                    '1,3-Butadiene (kt)')
pollutant_lookup <- data.frame(pollutant_number, pollutant_name)

# Read in sheet names and convert columns to character to enable bind
other_pollutants_sheets <- read_excel_allsheets_ONS(
  "./raw_data/OTHER POLLUTANTS.xlsx") %>%
  lapply(\(x) mutate(x, across(.fns = as.character)))

# Remove covering sheets containing cover and contents
other_pollutants_sheets = other_pollutants_sheets[-c(1)]

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
other_pollutants_data <-
  dplyr::bind_rows(other_pollutants_sheets) %>%
  rename(SIC = 1,
         Section = 2,
         SIC_Description = 3) %>%
  drop_na(SIC, Section, SIC_Description) %>%
  mutate(pollutant_number = ((row_number()-1) %/% 129)+1) %>%
  right_join(pollutant_lookup, by = c("pollutant_number")) %>%
  select(-c(pollutant_number)) %>%
  pivot_longer(-c(SIC, Section, SIC_Description, pollutant_name),
               names_to = 'year',
               values_to = 'value') %>%
  mutate(source = "ONS Environmental Accounts",
         basis = "residency")

# *******************************************************************************
# REALLOCATED ENERGY CONSUMPTION

# Download
download.file(
  "https://www.ons.gov.uk/file?uri=/economy/environmentalaccounts/datasets/ukenvironmentalaccountsenergyreallocatedenergyconsumptionandenergyintensityunitedkingdom/current/12energyintensitybyindustry.xlsx",
  "./raw_data/REALLOCATED ENERGY.xlsx"
)

# Create lookup for gases
energy_number <- c(1,2,3)
energy_name <- c('Reallocated energy (Mtoe)',
                    'Reallocated energy (TJ)',
                    'Energy intensity (TJ)')
energy_lookup <- data.frame(energy_number, energy_name)

# Read in sheet names and convert columns to character to enable bind
reallocated_energy_sheets <- read_excel_allsheets_ONS(
  "./raw_data/REALLOCATED ENERGY.xlsx") %>%
  lapply(\(x) mutate(x, across(.fns = as.character)))

# Remove covering sheets containing cover and contents
reallocated_energy_sheets = reallocated_energy_sheets[-c(1)]

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
reallocated_energy_data <-
  dplyr::bind_rows(reallocated_energy_sheets) %>%
  rename(SIC = 1,
         Section = 2,
         SIC_Description = 3) %>%
  drop_na(SIC, Section, SIC_Description) %>%
  mutate(energy_number = ((row_number()-1) %/% 129)+1) %>%
  right_join(energy_lookup, by = c("energy_number")) %>%
  select(-c(energy_number)) %>%
  pivot_longer(-c(SIC, Section, SIC_Description, energy_name),
               names_to = 'year',
               values_to = 'value') %>%
  mutate(source = "ONS Environmental Accounts",
         basis = "residency")

# *******************************************************************************
# PRODUCTION BASIS ALL

# Bind datasets
production_impacts_all <-
  rbindlist(
    list(
      BEIS_emissions_data,
      acid_rain_precursors_data,
      heavy_metal_pollutants_data,
      other_pollutants_data,
      reallocated_energy_data
    ),
    use.names = FALSE
  ) %>%
  rename(SIC = 1,
         Section = 2,
         SIC_Description = 3,
         variable = 4)

# Write output to xlsx form
write_xlsx(production_impacts_all, 
           "./cleaned_data/production_impacts_all.xlsx")

# Filtered dataset for chart electronics 
production_impacts_electronics <- 
  production_impacts_all %>%
  filter(SIC %in% filter) %>%
  mutate_at(c('year','value'), as.numeric) %>%
  filter(! variable %in% c("Reallocated energy (TJ)", 
                     "Total",
                     "Total GHGs"))

# Create chart
ggplot(production_impacts_electronics, aes(x = year, y = value, group = SIC)) +
  facet_wrap(vars(variable), nrow = 8, scales = "free") +
  theme_light() +
  geom_line(aes(color=SIC), size= 1) +
  theme(legend.position="bottom")

# *******************************************************************************
# MATERIAL FOOTPRINT

# Download file
download.file(
  "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1176404/2020_Defra_results_England.ods",
  "./raw_data/England_material_footprint.ods"
)

# Create lookup
material_number <- c(1,2,3,4,5)
material_name <- c('Total','Biomass','Metallic ores','Fossil fuels','Non-metallic minerals')
material_lookup <- data.frame(material_number, material_name)

# Import data and filter
mf_product <- read_ods("./raw_data/England_material_footprint.ods",
                       sheet = 5) %>%
  row_to_names(row_number = 2, 
               remove_rows_above = TRUE) %>%
  clean_names() %>%
  drop_na(5) %>%
  select(-1) %>%
  rename(year = 1) %>%
  na.omit() %>% 
  mutate(material_number = ((row_number()-1) %/% 20)+1) %>%
  right_join(material_lookup, by = c("material_number")) %>%
  select(-c(material_number)) %>%
  pivot_longer(-c(year, material_name),
               names_to = "product") %>%
  mutate(product = gsub("_", " ", product)) %>%
  mutate(product = sub("(.)", "\\U\\1", product, perl=TRUE)) %>%
  filter(product %in% filter_list) %>%
  mutate_at(c('value'), as.numeric)

# Create chart
ggplot(mf_product, aes(x = year, y = value, group = material_name)) +
  facet_wrap(vars(product), nrow = 4, scales = "free") +
  geom_line(aes(color=material_name), size= 1) +
  theme_light() +
  theme(legend.position="bottom") +
  theme(plot.title = element_text(size=22))

# *******************************************************************************
# CARBON FOOTPRINT

# Download file
download.file(
  "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1175932/2023_03_21_Defra_results_England_rev.ods",
  "./raw_data/England_carbon_footprint.ods"
)

# Create lookup
emissions_number <- c(1,2)
emissions_name <- c('Greenhouse Gas emissions','Carbon Dioxide emissions')
emissions_lookup <- data.frame(emissions_number, emissions_name)

# Import data and filter
cf_product <- read_ods("./raw_data/England_carbon_footprint.ods",
                       sheet = 5) %>%
  row_to_names(row_number = 1, 
               remove_rows_above = TRUE) %>%
  clean_names() %>%
  drop_na(5) %>%
  select(-1) %>%
  rename(year = 1) %>%
  na.omit() %>% 
  mutate(emissions_number = ((row_number()-1) %/% 20)+1) %>%
  right_join(emissions_lookup, by = c("emissions_number")) %>%
  select(-c(emissions_number)) %>%
  pivot_longer(-c(year, emissions_name),
               names_to = "product") %>%
  mutate(product = gsub("_", " ", product)) %>%
  mutate(product = sub("(.)", "\\U\\1", product, perl=TRUE)) %>%
  filter(product %in% filter_list) %>%
  mutate_at(c('value'), as.numeric)

# Create chart
ggplot(cf_product, aes(x = year, y = value, group = product)) +
  facet_wrap(vars(emissions_name), nrow = 2) +
  geom_line(aes(color=product), size=1) +
  theme_light() +
  theme(legend.position="bottom")
