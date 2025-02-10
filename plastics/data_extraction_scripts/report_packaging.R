# Report packaging data

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx")

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

# Read in the data
packaging_data <- 
  # Read the raw data in
  read_excel("./raw_data/pEPR_2023ReportedPackagingData_14102024 (1).xlsx") %>%
  clean_names() %>%
  na.omit() %>%
  filter(x1 != "Total Supplied") %>%
  select(-total_t) %>%
  pivot_longer(-x1, 
               names_to = "material",
               values_to = "value") %>%
  mutate(material = gsub("\\_.*", "", material)) %>%
  mutate(year = 2023) %>%
  rename(category = 1) %>%
  mutate(value = round(value, 1)) %>%
  mutate_at(c('material'), trimws) %>%
  mutate(material = gsub("fibre", "Fibre composite", material)) %>%
  mutate(material = gsub("paper", "Paper/card", material)) %>%
  mutate(material = str_to_sentence(material))

# Write to site database using the connection established
DBI::dbWriteTable(con,
                  "RPD_service",
                  packaging_data,
                  overwrite = TRUE)
