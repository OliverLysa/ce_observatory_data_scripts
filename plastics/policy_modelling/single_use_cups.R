##### **********************
# Author:

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
              "DBI",
              "RPostgres",
              "RSelenium", 
              "netstat", 
              "uktrade", 
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "future",
              "furrr",
              "rjson",
              "comtradr",
              "tabulizer")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Import functions, options and connections 
# *******************************************************************************
# Import functions
source("functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

## Apparent consumption estimate - all source data UK-level

# A form of fibre-based composite packaging –paperboard or paper fibres that are laminated with plastic
# Low recycling rates of approximately 2%

## Import trade data for CN 48236990 and 48236100 - no unit data for either
# 48236990 - Cups and the like, of paper or paperboard (excl. of bamboo paper or bamboo paperboard, and trays, dishes and plates)
# 48236100 - Trays, dishes, plates, cups and the like, of bamboo paper or bamboo paperboard

trade_data <- 
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202406 - 48236100 to 48236990.csv") %>%
  dplyr::group_by(FlowType, Year) %>%
  dplyr::summarise(tonnes = sum(NetMass/1000)) %>%
  pivot_wider(names_from = "FlowType",
              values_from = "tonnes") %>%
  clean_names() %>%
  mutate(net_imports = eu_imports + non_eu_imports - eu_exports - non_eu_exports)

## Import prodcom data for PCC 1722130
# 17221300  (CN 48236), Trays, dishes, plates, cups and the like of paper or paperboard

production_data <- 
  read_csv("./raw_data/17221300_2008-2024.csv") %>%
  filter(Variable == "Volume (Tonnes)") %>%
  mutate(# Remove letter E in the value column
         Value = gsub("E","", Value),
         Value = gsub(",","", Value)) %>%
  clean_names() %>%
  mutate_at(c('value'), as.numeric) %>%
  # Estimate share made up of cups
  mutate(domestic_production = value * 0.2) %>%
  select(year, domestic_production)

# Construct apparent consumption estimate
apparent_consumption_fibre_cups_uk <-
  left_join(trade_data, production_data, by=c("year")) %>%
  mutate(apparent_consumption = domestic_production + net_imports)

# https://committees.parliament.uk/writtenevidence/38900/pdf/
# Fibre cups 92% approximately paper - the rest, plastic

# Plastic cups 

# Sense check against estimated units POM and resulting weight

# Expert estimate 
# Valpak
# https://www.valpak.co.uk/wp-content/uploads/2024/07/Packflow-Refresh-2023-Paper-and-Card.pdf
# Fibre-based composition

consumer_fibre_22 <- 73000
non_consumer_fibre_22 <- 71000

valpak_total_fibre_22 = consumer_fibre_22 + non_consumer_fibre_22

# Share associated with paper cups difficult to know from the study

# https://www.wrap.ngo/sites/default/files/2022-02/WRAP-fibre%20composite%20packaging%20report.pdf

# Wrap - fibre-composite cups of 35.3k (+/- 9%) 
wrap_fibre_cups_19 = 35300
wrap_plastic_cups_19 = 7000

## Register estimate - Defra/NPWD
# What share of paper and cardboard?

# Previously captured under paper/cardboard in NPWD - to be classified as fibre-based composite in packaging returns going forward
Defra_packaging_all <-
  read_xlsx("./cleaned_data/Defra_packaging_all.xlsx") %>%
  filter(variable == "Arisings",
         material == "Paper and cardboard") %>%
  select(-rate)


