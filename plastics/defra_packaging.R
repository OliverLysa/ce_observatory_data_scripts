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

# Defra packaging statistics

Defra_packaging_all <- read_ods( 
  "./raw_data/UK_Statistics_on_Waste_dataset_September_2024_accessible (1).ods",
  sheet = "Packaging") %>%
  row_to_names(6) %>%
  clean_names() %>%
  filter(material != "Total recycling and recovery", 
         material != "Total recycling") %>%
  filter(! str_detect(material, 'Metal')) %>%
  mutate(material = gsub("of which: ", "", material)) %>%
  mutate(material = gsub("of which:", "", material)) %>%
  pivot_longer(-c(year,material,achieved_recovery_recycling_rate),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('achieved_recovery_recycling_rate','value'), as.numeric) %>%
  na.omit() %>%
  dplyr::rename(rate = 3) %>%
  mutate(value = value * 1000) %>%
  mutate(rate = rate * 100) %>%
  mutate(variable = case_when(str_detect(variable, "packaging_waste_arising") ~ "Arisings",
                              str_detect(variable, "total_recovered_recycled") ~ "Recovered/recycled")) %>% 
  mutate_at(vars('rate','value'), funs(round(., 2)))

DBI::dbWriteTable(con,
                  "Defra_packaging",
                  Defra_packaging_all,
                  overwrite = TRUE)
