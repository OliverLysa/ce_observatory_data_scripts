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

# *******************************************************************************
# Options and functions
# *******************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./functions.R", 
       local = knitr::knit_global())

# 2024

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2024/ukbusinessworkbook2024.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2024.xlsx"
)

BASL_2024 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2024.xlsx",
                      sheet = "Table 17") %>%
  row_to_names(3) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  rename(SIC = 1) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region)) %>%
  mutate(year = "2024")

# 2023

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2023/ukbusinessworkbook2023.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2023.xlsx"
)

BASL_2023 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2023.xlsx",
                        sheet = "Table 17") %>%
  row_to_names(3) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  rename(SIC = 1) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2023")

# 2022

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2022/ukbusinessworkbook2022.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2022.xlsx"
)

BASL_2022 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2022.xlsx",
                        sheet = "Table 17") %>%
  row_to_names(3) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  rename(SIC = 1) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2022")

# 2021

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2021/ukbusinessworkbook2021.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2021.xlsx"
)

BASL_2021 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2021.xlsx",
                        sheet = "Table 17") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename(SIC = 1) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2021")

# 2020

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2020/ukbusinessworkbook2020.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2020.xlsx"
)

BASL_2020 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2020.xlsx",
                        sheet = "Table 17") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename(SIC = 1) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  rename(SIC = 1) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2020")

# 2019

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2019/ukbusinessworkbook2019.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2019.xlsx"
)

BASL_2019 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2019.xlsx",
                        sheet = "Table 17") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename(SIC = 1) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2019")

# 2018

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2018/ukbusinessworkbook2018.xls",
  "./raw_data/UK businesses activity, size and location/BASL_2018.xls"
)

BASL_2018 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2018.xls",
                        sheet = "Table 17") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  rename(SIC = 1) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2018")

# 2017

download.file(
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/business/activitysizeandlocation/datasets/ukbusinessactivitysizeandlocation/2019/ukbusinessworkbook2019.xlsx",
  "./raw_data/UK businesses activity, size and location/BASL_2017.xlsx"
)

BASL_2017 <- read_excel("./raw_data/UK businesses activity, size and location/BASL_2017.xlsx",
                        sheet = "Table 17") %>%
  row_to_names(5) %>%
  clean_names() %>%
  select(1,6:15) %>%
  rename_with(~ str_remove(., ".*?_"), everything()) %>%
  rename(SIC = 1) %>%
  separate(SIC,c("SIC","Description"),sep=" : ") %>%
  mutate_at(c('SIC','Description'), trimws) %>%
  pivot_longer(-c(SIC, Description),
               names_to = "Region",
               values_to = "value") %>%
  mutate(Region = gsub("_", " ", Region)) %>%
  mutate(Region = str_to_title(Region))  %>%
  mutate(year = "2017")

BASL_all <-
  rbindlist(
    list(
      BASL_2024,
      BASL_2023,
      BASL_2022,
      BASL_2021,
      BASL_2020,
      BASL_2019,
      BASL_2018,
      BASL_2017
    ),
    use.names = TRUE
  ) %>%
  mutate_at(c('year'), as.numeric)

DBI::dbWriteTable(con,
                  "BASL",
                  BASL_all,
                  overwrite = TRUE)
