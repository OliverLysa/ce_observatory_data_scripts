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

options(scipen=999)

# Turn off scientific notation 
options(scipen=999)

# ****2019***********************************************************************

# Import EA Landfill data
All_2019 <- read_excel("./raw_data//Landfill_Incineration/Incineration/Input/2019_Incin_EWC.xlsx", sheet = 2) 

All_2019_Grouped <- All_2019 %>%
  dplyr::group_by (EWC) %>% 
  summarise (Value = sum(`EWC tonnage`)) %>%
  mutate(Year = "2019")

# ****2018***********************************************************************
All_2018 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2018_Incin_EWC.xlsx", sheet = "Incineration inputs") 

All_2018 <- All_2018[ ,(12:13)]

All_2018_Grouped <- All_2018 %>%
  dplyr::group_by (EWC) %>% 
  summarise (Value = sum(`EWC tonnage`)) %>%
  mutate(Year = "2018")

# ****2017***********************************************************************
All_2017 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2017_Incin_EWC.xlsx", sheet = "EWC") 

All_2017_Grouped <- All_2017 %>%
  dplyr::group_by (EWC) %>% 
  summarise (Value = sum(`EWC tonnage`)) %>%
  mutate(Year = "2017")

# ****2016***********************************************************************
All_2016 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2016_Incin_EWC.xlsx", sheet = "Incineration Inputs") 

All_2016 <- All_2016[, c(11,15)]

All_2016_Grouped <- All_2016 %>%
  na.omit() %>%
  dplyr::group_by (EWC) %>% 
  summarise (Value = sum(`Tonnage Incinerated in 2016`)) %>%
  mutate(Year = "2016")

# ****2015***********************************************************************
All_2015 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2015_Incin_EWC.xlsx", sheet = "EWC Data") 

All_2015_Grouped <- All_2015 %>%
  na.omit() %>%
  mutate_at(vars(`EWC tonnage`), as.numeric) %>%
  dplyr::group_by (EWC) %>% 
  summarise (Value = sum(`EWC tonnage`)) %>%
  mutate(Year = "2015")

# ****2014***********************************************************************
All_2014 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2014_Incin_EWC.xlsx", sheet = 1) %>%
  row_to_names(row_number = 2)

All_2014 <- All_2014[, c(4,5)]

All_2014_Grouped <- All_2014 %>%
  na.omit() %>%
  mutate_at(vars(`Tonnage`), as.numeric) %>%
  group_by(`EWC Code`) %>%
  summarise (Value = sum(`Tonnage`)) %>%
  mutate(Year = "2014")

# ****2012***********************************************************************
All_2012 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2012_Incin_EWC.xlsx", sheet = 1) %>%
  row_to_names(row_number = 3)

All_2012 <- All_2012[, c(4,5)]

All_2012_Grouped <- All_2012 %>%
  na.omit() %>%
  mutate_at(vars(`Tonnage`), as.numeric) %>%
  group_by(`EWC Code`) %>%
  summarise (Value = sum(`Tonnage`)) %>%
  mutate(Year = "2012")

# ****2010***********************************************************************
All_2010 <- read_excel("./raw_data/Landfill_Incineration/Incineration/Input/2010_Incin_EWC.xlsx", sheet = 1) %>%
  row_to_names(row_number = 2)

All_2010 <- All_2010[, c(7,8)]

All_2010_Grouped <- All_2010 %>%
  na.omit() %>%
  mutate_at(vars(`Tonnage`), as.numeric) %>%
  group_by(`EWC Code`) %>%
  summarise (Value = sum(`Tonnage`)) %>%
  mutate(Year = "2010")

# Bind
Incin_Grouped_All <-
  rbindlist(
    list(
      All_2019_Grouped,
      All_2018_Grouped,
      All_2017_Grouped,
      All_2016_Grouped,
      All_2015_Grouped,
      All_2014_Grouped,
      All_2012_Grouped,
      All_2010_Grouped
    ),
    use.names = FALSE
  ) %>%
  mutate(Treatment = "Incineration")

write_xlsx(Incin_Grouped_All, "./cleaned_data/incineration_EWC.xlsx") 
