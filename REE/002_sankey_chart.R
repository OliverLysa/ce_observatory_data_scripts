##### **********************
# Author: Oliver Lysaght
# Purpose: Converts cleaned data into sankey format for presenting in sankey chart
# Inputs:
# Required updates:

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
              "janitor")

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
# REE

cols <- c("source", "target")

# REE Data input
REE_sankey_links <- read_xlsx("./intermediate_data/REE_sankey_links.xlsx") %>%
  mutate(across(c('value'), round, 2)) %>%
  mutate(value = gsub("-", "", value)) %>%
  # filter(!year < 2007 | product != "BEV") %>%
  filter(target != "Lost") %>%
  mutate_at(vars(cols), ~ str_replace(., "_", " ")) %>%
  mutate_at(vars(cols), ~ str_replace(., "Retail distribute", "Retail")) %>%
  mutate_at(vars(cols), ~ str_replace(., "Consume", "Use")) %>%
  mutate_at(vars(cols), ~ str_replace(., "Dispose", "Disposal")) %>%
  mutate_at(vars(cols), ~ str_replace(., "Recycle", "Recycling")) %>%
  filter(! year > 2040,
         ! year < 1990) %>%
  mutate(material = "Neodymium") %>%
  mutate(color = "rgba(101, 221, 253, 0.8)")

# Write file to database
DBI::dbWriteTable(con, 
                  "REE_sankey_links", 
                  REE_sankey_links,
                  overwrite = TRUE)

# Write CSV
write_csv(REE_sankey_links,
          "./cleaned_data/REE_sankey_links.csv")
