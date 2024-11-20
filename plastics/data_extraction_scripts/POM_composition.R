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
## Extraction
# Plastic BOM

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

               