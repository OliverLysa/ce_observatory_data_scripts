##### **********************
# Purpose: Prepare composition data for plastic packaging

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

BOM <- 
  read_excel("./cleaned_data/plastic_packaging_composition.xlsx",
             sheet = "compiled_mass") %>%
  pivot_longer(-c(Year, Category, Type),
               names_to = "material",
               values_to = "value")

DBI::dbWriteTable(con,
                  "plastics_pom_composition",
                  BOM,
                  overwrite = TRUE)

               