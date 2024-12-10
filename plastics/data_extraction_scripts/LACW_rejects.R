## LACW Rejects

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


rejects <- read_ods("./raw_data/LA_collection.ods",
                    sheet = "Table_1") %>%
  row_to_names(3) %>%
  select(1,2,5,6,23) %>%
  clean_names() %>%
  filter(authority_type != "Collection") %>%
  mutate_at(c(5), as.numeric) %>%
  group_by(financial_year) %>%
  summarise(rejects = sum(local_authority_collected_estimated_rejects_tonnes)) 

DBI::dbWriteTable(con,
                  "LACW_rejects",
                  rejects,
                  overwrite = TRUE)