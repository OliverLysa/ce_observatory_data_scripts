# Purpose: Upload PRN data from Lets Recycle to the Data Observatory Database

# *******************************************************************************
# Require packages and setup
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

# con <- dbConnect(RPostgres::Postgres(),
#                  dbname = 'postgres', 
#                  host = 'aws-0-eu-west-2.pooler.supabase.com',
#                  port = 6543,
#                  user = 'postgres.qowfjhidbxhtdgvknybu',
#                  password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
## Extraction

prn_prices_monthly <- 
  # Read the raw data in
  read_excel("./raw_data/PRNdata_2013_2023.xlsx") %>%
  # Remove the units in column names
  rename_with(~ str_remove(., " .*"), everything()) %>%
  # Fill the month column so every row has its month show
  fill(Month) %>%
  # Pivot the table so that the columns then become rows - easier to filter and handle in the site frontend
  pivot_longer(-c(Month, Material),
               names_to = "year", values_to = "value") %>%
  # Clean names so they are easier to select and handle
  clean_names() %>%
  # Separate out the range into a lower and upper
  separate(value,c("lower","upper"),sep="-|-") %>%
  # Convert those columns into a numeric type
  mutate_at(c('lower','upper'), as.numeric) %>%
  # Create an middle/average from the lower and upper
  rowwise() %>% 
  mutate(average=mean(c(lower, upper), na.rm=T)) %>%
  # where there is only one value in the raw data, add in the na
  mutate(upper = coalesce(upper, lower)) %>%
  # Pivot longer again to get a variable column
  # First you set which columns won't be pivoted
  pivot_longer(-c(month, year, material),
               # Then the names for the other columns which will be pivoted
               names_to = "variable", values_to = "value") %>%
  # Arrange the year column in order
  arrange(year) %>%
  # Add a column for the unit
  mutate(unit = "£ per tonne") %>%
  # Trim white space in the unit column
  mutate_at(c('unit'), trimws) %>%
  unite(year, year, month, sep = " - ")

# # Write to site database using the connection established
# DBI::dbWriteTable(con,
#                   "prn_prices_monthly",
#                   prn_prices_monthly,
#                   overwrite = TRUE)

# Get the same values at the level of year by taking an average across months

prn_prices_yearly <- prn_prices_monthly %>%
  # Separate the year and month column
  separate(year,c("year","month"),sep="-") %>%
  # Specify the group by variables
  group_by(year, material, variable, unit) %>%
  # Calculate mean
  dplyr::summarise(value = mean(value)) %>%
  # Round the value
  mutate(value = round(value, 1)) %>%
  # Make year numeric
  mutate_at(c('year'), as.numeric)

# # Write to site database using the connection established
# DBI::dbWriteTable(con,
#                   "prn_prices_yearly",
#                   prn_prices_yearly,
#                   overwrite = TRUE)

