##### **********************
# Purpose: Download BRES data

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

# 2022

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2022provisional/table22022p.xlsx",
  "./raw_data/BRES/BRES_22.xlsx"
)

BRES_22 <- read_excel("./raw_data/BRES/BRES_22.xlsx",
                          sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2022")

# 2021

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2021revised/table22021r.xlsx",
  "./raw_data/BRES/BRES_21.xlsx"
)

BRES_21 <- read_excel("./raw_data/BRES/BRES_21.xlsx",
                         sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2021")

# 2020

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2020revised/table22020r.xlsx",
  "./raw_data/BRES/BRES_20.xlsx"
)

BRES_20 <- read_excel("./raw_data/BRES/BRES_20.xlsx",
                      sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2020")

# 2019 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2019revised/table22019rcorr.xlsx",
  "./raw_data/BRES/BRES_19.xlsx"
)

BRES_19 <- read_excel("./raw_data/BRES/BRES_19.xlsx",
                      sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2019")

# 2018 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2018revised/table22018r.xlsx",
  "./raw_data/BRES/BRES_18.xlsx"
)

BRES_18 <- read_excel("./raw_data/BRES/BRES_18.xlsx",
                      sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2018")

# 2017 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2017revised/table22017r.xlsx",
  "./raw_data/BRES/BRES_17.xlsx"
)

BRES_17 <- read_excel("./raw_data/BRES/BRES_17.xlsx",
                      sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2017")

# 2016

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2016revised/table22016r.xlsx",
  "./raw_data/BRES/BRES_16.xlsx"
)

BRES_16 <- read_excel("./raw_data/BRES/BRES_16.xlsx",
                      sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2016")

# 2015 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2015revised/table22015r.xls",
  "./raw_data/BRES/BRES_15.xls"
)

BRES_15 <- read_excel("./raw_data/BRES/BRES_15.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2015")

# 2014 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2014revised/table22014r.xls",
  "./raw_data/BRES/BRES_14.xls"
)

BRES_14 <- read_excel("./raw_data/BRES/BRES_14.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2014")

# 2013 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2013revised/table22013r_tcm77-417413.xls",
  "./raw_data/BRES/BRES_13.xls"
)

BRES_13 <- read_excel("./raw_data/BRES/BRES_13.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2013")

# 2012 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2012revised/table22012r_tcm77-378286.xls",
  "./raw_data/BRES/BRES_12.xls"
)

BRES_12 <- read_excel("./raw_data/BRES/BRES_12.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2012")

# 2011 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2011revised/table22011revisedbresv2_tcm77-328598.xls",
  "./raw_data/BRES/BRES_11.xls"
)

BRES_11 <- read_excel("./raw_data/BRES/BRES_11.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2011")

# 2010 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2010revised/t2totalbyindustry10r_tcm77-280712.xls",
  "./raw_data/BRES/BRES_10.xls"
)

BRES_10 <- read_excel("./raw_data/BRES/BRES_10.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2010")

# 2009 

download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2009revised/t2totalbyindustry0_tcm77-235534.xls",
  "./raw_data/BRES/BRES_09.xls"
)

BRES_09 <- read_excel("./raw_data/BRES/BRES_09.xls",
                      sheet = "Table 2a - GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2009")

BRES_all <-
  rbindlist(
    list(
      BRES_22,
      BRES_21,
      BRES_20,
      BRES_19,
      BRES_18,
      BRES_17,
      BRES_16,
      BRES_15,
      BRES_14,
      BRES_13,
      BRES_12,
      BRES_11,
      BRES_10,
      BRES_09
    ),
    use.names = TRUE
  ) %>%
  mutate_at(c('year'), as.numeric) 

# Import descriptions
descriptions <- read_excel("./raw_data/BRES/BRES_22.xlsx",
                      sheet = "Sic Names") %>%
  dplyr::rename(SIC = 1)

# Join to descriptions
BRES_all <- BRES_all %>%
  left_join(descriptions, "SIC") %>%
  unite(code_desc, c(SIC, `SIC Name`), sep = " - ", remove = FALSE)

# Write to database
DBI::dbWriteTable(con,
                  "Business_Register_and_Employment_Survey",
                  BRES_all,
                  overwrite = TRUE)
