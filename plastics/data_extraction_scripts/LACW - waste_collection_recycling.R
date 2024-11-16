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

# *******************************************************************************
# Options and functions
#********************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./scripts/functions.R", 
       local = knitr::knit_global())

## Waste collection and recycling download

# # Download the data
# download.file("https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Waste_collection_and_recycling_England_data_2022_23.csv",
#               "./raw_data/LACW/WDF_full_2022_23.csv")
# 
# # Download the data
# download.file("https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Waste_collection_and_recycling_England_data_2021_22.csv",
#               "./raw_data/LACW/WDF_full_2021_22.csv")
# 
# # Download the data
# download.file("https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Waste_collection_and_recycling_England_data_2020-21.csv",
#               "./raw_data/LACW/WDF_full_2020_21.csv")
# 
# # Download the data
# download.file("https://s3.eu-west-1.amazonaws.com/data.defra.gov.uk/Waste/Waste_collection_and_recycling_England_data_2019-20.csv",
#               "./raw_data/LACW/WDF_full_2019_20.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/Waste_collection_and_recycling_England_data_2018-19.csv",
#               "./raw_data/LACW/WDF_full_2018_19.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/Collection_data_England_2017_2018.csv",
#               "./raw_data/LACW/WDF_full_2017_18.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/collection_data_England_2016_2017.csv",
#               "./raw_data/LACW/WDF_full_2016_17.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/Collection_data_England_2015_2016.csv",
#               "./raw_data/LACW/WDF_full_2015_16.csv")
# 

# # Download the data
# download.file("http://data.defra.gov.uk/Waste/201314_england_wastedata.csv",
#               "./raw_data/LACW/WDF_full_2013_14.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/201213_england_wastedata.csv",
#               "./raw_data/LACW/WDF_full_2012_13.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_201112.csv",
#               "./raw_data/LACW/WDF_full_2011_12.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_201011.csv",
#               "./raw_data/LACW/WDF_full_2010_11.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_200910.csv",
#               "./raw_data/LACW/WDF_full_2009_10.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_200809.csv",
#               "./raw_data/LACW/WDF_full_2008_09.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_200708.csv",
#               "./raw_data/LACW/WDF_full_2007_08.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_200607.csv",
#               "./raw_data/LACW/WDF_full_2006_07.csv")
# 
# # Download the data
# download.file("http://data.defra.gov.uk/Waste/wastedata_200506.csv",
#               "./raw_data/LACW/WDF_full_2005_06.csv")

# Import the data

# 2022-23
WDF_full_2022_23 <- 
  read_csv("./raw_data/LACW/WDF_full_2022_23.csv") %>%
  row_to_names(1)

# 2021_22
WDF_full_2021_22 <- 
  read_csv("./raw_data/LACW/WDF_full_2021_22.csv") %>%
  row_to_names(1)

# 2020_21
WDF_full_2020_21 <- 
  read_csv("./raw_data/LACW/WDF_full_2020_21.csv") %>%
  row_to_names(1)

# 2019_20
WDF_full_2019_20 <- 
  read_csv("./raw_data/LACW/WDF_full_2019_20.csv") %>%
  row_to_names(1)

# 2018_19
WDF_full_2018_19 <- 
  read_csv("./raw_data/LACW/WDF_full_2018_19.csv") %>%
  row_to_names(1)

# 2017_18
WDF_full_2017_18 <- 
  read_csv("./raw_data/LACW/WDF_full_2017_18.csv")

# 2016_17
WDF_full_2016_17 <- 
  read_csv("./raw_data/LACW/WDF_full_2016_17.csv")

# 2015_16
WDF_full_2015_16 <- 
  read_csv("./raw_data/LACW/WDF_full_2015_16.csv")

# # 2014_15
# WDF_full_2014_15 <- 
#   read_csv("./raw_data/LACW/WDF_full_2014_15.csv")

# 2013_14
WDF_full_2013_14 <- 
  read_csv("./raw_data/LACW/WDF_full_2013_14.csv") %>%
  row_to_names(14)

# 2012_13
WDF_full_2012_13 <- 
  read_csv("./raw_data/LACW/WDF_full_2012_13.csv") %>%
  row_to_names(14)

# 2011_12
WDF_full_2011_12 <- 
  read_csv("./raw_data/LACW/WDF_full_2011_12.csv") %>%
  row_to_names(14)

# 2010_11
WDF_full_2010_11 <- 
  read_csv("./raw_data/LACW/WDF_full_2010_11.csv") %>%
  row_to_names(14)

# Bind datasets
WDF_full <-
  rbindlist(
    list(
      WDF_full_2022_23,
      WDF_full_2021_22,
      WDF_full_2020_21,
      WDF_full_2019_20,
      WDF_full_2018_19,
      WDF_full_2017_18,
      WDF_full_2016_17,
      WDF_full_2015_16
    ),
    use.names = FALSE
  ) %>%
  clean_names() %>%
  mutate(year = substrRight(period, 2))

WDF_full$year <- paste0("20", WDF_full$year)

# Q004 - How many households were provided with the following methods of residual waste containment?

Q004_households <- WDF_full %>%
  filter(question_number == "Q004") %>%
  filter(col_text != "Frequency of Collection") %>%
  select(authority, year, row_text, data) %>%
  mutate_at(c('data'), as.numeric)

Q004_frequency <- WDF_full %>%
  filter(question_number == "Q004") %>%
  filter(col_text == "Frequency of Collection") %>%
  select(authority, year, row_text, data)

# Q005 - How many households were offered the following containment methods for dry recyclable collection?

Q005_households <- WDF_full %>%
  filter(question_number == "Q005") %>%
  filter(col_text == "Number of Households") %>%
  select(authority, year, col_text, row_text, data) %>%
  mutate(data = gsub(",","", data)) # %>%
  # mutate_at(c('data'), as.numeric) %>%
  # na.omit()

Q005_frequency <- WDF_full %>%
  filter(question_number == "Q005") %>%
  filter(col_text == "Frequency") %>%
  select(authority, year, col_text, row_text, data)

Q005_all <- Q005_households %>%
  bind_rows(Q005_frequency)

# Write
DBI::dbWriteTable(con,
                  "WDF_Q005_alt",
                  Q005_all,
                  overwrite = TRUE)

# Q007 - How many households are served by a kerbside collection of: 

Q007 <- WDF_full %>%
  filter(question_number == "Q007") %>%
  select(authority, year, row_text, data) %>%
  mutate(data = gsub(",","", data)) %>%
  mutate_at(c('data'), as.numeric) %>%
  na.omit()

# Write
DBI::dbWriteTable(con,
                  "WDF_Q007",
                  Q007,
                  overwrite = TRUE)


# Q010 - Tonnes of material collected through kerbside schemes from household sources by LA or its contractors 
Q010 <- WDF_full %>%
  filter(question_number == "Q010",
         col_text == "Tonnage collected for recycling") %>%
  select(authority, year, row_text, material_group, data) %>%
  mutate(row_text = str_to_title(row_text)) %>%
  mutate_at(c('data'), as.numeric) %>%
  na.omit() %>%
  filter(data != 0) %>%
  group_by(year, row_text, material_group) %>%
  summarise(value = sum(data))

# Q011 - Tonnes of material collected from commercial, industrial or other non-household sources by LA or its contractors

Q011 <- WDF_full %>%
  filter(question_number == "Q011",
         col_text == "Tonnage collected for recycling") %>%
  select(authority, year, row_text, material_group, data) %>%
  mutate(row_text = str_to_title(row_text)) %>%
  mutate_at(c('data'), as.numeric) %>%
  na.omit() %>%
  filter(data != 0)

Q011$row_text <- genX(Q011$row_text, " [", "]")

# Q012 - Tonnes of material collected through kerbside schemes by non-contracted voluntary/community sector from household sources 
Q012 <- WDF_full %>%
  filter(question_number == "Q012",
         col_text == "Tonnage collected for recycling") %>%
  select(authority, year, row_text, material_group, data) %>%
  mutate(row_text = str_to_title(row_text)) %>%
  mutate_at(c('data'), as.numeric) %>%
  na.omit() %>%
  filter(data != 0) %>%
  group_by(year) %>%
  summarise(value = sum(data))

# Write
DBI::dbWriteTable(con,
                  "WDF_Q011",
                  Q011,
                  overwrite = TRUE)
