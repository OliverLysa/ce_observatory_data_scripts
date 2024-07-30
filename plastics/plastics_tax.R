# *******************************************************************************
# Require packages
#********************************************************************************

require(writexl)
require(dplyr)
require(tidyverse)
require(readODS)
require(janitor)
require(data.table)
require(xlsx)
require(readxl)
require(reticulate)

con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 6543,
                 user = 'postgres.qowfjhidbxhtdgvknybu',
                 password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Options and functions
#********************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./functions.R", 
       local = knitr::knit_global())

# *******************************************************************************
# Download and data preparation
#********************************************************************************
#

# Download the file
download.file(
  "https://www.ons.gov.uk/file?uri=/economy/environmentalaccounts/datasets/ukenvironmentalaccountsenvironmentaltaxes/current/ukenvironmentaltaxes2023.xlsx",
  "./raw_data/ONS_tax_revenue.xlsx"
)

# Add tax rate
# Create lookup for gases
year <- c(2021,2022,2023,2024)
value <- c('210.82',
          '210.82',
          '210.82',
          '210.82')
tax_rate <- data.frame(year, value) %>%
  mutate(across(where(is.character), as.numeric))

# Extract the table
packaging_tax <-
  # Import data
  read_xlsx("./raw_data/ONS_tax_revenue.xlsx",
            sheet = "Table 1") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(.,contains(c("plastic", "time"))) %>%
  select(-c(3:5)) %>%
  rename(revenue = 1,
         year = 2) %>%
  mutate(across(where(is.character), as.numeric)) %>%
  left_join(tax_rate, "year") %>%
  mutate(revenue = revenue*1000000) %>%
  mutate(tonnes = revenue/value) %>%
  select(year, revenue,tonnes) %>%
  na.omit() %>%
  pivot_longer(-year,
               names_to = "variable",
               values_to = "value")

