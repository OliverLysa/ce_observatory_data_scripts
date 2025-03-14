# Purpose: import Waste Investigations Report data

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

# Turn off scientific notation
options(scipen=999)

# *******************************************************************************
# Data
# *******************************************************************************

download.file(
  "https://environment.data.gov.uk/api/file/download?fileDataSetId=a15b347f-c277-4139-8988-a3ae2fd8b385&fileName=Waste_Investigations_Report.xlsx",
  "./raw_data/waste_investigations.xlsx"
)

Region_name <- read_excel("./raw_data/waste_investigations.xlsx",
                          sheet = "Lists") %>%
  slice(1:15) %>%
  clean_names()

# Import data and tidy
waste_investigations <- read_excel("./raw_data/waste_investigations.xlsx",
                      sheet = "Raw Data") %>%
  select(2,3,5,7, 12,15, 17,18) %>%
  clean_names() %>%
  mutate(start_year = substr(start_date, 1, 4)) %>%
  unique() %>%
  mutate(
    inc_state = stringr::str_remove(inc_state, ' .*')
  ) %>%
  left_join(Region_name, by = "area") %>%
  select(-c(area,start_date)) %>%
  dplyr::rename(region = "description") %>%
  filter(waste_type == "Packaging") %>%
  na.omit() %>%
  mutate_at(c('industry_sector'), trimws) %>%
  unite(industry_sub_sector, c(industry_sector, industry_sub_sector), sep = "-", remove = FALSE)

DBI::dbWriteTable(con,
                  "waste_investigations",
                  waste_investigations,
                  overwrite = TRUE)



