## UK Stats on Waste

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
## Extraction

# Download the data
download.file("https://assets.publishing.service.gov.uk/media/66f17b8e7aeb85342827ac1b/UK_Statistics_on_Waste_dataset_September_2024_accessible.ods",
              "./raw_data/UK_Stats_Waste.ods")

# England generation
waste_gen_england <- read_ods("./raw_data/UK_Stats_Waste.ods",
                      sheet= "Waste_Gen_Eng_2010-22") %>%
  row_to_names(6) %>%
  clean_names() %>%
  select(-22) %>%
  slice(-1) %>%
  unite(ewc_stat, na_2, na_3, sep = " - ") %>%
  rename(year = 1,
         type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  mutate(region = "England",
         variable = "generation")

# UK generation
waste_gen_uk <- read_ods("./raw_data/UK_Stats_Waste.ods",
                              sheet= "Waste_Gen_UK_2010_-20") %>%
  row_to_names(6) %>%
  clean_names() %>%
  select(-22) %>%
  slice(-1) %>%
  unite(ewc_stat, na_2, na_3, sep = " - ") %>%
  rename(year = 1,
         type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  mutate(region = "UK",
         variable = "generation")

# England generation
waste_treatment_england <- read_ods("./raw_data/UK_Stats_Waste.ods",
                              sheet= "Waste_Tre_Eng_2010-22") %>%
  row_to_names(7) %>%
  clean_names() %>%
  select(-11) %>%
  unite(ewc_stat, ewc_stat_code, ewc_stat_description, sep = " - ") %>%
  rename(type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  mutate(region = "England",
         variable = "treatment")

# UK generation
waste_treatment_UK <- read_ods("./raw_data/UK_Stats_Waste.ods",
                                    sheet= "Waste_Tre_UK_2010-20") %>%
  row_to_names(7) %>%
  clean_names() %>%
  select(-11) %>%
  unite(ewc_stat, ewc_stat_code, ewc_stat_description, sep = " - ") %>%
  rename(type = 3) %>%
  pivot_longer(-c(year, ewc_stat, type),
               names_to = "category",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  mutate(region = "UK",
         variable = "treatment")

stats_all <-
  rbindlist(
    list(
      waste_gen_england,
      waste_gen_uk,
      waste_treatment_england,
      waste_treatment_UK), 
    use.names = FALSE) %>%
  mutate(value = round(value, 2)) %>%
  filter(type != "Total") %>%
  mutate(variable = str_to_sentence(variable)) %>%
  dplyr::filter(!grepl('Total', ewc_stat))

DBI::dbWriteTable(con,
                  "waste_generation_treatment",
                  stats_all,
                  overwrite = TRUE)


## Infrastructure

# England generation
infrastructure <- read_ods("./raw_data/UK_Stats_Waste.ods",
                              sheet= "Infrastructure") %>%
  row_to_names(6) 

names(infrastructure) <- 
  paste(names(infrastructure), infrastructure[1, ], sep = "_")

infrastructure <- infrastructure %>%
  slice(-1) %>%
  na.omit() %>%
  clean_names() %>%
  rename(year = 1,
         measure = 2) %>%
  pivot_longer(-c(year, measure),
               names_to = "category",
               values_to = "value") %>%
  separate(category, into = c("type", "region"), sep="_(?=[^_]+$)") %>%
  mutate(value = gsub("[^0-9.-]", "", value)) %>%
  mutate(measure = gsub("*", "", measure)) %>%
  # recode empty strings "" by NAs
  mutate(across(c(value), na_if, "")) %>%
  # remove NAs
  na.omit() %>%
  mutate_at(c('value'), as.numeric) %>%
  mutate(across(c('value'), round, 2))

%>%
  na.omit() %>%
  mutate(category = gsub("_", " ", category)) %>%
  mutate(category = str_to_sentence(category)) %>%
  mutate(region = "England",
         variable = "generation")
