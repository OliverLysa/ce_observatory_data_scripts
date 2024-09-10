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

# *******************************************************************************

#Import Major Mineral EWCs 
nameslistMMW <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/EWC_Codes.xlsx", sheet = "MMW")

# ****2019***********************************************************************

All_2019 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2019/2019_WDI_Extract.xlsx", sheet = 1) 

All_2019_Grouped <- All_2019 %>% 
  filter (Site_Category=="Landfill") %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (Waste_Code, EWC_Waste_Desc) %>% 
  summarise (Value = sum(Tonnes_Received)) %>%
  mutate(Year = "2019")

# ****2018***********************************************************************

# Import 2018 data
All_2018 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2018/2018_WDI_Extract.xlsx", sheet = 1)

All_2018 <- All_2018[-c(1:7), ] %>% 
  row_to_names(row_number = 1)

# Filter to Landfill
All_2018_Grouped <- All_2018 %>% filter (`Site Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes Received`), as.numeric) %>% 
  subset (! `Waste Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste Code`, `EWC Waste Desc`) %>% 
  summarise (Value = sum(`Tonnes Received`)) %>%
  mutate(Year = "2018")

# ****2017***********************************************************************

# Import data
All_2017 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2017/2017_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2017_Grouped <- All_2017 %>% 
  filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! Waste_Code %in% nameslistMMW$Codes) %>%
  group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2017")

# ****2016***********************************************************************

# Import data
All_2016 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2016/2016_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2016_Grouped <- All_2016 %>% filter (`Site_Category`=="Landfill") %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! EWC_Code %in% nameslistMMW$Codes) %>%
  group_by(`EWC_Code`, `EWC_Waste_Description`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2016")

# ****2015***********************************************************************

# Import data
All_2015 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2015/2015_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2015_Grouped <- All_2015 %>% filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2015")

# ****2014***********************************************************************

# Import data
All_2014 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2014/2014_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2014_Grouped <- All_2014 %>% filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2014")

# ****2013***********************************************************************

# Import data
All_2013 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2013/2013_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2013_Grouped <- All_2013 %>% filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2013")

# ****2012***********************************************************************

# Import data
All_2012 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2012/2012_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2012_Grouped <- All_2012 %>% filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2012")

# ****2011***********************************************************************

# Import data
All_2011 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2011/2011_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2011_Grouped <- All_2011 %>% filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2011")

# ****2010***********************************************************************

# Import data
All_2010 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2010/2010_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2010_Grouped <- All_2010 %>% 
  filter (`Site_Category`=="Landfill") %>%
  filter(`Facility_RPA`!="Wales") %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2010")

# ****2009***********************************************************************

# Import data
All_2009 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2009/2009_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2009_Grouped <- All_2009 %>% 
  filter (`Site_Category`=="Landfill") %>% 
  filter(`Facility RPA`!="Wales") %>%
  mutate_at(vars(`Tonnes_Received`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Received`)) %>%
  mutate(Year = "2009")

# ****2008***********************************************************************

#Import General EWCs 
nameslist_plus20 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/EWC_Codes.xlsx", sheet = "Chpt_20_plus")

# Import data
All_2008 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2008/2008_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2008_Grouped <- All_2008 %>% 
  filter (`Site_Category`=="Landfill") %>% 
  mutate_at(vars(`Tonnes_Input`), as.numeric) %>%
  filter(`Facility RPA`!="Wales")

All_2008_Grouped$`Tonnes_Input` <- replace_na(All_2008_Grouped$`Tonnes_Input`, 0)

All_2008_Grouped <- All_2008_Grouped %>%
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  subset (! `Waste_Code` %in% nameslist_plus20$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Input`)) %>%
  mutate(Year = "2008")

# ****2007***********************************************************************

# Import data
All_2007 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2007/2007_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2007_Grouped <- All_2007 %>% 
  filter (`Site_Category`=="Landfill") %>% 
  filter(`Facility RPA`!="Wales")

All_2007_Grouped$`Tonnes_Input` <- replace_na(All_2007_Grouped$`Tonnes_Input`, 0)

All_2007_Grouped <- All_2007_Grouped %>%
  mutate_at(vars(`Tonnes_Input`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  subset (! `Waste_Code` %in% nameslist_plus20$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Input`)) %>%
  mutate(Year = "2007")

# ****2006***********************************************************************

# Import data
All_2006 <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/2006/2006_WDI_Extract.xlsx", sheet = 1)

# Filter to Landfill
All_2006_Grouped <- All_2006 %>% 
  filter (`Site_Category`=="Landfill") %>%
  filter(`Facility RPA`!="Wales")

All_2006_Grouped$`Tonnes_Input` <- replace_na(All_2007_Grouped$`Tonnes_Input`, 0)

All_2006_Grouped <- All_2006_Grouped %>%
  mutate_at(vars(`Tonnes_Input`), as.numeric) %>% 
  subset (! `Waste_Code` %in% nameslistMMW$Codes) %>%
  subset (! `Waste_Code` %in% nameslist_plus20$Codes) %>%
  dplyr::group_by (`Waste_Code`, `EWC_Waste_Desc`) %>% 
  summarise (Value = sum(`Tonnes_Input`)) %>%
  mutate(Year = "2006")

# Bind
Landfill_Grouped_All <-
  rbindlist(
    list(
      All_2019_Grouped,
      All_2018_Grouped,
      All_2017_Grouped,
      All_2016_Grouped,
      All_2015_Grouped,
      All_2014_Grouped,
      All_2013_Grouped,
      All_2012_Grouped,
      All_2011_Grouped,
      All_2010_Grouped
    ),
    use.names = FALSE
  ) %>%
  mutate(Treatment = "Landfill")

write_xlsx(Landfill_Grouped_All, "./Publication/Input/WT/Landfill_Incineration/Landfill/Output/Landfill_Grouped_All_Ex_MMW.xlsx") 

# Municipal Split *******************************************************************************

#Import Municipal EWCs 
nameslistBMW <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Input/EWC_Codes.xlsx", sheet = "BMW")

#Import dataset excluding mineral wastes
All <- read_excel("./Publication/Input/WT/Landfill_Incineration/Landfill/Output/Landfill_Grouped_All_Ex_MMW.xlsx", sheet = 1) 

# Match EWCs to categorise by municipal
All$EWC_Waste_Desc <-with(nameslistBMW, `Category (Landfill)`[match(All$Waste_Code, `EWC Code`)])

All$EWC_Waste_Desc <- replace_na(All$EWC_Waste_Desc, "Landfill - Non-municipal")

# Identify non-municipal

write_xlsx(All, "./Publication/Input/WT/Landfill_Incineration/Landfill/Output/Landfill_Grouped_All_Ex_MMW_Categorised_Municipal.xlsx") 
