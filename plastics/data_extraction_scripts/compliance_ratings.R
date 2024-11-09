# Compliance ratings

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
require(purrr)

# *******************************************************************************
# Options and functions

#********************************************************************************

# compliance ratings are used help assess the risks from a regulated facility.

compliance_22 <- read_excel("./raw_data/Compliance ratings/2022 Compliance Rating Dataset.xlsx",
                      sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  select(-1) %>%
  mutate(year = 2022)

compliance_21 <- read_excel("./raw_data/Compliance ratings/2021 Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2021)

compliance_20 <- read_excel("./raw_data/Compliance ratings/2020 Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2020)

compliance_19 <- read_excel("./raw_data/Compliance ratings/2019 Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2019)

compliance_18 <- read_excel("./raw_data/Compliance ratings/2018 Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2018)

compliance_17 <- read_excel("./raw_data/Compliance ratings/2017 Opra Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2017)

compliance_16 <- read_excel("./raw_data/Compliance ratings/2016 Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2016)

compliance_15 <- read_excel("./raw_data/Compliance ratings/2015 Compliance Rating Dataset.xlsx",
                             sheet = 1) %>%
  na.omit() %>%
  row_to_names(1) %>%
  mutate(year = 2015)

compliance_all <-
  rbindlist(
    list(
      compliance_22,
      compliance_21,
      compliance_20,
      compliance_19,
      compliance_18
      # compliance_17,
      # compliance_16,
      # compliance_15
    ),
    use.names = FALSE,
    fill = TRUE
  ) %>%
  select(5:8) %>%
  clean_names()%>%
  mutate(regulatory_sector = str_to_sentence(regulatory_sector)) %>%
  mutate(sub_sector = str_to_sentence(sub_sector)) %>%
  count(regulatory_sector, sub_sector, compliance_rating, year, sort = TRUE) %>%
  unite(sub_sector, c(regulatory_sector, sub_sector), sep = "-", remove = FALSE)

DBI::dbWriteTable(con,
                  "compliance_ratings",
                  compliance_all,
                  overwrite = TRUE)
