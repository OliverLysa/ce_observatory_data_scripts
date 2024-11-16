##### **********************
# WDI Data (EA Dataset)

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

# ****2022***********************************************************************

All_2022 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2022/2022_extracted.xlsx", sheet = 1) 

EWC_2022 <- All_2022 %>% 
  filter (`Site Category` %in% c("Landfill")) %>% 
  dplyr::group_by (`Waste Code`, `EWC Waste Desc`, `Site Category`) %>% 
  summarise (Value = sum(`Tonnes Received`)) %>%
  mutate(Year = "2022")

# ****2021***********************************************************************

All_2021 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2021/2021_extracted.xlsx", sheet = 1) 

EWC_2021 <- All_2021 %>% 
  filter (`Site Category` %in% c("Landfill")) %>% 
  dplyr::group_by (`Waste Code`, `EWC Waste Desc`, `Site Category`) %>% 
  summarise (Value = sum(`Tonnes Received`)) %>%
  mutate(Year = "2021")

# ****2020***********************************************************************

All_2020 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2020/2020_extracted.xlsx", sheet = 1) 

EWC_2020 <- All_2020 %>% 
  filter (`Site Category` %in% c("Landfill")) %>% 
  dplyr::group_by (`Waste Code`, `EWC Waste Desc`, `Site Category`) %>% 
  summarise (Value = sum(`Tonnes Received`)) %>%
  mutate(Year = "2020")

# ****2019***********************************************************************

All_2019 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2019/2019_WDI_Extract.xlsx", sheet = 1) 

EWC_2019 <- All_2019 %>% 
  filter (Site_Category %in% c("Landfill")) %>% 
  dplyr::group_by (Waste_Code, EWC_Waste_Desc, Site_Category) %>% 
  summarise (Value = sum(Tonnes_Received)) %>%
  mutate(Year = "2019")

# ****2018***********************************************************************

# Import 2018 data
All_2018 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2018/2018_WDI_Extract.xlsx", sheet = 1)

All_2018 <- All_2018[-c(1:7), ] %>% 
  row_to_names(row_number = 1)

# Filter to Landfill
EWC_2018 <- All_2018 %>% 
  filter (`Site Category` %in% c("Landfill")) %>% 
  mutate_at(vars(`Tonnes Received`), as.numeric) %>% 
  dplyr::group_by (`Waste Code`, `EWC Waste Desc`, `Site Category`) %>% 
  group_by (`Waste Code`, `EWC Waste Desc`, `Site Category`) %>% 
  summarise (Value = sum(`Tonnes Received`)) %>%
  mutate(Year = "2018") %>%
  mutate(`EWC Waste Desc` = str_replace(`EWC Waste Desc`, "^\\S* ", ""))
dplyr::mutate(`EWC Waste Desc` = str_replace(`EWC Waste Desc`, "^\\S* ", ""))

# ****2017***********************************************************************

# Import data
All_2017 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2017/2017_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2017 <- All_2017 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%  
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  group_by (`Waste_Code`, `EWC_Waste_Desc`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2017")  %>%
  mutate(`EWC_Waste_Desc` = str_replace(`EWC_Waste_Desc`, "^\\S* ", ""))

# ****2016***********************************************************************

# Import data
All_2016 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2016/2016_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2016 <- All_2016 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  group_by(`EWC_Code`, `EWC_Waste_Description`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2016") %>%
  mutate(`EWC_Waste_Description` = str_replace(`EWC_Waste_Description`, "^\\S* ", ""))

# ****2015***********************************************************************

# Import data
All_2015 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2015/2015_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2015 <- All_2015 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2015") %>%
  mutate(EWC_Waste_Desc = str_replace(EWC_Waste_Desc, "^\\S* ", ""))

# ****2014***********************************************************************

# Import data
All_2014 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2014/2014_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2014 <- All_2014 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%  
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`,Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2014") %>%
  mutate(EWC_Waste_Desc = str_replace(EWC_Waste_Desc, "^\\S* ", ""))

# ****2013***********************************************************************

# Import data
All_2013 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2013/2013_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2013 <- All_2013 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`,Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2013") %>%
  mutate(EWC_Waste_Desc = str_replace(EWC_Waste_Desc, "^\\S* ", ""))

# ****2012***********************************************************************

# Import data
All_2012 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2012/2012_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2012 <- All_2012 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%  
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2012")

# ****2011***********************************************************************

# Import data
All_2011 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2011/2011_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2011 <- All_2011 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2011")

# ****2010***********************************************************************

# Import data
All_2010 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2010/2010_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2010 <- All_2010 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>% 
  filter(`Facility_RPA`!="Wales") %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2010")

# ****2009***********************************************************************

# Import data
All_2009 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2009/2009_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
EWC_2009 <- All_2009 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%
  filter(`Facility RPA`!="Wales") %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`,Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2009")

# ****2008***********************************************************************

#Import General EWCs 
nameslist_plus20 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/EWC_Codes.xlsx", sheet = "Chpt_20_plus")

# Import data
All_2008 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2008/2008_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2008_Grouped <- All_2008 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>% 
  mutate_at(vars(`Tonnes_Input`), as.numeric) %>%
  filter(`Facility RPA`!="Wales")

All_2008_Grouped$`Tonnes_Input` <- replace_na(All_2008_Grouped$`Tonnes_Input`, 0)

EWC_2008 <- All_2008_Grouped %>%
  subset (! `Waste_Code` %in% nameslist_plus20$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`, Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Input`)) %>%
  mutate(Year = "2008")

# ****2007***********************************************************************

# Import data
All_2007 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2007/2007_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2007_Grouped <- All_2007 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>% 
  filter(`Facility RPA`!="Wales")

All_2007_Grouped$`Tonnes_Input` <- replace_na(All_2007_Grouped$`Tonnes_Input`, 0)

EWC_2007 <- All_2007_Grouped %>%
  mutate_at(vars(`Tonnes_Input`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslist_plus20$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`,Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Input`)) %>%
  mutate(Year = "2007")

# ****2006***********************************************************************

# Import data
All_2006 <- read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2006/2006_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2006_Grouped <- All_2006 %>% 
  filter (Site_Category %in% c("Landfill", "Incineration")) %>%
  filter(`Facility RPA`!="Wales")

All_2006_Grouped$`Tonnes_Input` <- replace_na(All_2006_Grouped$`Tonnes_Input`, 0)

EWC_2006 <- All_2006_Grouped %>%
  mutate_at(vars(`Tonnes_Input`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslist_plus20$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`,Site_Category) %>% 
  summarise (Value = sum(`Tonnes_Input`)) %>%
  mutate(Year = "2006")

# Bind
Landfill_EWC <-
  rbindlist(
    list(
      EWC_2006,
      EWC_2007,
      EWC_2008,
      EWC_2009,
      EWC_2010,
      EWC_2011,
      EWC_2012,
      EWC_2013,
      EWC_2014,
      EWC_2015,
      EWC_2016,
      EWC_2017,
      EWC_2018,
      EWC_2019,
      EWC_2020,
      EWC_2021,
      EWC_2022
      
    ),
    use.names = FALSE
  ) %>%
  rename(EWC = Waste_Code) %>%
  # unite(EWC, c(EWC_Waste_Desc, Waste_Code), sep = " - ", remove = TRUE) %>%
  mutate_at(c('Year'), as.numeric) %>%
  # group_by(Year, EWC) %>%
  # summarise(Value = sum(Value)) %>%
  arrange(EWC) %>%
  na.omit() %>%
  select(1,4,5)

DBI::dbWriteTable(con,
                  "Landfill_EWC",
                  Landfill_EWC,
                  overwrite = TRUE)

write_csv(Landfill_EWC, 
          "./cleaned_data/Landfill_EWC.csv")

Decription
# EWC code
# plastic packaging 
# 15 01 02

# plastic 
# 17 02 03

# waste plastic  
# 04 02 21
# textile packaging
# 

