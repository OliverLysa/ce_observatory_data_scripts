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

datasettrimmed <- dataset[c(1:3361), c(1, 23:68)] %>% 
  pivot_longer(-c(Identifier), names_to = c("Litter_Type")) %>% 
  filter(value != 0)

datasettrimmed$Litter_Type <- gsub(".*- ","", datasettrimmed$Litter_Type)

Litter_Types <- datasettrimmed %>% 
  group_by(Litter_Type) %>% 
  summarise(Value = sum(value)) %>% 
  mutate(freq = Value / sum(Value)*100)

