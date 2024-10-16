##### **********************
# ASHE

# *******************************************************************************
# Require packages
#********************************************************************************

require(tidyverse)
require(magrittr)
require(writexl)
require(dplyr)
require(tidyverse)
require(readODS)
require(janitor)
require(data.table)
require(xlsx)
require(DT)
library(tibble)
library(scales)
library(knitr)
library(readxl)

# 2023

ASHE_23 <- read_excel("./raw_data/ASHE/ashetable162023provisional/PROV - SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2023.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2023")

# 2022

ASHE_22 <- read_excel("./raw_data/ASHE/ashetable162022revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2022.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2022")

# 2021

ASHE_21 <- read_excel("./raw_data/ASHE/ashetable162021revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2021.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2021")

# 2020

ASHE_20 <- read_excel("./raw_data/ASHE/table162020revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2020.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2020")

# 2019

ASHE_19 <- read_excel("./raw_data/ASHE/sic2007table162019revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2019.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2019")

# 2018

ASHE_18 <- read_excel("./raw_data/ASHE/sic2007table162018revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2018.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2018")

# 2017

ASHE_17 <- read_excel("./raw_data/ASHE/table162017revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2017.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2017")

# 2016

ASHE_16 <- read_excel("./raw_data/ASHE/table162016revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2016.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2016")

# 2015

ASHE_15 <- read_excel("./raw_data/ASHE/table162015revised/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2015.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2015")

# 2014

ASHE_14 <- read_excel("./raw_data/ASHE/rft-16(1)/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2014.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2014")

# 2013

ASHE_13 <- read_excel("./raw_data/ASHE/2013-revised-table-16/SIC07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2013.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2013")

# 2012

ASHE_12 <- read_excel("./raw_data/ASHE/2012-revised-table-16/Sic07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2012.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2012")

# 2011

ASHE_11 <- read_excel("./raw_data/ASHE/2011-revised-table-16/REVISED - Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2011.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2011")

# 2010

ASHE_10 <- read_excel("./raw_data/ASHE/2010-revised-table-16/REVISED - Sic07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2010.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2010")

# 2009

ASHE_09 <- read_excel("./raw_data/ASHE/2009-table-16/Sic07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2009.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2009")

# 2008

ASHE_08 <- read_excel("./raw_data/ASHE/2008-table-16--sic-2007-/sic07 Industry (4) SIC2007 Table 16.7a   Annual pay - Gross 2008.xls",
                      sheet = "All") %>%
  select(1,2,4,6) %>%
  row_to_names(4) %>%
  clean_names() %>%
  na.omit() %>%
  pivot_longer(-c(description, code),
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value','code'), as.numeric) %>%
  na.omit() %>%
  mutate(year = "2008")

ASHE_all <-
  rbindlist(
    list(
      ASHE_23,
      ASHE_22,
      ASHE_21,
      ASHE_20,
      ASHE_19,
      ASHE_18,
      ASHE_17,
      ASHE_16,
      ASHE_15,
      ASHE_14,
      ASHE_13,
      ASHE_12,
      ASHE_11,
      ASHE_10,
      ASHE_09,
      ASHE_08
    ),
    use.names = TRUE
  ) %>%
  mutate_at(c('year'), as.numeric) %>%
  mutate_at(c('code'), as.character) %>%
  mutate(type = str_to_title(type)) %>%
  arrange(year)

ASHE_all <- ASHE_all[nchar(ASHE_all$code) >= 3, ]

DBI::dbWriteTable(con,
                  "ASHE",
                  ASHE_all,
                  overwrite = TRUE)
