#Load packages
require(magrittr)
require(writexl)
require(dplyr)
require(tidyverse)
require(readODS)
require(janitor)
require(data.table)
require(xlsx)
require(readxl)
require(rio)

#******2024*****************

#Import data 
Exp2024 <- read_excel(
  "./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments RDF SRF Exported from England 2024 Notifier (1).xlsx",
  sheet = "Annual Running Total") %>%
  select(3:5) %>%
  na.omit() %>%
  row_to_names(1) %>%
  rename(Type = 1,
         Destination = 2,
         Total = 3) %>%
  mutate_at(c('Total'), as.numeric) %>%
  group_by (Type, Destination) %>% 
  summarise (Total = sum(Total)) %>%
  mutate(Year = "2024")

#******2023*****************

#Import data 
Exp2023 <- read_excel(
  "./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments -RDF SRF Exported from England 2023 Notifier (3).xlsx",
  sheet = "Annual Running Total") %>%
  select(3:5) %>%
  na.omit() %>%
  row_to_names(1) %>%
  rename(Type = 1,
         Destination = 2,
         Total = 3) %>%
  mutate_at(c('Total'), as.numeric) %>%
  group_by (Type, Destination) %>% 
  summarise (Total = sum(Total)) %>%
  mutate(Year = "2023")

#******2022*****************

#Import data 
Exp2022 <- read_excel(
  "./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments -RDF.SRF Exported from England 2022.Notifier.xlsx",
  sheet = "Annual running total") %>%
  select(3:5) %>%
  na.omit() %>%
  row_to_names(1) %>%
  rename(Type = 1,
         Destination = 2,
         Total = 3) %>%
  mutate_at(c('Total'), as.numeric) %>%
  group_by (Type, Destination) %>% 
  summarise (Total = sum(Total)) %>%
  mutate(Year = "2022")

#******2021*****************

#Import data 
Exp2021 <- read_excel(
  "./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments -RDF.SRF Exported from England 2021.Notifier.xlsx",
  sheet = "Annual running total") %>%
  select(3:5) %>%
  na.omit() %>%
  row_to_names(1) %>%
  rename(Type = 1,
         Destination = 2,
         Total = 3) %>%
  mutate_at(c('Total'), as.numeric) %>%
  group_by (Type, Destination) %>% 
  summarise (Total = sum(Total)) %>%
  mutate(Year = "2021")

#******2020*****************

#Import data 
Exp2020 <- import_list(
  "./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments -RDF.SRF Exported from England 2020.Notifier.xlsx") 

Exp2020 <- bind_rows(Exp2020) %>% 
  na.omit() %>% 
  filter_at(c(1), all_vars(.!="Notifier")) %>%
  rename(Company = 1,
         Type = 2,
         Destination= 3, 
         Value = 4) %>%
  mutate_at(vars(Value), as.numeric) %>% 
  mutate(Type = gsub("Refuse derive dfuel (RDF)", "Refuse derived fuel (RDF)", Type, fixed = TRUE)) %>%
  mutate(Type = tolower(Type)) %>%
  dplyr::group_by (Type, Destination) %>% 
  summarise (Total = sum(Value)) %>%
  mutate(Year = "2020")

#******2019*****************

#Import data 
Exp2019 <- 
  import_list("./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments -RDF.SRF Exported from England 2019.Notifier.xlsx") 

Exp2019 <- bind_rows(Exp2019) %>% 
  na.omit() %>% 
  filter_at(c(1), all_vars(.!="Notifier")) %>%
  rename(Company = 1,
         Type = 2,
         Destination= 3, 
         Value = 4) %>%
  mutate_at(vars(Value), as.numeric) %>% 
  mutate(Type = gsub("Refuse derive dfuel (RDF)", "Refuse derived fuel (RDF)", Type, fixed = TRUE)) %>%
  mutate(Type = tolower(Type)) %>%
  dplyr::group_by (Type, Destination) %>% 
  summarise (Total = sum(Value)) %>%
  mutate(Year = "2019")

#******2018*****************

#Import data 
Exp2018 <- 
  import_list("./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments -RDF.SRF Exported from England 2018.Notifier.xlsx") 

Exp2018 <- bind_rows(Exp2018) %>% 
  na.omit() %>% 
  filter_at(c(1), all_vars(.!="Notifier")) %>%
  rename(Company = 1,
         Type = 2,
         Destination= 3, 
         Value = 4) %>%
  mutate_at(vars(Value), as.numeric) %>% 
  mutate(Type = gsub("Refuse derive dfuel (RDF)", "Refuse derived fuel (RDF)", Type, fixed = TRUE)) %>%
  mutate(Type = tolower(Type)) %>%
  dplyr::group_by (Type, Destination) %>% 
  summarise (Total = sum(Value)) %>%
  mutate(Year = "2018")

#******2017*****************

#Import data 
Exp2017 <- 
  import_list("./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments exported from England 2017.xlsx") 

Exp2017 <- bind_rows(Exp2017) %>% 
  na.omit() %>% 
  filter_at(c(1), all_vars(.!="Notifier")) %>%
  rename(Company = 1,
         Type= 2, 
         Destination = 3,
         Value = 4) %>%
  mutate_at(vars(Value), as.numeric) %>% 
  mutate(Type = gsub("Refuse derive dfuel (RDF)", "Refuse derived fuel (RDF)", Type, fixed = TRUE)) %>%
  mutate(Type = tolower(Type)) %>%
  dplyr::group_by (Type, Destination) %>% 
  summarise (Total = sum(Value)) %>%
  mutate(Year = "2017")

Exp2017stay <- Exp2017 %>% filter(Destination != "Refuse derived fuel (RDF)", 
                                  Destination != "Solid recovered fuel (SRF)")

Exp2017flip <- Exp2017 %>% filter(Destination == "Refuse derived fuel (RDF)" |
                                  Destination == "Solid recovered fuel (SRF)")

Exp2017flip[1:2] <- Exp2017flip[2:1]

Exp2017 <- rbind(Exp2017stay, Exp2017flip)

#******2016*****************
  
#Import data 
Exp2016 <- 
  import_list("./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments exported from England 2016.xlsx") 

Exp2016 <- bind_rows(Exp2016) %>% 
  na.omit() %>% 
  filter_at(c(1), all_vars(.!="Notifier")) %>%
  rename(Company = 1,
         Destination= 2, 
         Type = 3,
         Value = 4) %>%
  mutate_at(vars(Value), as.numeric) %>% 
  mutate(Type = gsub("Refuse derive dfuel (RDF)", "Refuse derived fuel (RDF)", Type, fixed = TRUE)) %>%
  mutate(Type = tolower(Type)) %>%
  dplyr::group_by (Type, Destination) %>% 
  summarise (Total = sum(Value)) %>%
  mutate(Year = "2016")

#******2015*****************

#Import data 
Exp2015 <- 
  import_list("./raw_data/International_Waste_Shipments_exported_from_England/International Waste Shipments exported from England 2015.xlsx") 

Exp2015 <- bind_rows(Exp2015) %>% 
  na.omit() %>% 
  filter_at(c(1), all_vars(.!="Notifier")) %>%
  rename(Company = 1,
         Destination= 2, 
         Type = 3,
         Value = 4) 

Exp2015stay <- Exp2015 %>% filter(Value != "Refuse derived fuel (RDF)", 
                                  Value != "Solid recovered fuel (SRF)",
                                  Value != "Refuse Derived Fuel (RDF)",
                                  Value == "Refuse derived fuel (rdf)",
                                  Value == "Material source for SRF production")

Exp2015flip <- Exp2015 %>% filter(Value == "Refuse derived fuel (RDF)" |
                                  Value == "Solid recovered fuel (SRF)" |
                                  Value == "Refuse Derived Fuel (RDF)" |
                                  Value == "Refuse derived fuel (rdf)"|
                                  Value == "Material source for SRF production")

Exp2015flip[3:4] <- Exp2015flip[4:3]

Exp2015 <- rbind(Exp2015stay, Exp2015flip)

Exp2015 <- Exp2015 %>%
  mutate_at(vars(Value), as.numeric) %>% 
  mutate(Type = gsub("Refuse derive dfuel (RDF)", "Refuse derived fuel (RDF)", Type, fixed = TRUE)) %>%
  mutate(Type = tolower(Type)) %>%
  dplyr::group_by (Type, Destination) %>% 
  summarise (Total = sum(Value)) %>%
  mutate(Year = "2015")

#*****************************

# Bind
Exp_Combined <-
  rbindlist(
    list(
      Exp2024,
      Exp2023,
      Exp2022,
      Exp2021,
      Exp2020,
      Exp2019,
      Exp2018,
      Exp2017,
      Exp2016,
      Exp2015
    ),
    use.names = FALSE
  ) %>%
  mutate(Type = tolower(Type)) %>%
  mutate(Type=ifelse(grepl("rdf",Type), "Refuse derived fuel", Type)) %>%
  mutate(Type=ifelse(grepl("srf",Type), "Solid recovered fuel", Type)) %>%
  mutate(Type=ifelse(grepl("other",Type), "Other", Type)) %>%
  mutate(Type=ifelse(grepl("mechanical treatment|concentrate",Type), "Other", Type)) %>%
  mutate(Destination=ifelse(grepl("The netherlands|Netherlands|netherlands",Destination), "The Netherlands", Destination))

capFirst <- function(s) {
  paste(toupper(substring(s, 1, 1)), substring(s, 2), sep = "")
}

Exp_Combined$Destination <- 
  capFirst(Exp_Combined$Destination)

DBI::dbWriteTable(con,
                  "RDF_trade",
                  Exp_Combined,
                  overwrite = TRUE)

write_csv(Exp_Combined,
          "./cleaned_data/RDF_exports.csv")



