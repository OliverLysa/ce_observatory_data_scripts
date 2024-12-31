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

write_csv(rejects,
          "./cleaned_data/rejects.csv")

DBI::dbWriteTable(con,
                  "LACW_rejects",
                  rejects,
                  overwrite = TRUE)

# Calculate rejects as a percentage
collection_flows_LA <- read_ods("./raw_data/LA_collection.ods",
                                sheet = "Table_1") %>%
  row_to_names(3) %>%
  select(1,2,5,6,21:23) %>%
  clean_names() %>%
  filter(authority_type != "Collection") %>%
  mutate_at(c(5:7), as.numeric) %>%
  group_by(financial_year,region) %>%
  summarise(recycling = sum(local_authority_collected_waste_sent_for_recycling_composting_reuse_tonnes),
            residual = sum(local_authority_collected_waste_not_sent_for_recycling_tonnes),
            rejects = sum(local_authority_collected_estimated_rejects_tonnes)) %>%
  select(-rejects) %>%
  pivot_longer(-c(financial_year,region),
               names_to = "collection_route",
               values_to = "tonnages") %>%
  filter(collection_route == "recycling") %>%
  group_by(financial_year) %>%
  summarise(value = sum(tonnages))
  
rejects_share <- left_join(collection_flows_LA,
                           rejects) %>%
  mutate(share = rejects/value)
