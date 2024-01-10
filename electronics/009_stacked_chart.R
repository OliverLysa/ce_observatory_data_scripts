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
              "mixdist",
              "janitor",
              "logOfGamma")

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

# *******************************************************************************
# Stacked area chart
# *******************************************************************************

# *******************************************************************************
# Import data

# Read inflow, stock and outflow data
unu_inflow_stock_outflow <- read_excel(
  "./cleaned_data/unu_inflow_stock_outflow.xlsx")

# Read UNU colloquial
UNU_colloquial <- read_xlsx("./classifications/classifications/UNU_colloquial.xlsx")

# Merge with UNU colloquial to get user-friendly naming
electronics_stacked_area_chart <- merge(unu_inflow_stock_outflow,
                                        UNU_colloquial,
                                        by=c("unu_key" = "unu_key")) %>%
  na.omit() %>%
  select(-unu_key) %>%
  mutate(across(c('value'), round, 0)) %>%
  filter(unit == "mass") %>%
  select(-c(unit)) %>%
  filter(year >= 2008) %>%
  rename(product = unu_description)

# Write stacked area chart data
write_csv(electronics_stacked_area_chart, 
           "./cleaned_data/electronics_chart_area.csv")

# Break mass down by BoM composition

# Read Bom data
BoM_percentage_UNU <- read_xlsx(
  "./intermediate_data/BoM_percentage_UNU.xlsx")

# Right join the BoM proportion and mass collected per year
electronics_stacked_area_material <- right_join(BoM_percentage_UNU, electronics_stacked_area_chart,
                                                  by = c("product")) %>%
  mutate(mass = freq*value) %>%
  select("product", 
         "material",
         "year",
         "variable",
         "mass") %>%
  rename(value = mass) %>%
  na.omit() %>%
  mutate(
    material = gsub("Flatpanelglass", 'Flat panel glass', material),
    material = gsub("Metals other", 'Metals (other)', material),
    material = gsub("Other metals", 'Metals (other)', material),
    material = gsub("Liionbattery", 'Li-ion battery', material),
    material = gsub("Electronics incl PCB", 'Electronics incl. PCB', material)) %>%
    mutate(across(c('value'), round, 1))

# Write stacked area chart data
write_csv(electronics_stacked_area_material, 
          "./cleaned_data/electronics_chart_area_material.csv")  
