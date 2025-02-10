##### **********************
# Purpose: Download KBT litter data

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
  "RSelenium",
  "netstat",
  "uktrade",
  "httr",
  "jsonlite",
  "mixdist",
  "janitor",
  "onsr"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Data
# *******************************************************************************

### Litter Types

dataset <-
  read_excel("./raw_data/KBT_Litter_Composition_Survey.xlsx", sheet = 1)

datasettrimmed <- dataset[c(1:3361), c(10, 23:68)] %>%
  pivot_longer(-c(Region), names_to = c("Litter_Type")) %>%
  filter(value != 0) %>%
  mutate(Litter_Type = gsub("Litter Type Counts - ", "", Litter_Type)) %>%
  group_by(Litter_Type, Region) %>%
  summarise(Value = sum(value)) %>%
  mutate(study = "KBT 2020")
# mutate(freq = Value / sum(Value)) %>%
# mutate(across(is.numeric, round, digits=3)) %>%
# select(-Value)

datasettrimmed$Litter_Type <-
  str_trim(datasettrimmed$Litter_Type)

DBI::dbWriteTable(con, "litter_proportions", datasettrimmed, overwrite = TRUE)
