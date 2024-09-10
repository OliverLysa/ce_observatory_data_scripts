##### **********************
# Trade

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

# Import PET scrap data
PET_scrap <-
  # Import data
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202407 - 39159020 to 39159080.csv") %>%
  unite(Description, Cn8, Description, sep = " - ") %>%
  select(1, 5:10) %>%
  mutate(NetMass = NetMass /1000) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  pivot_longer(-c(Description, Year, FlowType, Country),
               names_to = "Variable",
               values_to = "Value") %>%
  filter(Variable != "SuppUnit")

DBI::dbWriteTable(con, "plastic_PET_scrap",
                  PET_scrap,
                  overwrite = TRUE)

# Import PET scrap data
PET_primary <-
  # Import data
  read_csv("./raw_data/Yearly - UK-Trade-Data - 200001 to 202406 - 390760 to 390769.csv") %>%
  unite(Description, Cn8, Description, sep = " - ") %>%
  select(1, 5:10) %>%
  mutate(NetMass = NetMass /1000) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  pivot_longer(-c(Description, Year, FlowType, Country),
               names_to = "Variable",
               values_to = "Value") %>%
  filter(Variable != "SuppUnit") 

DBI::dbWriteTable(con, "plastic_PET_primary",
                  PET_primary,
                  overwrite = TRUE)
