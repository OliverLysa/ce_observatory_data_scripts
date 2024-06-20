##### **********************
# Author: Matt and Oliver
# Data update frequency: Quarterly

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

con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 5432,
                 user = 'postgres.qowfjhidbxhtdgvknybu',
                 password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Data download
# *******************************************************************************
#

# Download data
download.file(
  "https://www.ons.gov.uk/file?uri=/economy/nationalaccounts/satelliteaccounts/datasets/consumertrendschainedvolumemeasureseasonallyadjusted/current/consumertrendsq42023cvmsa.xls",
  "./raw_data/consumer_trends.xls")

consumer_purchases <-
  # Import latest CN data linked to here
  read_excel("./raw_data/consumer_trends.xls",
             sheet = "03KS") %>%
  na.omit() %>%
  row_to_names(1)
  




