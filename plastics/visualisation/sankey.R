##### **********************
# Purpose: Converts cleaned data into sankey format for presenting in sankey chart

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

SW_all <- read_csv(
  "./cleaned_data/plastics_sankey_links_ex_rev.csv")

mass <- SW_all %>%
  mutate(unit = "mass")

sankey_all <- SW_all %>%
  mutate(unit = "monetary") %>%
  bind_rows(mass)

# Export to database
DBI::dbWriteTable(con, "plastics_sankey_links",
                  sankey_all,
                  overwrite = TRUE)



