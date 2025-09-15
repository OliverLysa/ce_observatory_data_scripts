#   Name:       vehicles_EOL.R
#
#   Purpose:    Calculate per-unit weights for inclusion in modelled POM calculation. 
#
#   Author:     Oliver Lysaght

# Load packages -----------------------------------------------------------

# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "plyr",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "netstat",
  "mixdist",
  "janitor",
  "xlsx",
  "comtradr",
  "tidygraph",
  "DBI",
  "readr",
  "tidyr",
  "stringr",
  "broom",
  "purrr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Options and functions ---------------------------------------------------

# Remove scientific notation
options(scipen = 999)

# Import WDI data ---------------------------------------------------------

library(tidyverse)
library(readxl)
library(janitor)
library(data.table)

options(scipen = 999)

read_wdi <- function(year) {
  path <- sprintf("./raw_data/WDI/Input/%s/%s_WDI_Extract.xlsx", year, year)
  
  df <- read_excel(path, sheet = 1)
  
  # Special handling
  if (year == 2018) {
    df <- df[-c(1:7), ] %>% row_to_names(1)
  }
  if (year == 2013) {
    df <- df %>% select(1:23)
  }
  
  df <- df %>% clean_names()
  
  # If tonnes_input exists, rename it
  if ("tonnes_input" %in% names(df)) {
    df <- df %>% rename(tonnes_received = tonnes_input)
  }
  
  df %>%
    mutate(
      year = as.character(year),
      tonnes_received = as.numeric(tonnes_received)
    )
}


# Years range
years <- 2006:2023

# Read and combine
combined_list <- map(years, read_wdi) %>% rbindlist(use.names = TRUE, fill = TRUE)

# Summarise WDI data ------------------------------------------------------

## Product level
WDI_product <- combined_list %>%
  mutate(waste_code = coalesce(waste_code, ewc_code)) %>%
  filter(
    waste_code %in% c("16 01 04*", "16 01 06") &
      !grepl("transfer", site_category, ignore.case = TRUE) &
      !grepl("transfer", fate, ignore.case = TRUE)
  ) %>%
  group_by(year, waste_code, site_category) %>%
  summarise(tonnes_received = sum(tonnes_received, na.rm = TRUE))

write.csv(WDI_product, "WDI_product_site_category.csv")

ggplot(WDI_product, aes(x = year, y = tonnes_received, fill = waste_code)) +
  geom_bar(stat = "identity") +
  # facet_wrap(~ fate) +
  labs(
    x = "Year",
    y = "Tonnes Received",
    fill = "Waste Code",
    title = "Waste Received by Year, Waste Code"
  ) +
  theme_minimal()

## Component level ---------------------------------------------------------

WDI_components <- combined_list %>%
  mutate(waste_code = coalesce(waste_code, ewc_code)) %>%
  filter(
    waste_code %in% c(
      "16 01 07*",  # Oil filters
      "16 01 09*",  # Components containing PCBs
      "16 01 10*",  # Combustion engines containing hazardous substances
      "16 01 11*",  # Brake pads containing asbestos
      "16 01 13*",  # Brake fluids
      "16 01 14*",  # Antifreeze fluids (hazardous)
      "16 01 15",   # Antifreeze fluids (non-hazardous)
      "16 01 16",   # Tanks for liquefied gas
      "16 01 17*",  # Ferrous metal from ELVs (hazardous)
      "16 01 18",   # Non-ferrous metal from ELVs
      "16 01 19",   # Plastic from ELVs
      "16 01 20",   # Glass from ELVs
      "16 01 21*"   # Other hazardous components not otherwise specified
    ) &
      !grepl("transfer", site_category, ignore.case = TRUE) &
      !grepl("transfer", fate, ignore.case = TRUE)
  ) %>%
  group_by(year, waste_code, fate) %>%
  summarise(tonnes_received = sum(tonnes_received, na.rm = TRUE))

ggplot(WDI_components, aes(x = year, y = tonnes_received, fill = waste_code)) +
  geom_bar(stat = "identity") +
  facet_wrap(~ fate) +
  labs(
    x = "Year",
    y = "Tonnes Received",
    fill = "Waste Code",
    title = "Waste Received by Year, Waste Code"
  ) +
  theme_minimal()

# Wales data --------------------------------------------------------------

wales_product <- read_csv("./raw_data/NRW/output_data/combined_data.csv") %>%
  filter(ewc_code %in% c("160104", "160106") &
             !grepl("transfer", site_category, ignore.case = TRUE) 
         ) %>%
  group_by(year, ewc_code) %>%
  summarise(tonnes_received = sum(tonnes_received, na.rm = TRUE))

write.csv(wales_product, "wales_product.csv")
