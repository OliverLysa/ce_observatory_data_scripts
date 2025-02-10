##### **********************
# Purpose: Download Lets Recycle data

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

recycling_prices <-
  read_excel("./raw_data/lets_recycle_prices.xlsx") %>%
  pivot_longer(-c(Year, Application, `Sub-type`),
               names_to = "month",
               values_to = "value") %>%
  separate(value,c("lower","upper"),sep="- | -") %>%
  filter(lower != "-") %>%
  na.omit() %>%
  dplyr::mutate_at(c('lower'), trimws) %>%
  mutate(lower = gsub("-", "-", lower)) %>%
  mutate(lower = gsub(" ", "", lower))

# For some reason, am exporting and then re-importing

write_xlsx(recycling_prices,
            "./cleaned_data/recycling_prices.xlsx")

recycling_prices <- 
  read_excel("./cleaned_data/recycling_prices.xlsx") %>%
  mutate_at(c('upper'), as.numeric) %>%
  pivot_longer(-c(Year, Application, `Sub-type`, month),
               names_to = "variable", values_to = "value") %>%
  clean_names() %>%
  dplyr::group_by(year, application, sub_type, variable) %>%
  dplyr::summarise(value = mean(value)) %>%
  mutate(value = round(value, 0))

DBI::dbWriteTable(con,
                  "plastic_recycling_prices",
                  recycling_prices,
                  overwrite = TRUE)
