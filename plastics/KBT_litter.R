require(readxl)
require(magrittr)
require(janitor)
require(tidyverse)
require(kableExtra)

#Turn off scientific notation
options(scipen=999)

### Litter Types 

dataset <- 
  read_excel("./raw_data/KBT_Litter_Composition_Survey.xlsx", sheet = 1) 

datasettrimmed <- dataset[c(1:3361), c(10, 23:68)] %>% 
  pivot_longer(-c(Region), names_to = c("Litter_Type")) %>% 
  filter(value != 0) %>%
  mutate(Litter_Type = gsub("Litter Type Counts - ", "", Litter_Type)) %>% 
  group_by(Litter_Type, Region) %>% 
  summarise(Value = sum(value)) # %>% 
  # mutate(freq = Value / sum(Value)) %>%
  # mutate(across(is.numeric, round, digits=3)) %>%
  # select(-Value)

DBI::dbWriteTable(con, 
                  "litter_proportions",
                  datasettrimmed,
                  overwrite = TRUE)
