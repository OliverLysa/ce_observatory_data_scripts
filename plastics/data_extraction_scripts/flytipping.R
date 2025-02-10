##### **********************
# Purpose: Download flytipping data

# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c("magrittr", 
              "writexl", 
              "readxl", 
              "dplyr", 
              "tidyverse", 
              "readODS", 
              "data.table", 
              "RSelenium", 
              "netstat", 
              "uktrade", 
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "onsr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Data
# *******************************************************************************

download.file(
  "https://assets.publishing.service.gov.uk/media/65e9d56462ff48001a87b393/Flytipping_incidents_and_actions_taken__reported_by_LAs_in_England__2012-13_to_2022-23_accessible_revised.ods",
  "./raw_data/flytipping_la.ods"
)

flytipping_all <-
  read_ods("./raw_data/flytipping_la.ods", sheet = "LA_incidents") %>%
  select(1,3,16:30) %>%
  row_to_names(2)

flytipping <- flytipping_all %>%
  dplyr::filter(!grepl('Total', `LA Name`)) %>%
  pivot_longer(-c(Year, `LA Name`),
               names_to = "type",
               values_to = "value") %>%
  mutate(Year = str_remove(Year, "-.+")) %>%
  mutate_at(c('value','Year'), as.numeric) %>%
  na.omit() %>%
  rename(Year = 1,
         LA = 2,
         type = 3,
         value = 4) %>%
  mutate_at(c('LA'), trimws)

write_csv(flytipping,
          "./cleaned_data/flytipping.csv")

# Write table
DBI::dbWriteTable(con,
                  "flytipping_england",
                  flytipping,
                  overwrite = TRUE)
  
# Summarise the number of events
flytipping_types <-
  read_ods("./raw_data/flytipping_la.ods", sheet = "LA_incidents") %>%
  row_to_names(2) %>%
  select(1,3,31:44) %>%
  dplyr::filter(!grepl('Total', `LA Name`)) %>%
  pivot_longer(-c(Year, `LA Name`),
               names_to = "type",
               values_to = "value") %>%
  mutate(variable = case_when(str_detect(type, "£") ~ "Costs",
                              str_detect(type, "Incidents") ~ "Size")) %>%
  filter(variable == "Size") %>%
  mutate(Year = str_remove(Year, "-.+")) %>%
  mutate_at(c('value','Year'), as.numeric) %>%
  clean_names() %>%
  group_by(year, type,) %>%
  summarise(value = sum(value, na.rm = TRUE)) %>%
  group_by(type) %>% 
  mutate(percent = value/sum(value))

