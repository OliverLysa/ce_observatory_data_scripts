# England SUCB

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx",
  "tabulizer",
  "docxtractr",
  "campfin"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))


# Download the data
download.file("https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Single_use_plastic_carrier_bag_England_data_2016_17_to_2023_24.csv",
              "./raw_data/SUCB.csv")

# Import the data
SUCB_data <-  read_csv(
  "./raw_data/SUCB.csv",
  locale=locale(encoding="latin1")
) %>%
  select(1,4:5,8:13,15,18,20:23) %>%
  mutate_at(2:15, as.numeric) %>%
  pivot_longer(-1,
               names_to = 'variable',
               values_to = 'value') %>%
  na.omit() %>%
  clean_names() %>%
  group_by(year, variable) %>%
  summarise(value = sum(value)) %>%
  mutate(unit=ifelse(grepl("Number", variable), "Number", "Monetary"))

DBI::dbWriteTable(con,
                  "SUCB",
                  SUCB_data,
                  overwrite = TRUE)
