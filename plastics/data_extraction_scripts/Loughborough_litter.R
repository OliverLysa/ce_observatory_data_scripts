##### **********************
# Purpose: Download loughborough data

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
              "onsr")

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

# Data by material
material <-
  extract_tables('./raw_data/1-s2.0-S0304389422009086-mmc1.pdf', pages = 6) %>%
  as.data.frame() %>%
  row_to_names(1) %>%
  clean_names() %>%
  rename(region = 1) %>%
  pivot_longer(-region,
               names_to = "sub_type",
               values_to = "value") %>%
  mutate_at('value', as.numeric) %>%
  na.omit() %>%
  mutate(measure = "Material")

# Data by type
litter_type <-
  extract_tables('./raw_data/1-s2.0-S0304389422009086-mmc1.pdf', pages = 7) %>%
  as.data.frame() %>%
  row_to_names(1) %>%
  clean_names()  %>%
  rename(region = 1) %>%
  pivot_longer(-region,
               names_to = "sub_type",
               values_to = "value") %>%
  mutate_at('value', as.numeric) %>%
  na.omit() %>%
  mutate(`sub_type` = gsub("wet", "wet wipe", sub_type)) %>%
  mutate(`sub_type` = gsub("expanded", "expanded polystyrene", sub_type)) %>%
  mutate(measure = "Litter type")

# Bind measures
loughborough_litter <- material %>%
  bind_rows(litter_type) %>%
  mutate(`sub_type` = gsub("_", "", sub_type)) %>%
  mutate(sub_type = str_to_sentence(sub_type)) %>%
  mutate(region = gsub("Yorkshire and", "Yorkshire and The Humber", region))

DBI::dbWriteTable(con,
                  "loughborough_litter",
                  loughborough_litter,
                  overwrite = TRUE)
