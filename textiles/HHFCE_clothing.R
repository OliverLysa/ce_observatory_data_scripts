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
  row_to_names(1) %>%
  clean_names()

# Remove non-numeric rows
consumer_purchases <-
  subset(consumer_purchases, grepl('^\\d+$', consumer_purchases$`clothing`)) 

# Assign frequency column and pivot longer
consumer_purchases <- 
  consumer_purchases %>%
  as.data.frame %>%
  pivot_longer(-c(time_period_and_codes),
               names_to = 'coicop')

# Create a column 'frequency' for later use as a filter based on whether there is a Q in the time_perod_and_codes column
consumer_purchases$frequency <- 
  ifelse(grepl("Q",consumer_purchases$time_period_and_codes),'quarterly','annual')

# Rename column 
consumer_purchases <- 
  consumer_purchases %>%
  rename('period' = 1)

# Export to database
DBI::dbWriteTable(con,
                  "textiles_consumer_purchases3",
                  consumer_purchases,
                  overwrite = TRUE)
