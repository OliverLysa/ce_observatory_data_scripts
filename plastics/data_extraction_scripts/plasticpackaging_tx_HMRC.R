##### **********************
# Purpose: Download HMT plastic packaging tax data

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
              "DBI",
              "RPostgres",
              "RSelenium",
              "netstat",
              "uktrade",
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "future",
              "furrr",
              "rjson",
              "comtradr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Import functions, options and connections
# *******************************************************************************

# Import functions
source("functions.R",
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Data download
# *******************************************************************************
#

download.file(
  "https://assets.publishing.service.gov.uk/media/66b4bd2749b9c0597fdb0cd7/PPT_statistics_ODS_year_2.ods",
  "./raw_data/HMRC_tax_revenue_update.ods"
)

### Updated version

PPT_statistics <-
  # Read in file
  read_ods("./raw_data/HMRC_tax_revenue_update.ods",
             sheet = "Table_1_&_2") %>%
  # Remove nas
  na.omit() %>%
  # Make row 1 the column names
  row_to_names(1) %>%
  # Clean those column names
  clean_names() %>%
  # Remove row with string detected in column
  filter(! str_detect(table_1, 'Table 2')) %>%
  pivot_longer(-c(table_1),
               names_to = 'variable') %>%
  mutate(frequency = ifelse(grepl("to", table_1),'annual','quarterly')) %>%
  mutate(unit = case_when(str_detect(variable, "revenue") ~ "Monetary",
                          str_detect(variable, "tonnage") ~ "Tonnes",
                          str_detect(variable, "number") ~ "Number")) %>%
  filter(! str_detect(value, '[x]')) %>%
  mutate(table_1 = gsub("\\[revised\\]", "", table_1)) %>%
  mutate(table_1 = gsub("\\[provisional\\]", "", table_1)) %>%
  na.omit() %>%
  rename(period = 1) %>%
  mutate_at(c('value'), as.numeric) %>%
  mutate(value = ifelse((unit %in% "Monetary"), value*1000000, value*1000)) %>%
  mutate(variable = gsub("_", " ", variable)) %>%
  mutate(variable = str_to_sentence(variable)) %>%
  mutate(frequency = str_to_sentence(frequency))

# Export to database
DBI::dbWriteTable(con, "pptxeffects",
                  PPT_statistics,
                  overwrite = TRUE)
