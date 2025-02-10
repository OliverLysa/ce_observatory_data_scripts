##### **********************
# Purpose: Population breakdown for projection by UK country

# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "methods",
  "forecast"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Outturn
population_outturn <-
  read_csv("./raw_data/population_UK_wide.csv") %>%
  slice(-c(1:6)) %>%
  select(1, 2, 4, 7, 8) %>%
  rename(year = 1) %>%
  pivot_longer(-c(year), names_to = "country", values_to = "value") %>%
  mutate(country = gsub(" population mid-year estimate", "", country)) %>%
  mutate_at(c('value', 'year'), as.numeric) %>%
  group_by(year) %>%
  mutate(percentage = (value / sum(value))) %>%
  select(-value) %>%
  filter(country %in% c("England")) %>%
  group_by(year) %>%
  summarise(percentage = sum(percentage))

# download.file(
#   "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/tablea11principalprojectionuksummary/2021basedinterim/ukpppsummary.xlsx",
#   "./raw_data/population_projections.xlsx"
# )

# Projection
# Import projection and tidy
projection <- 
  read_excel("./raw_data/population_projections.xlsx",
             sheet = "PERSONS") %>%
  dplyr::mutate(id = row_number()) %>%
  filter(id %in% c(5, 25)) %>%
  select(3:50) %>%
  row_to_names(1) %>%
  dplyr::mutate(variable = "population",
                .before = "2021") %>%
  pivot_longer(-variable,
               names_to = "year",
               values_to = "UK") %>%
  mutate_at(c('year','UK'), as.numeric) %>%
  mutate(UK = UK * 1000)

download.file(
  "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/tablea14principalprojectionenglandsummary/2021basedinterim/enpppsummary.xlsx",
  "./raw_data/population_projection_England.xlsx"
)

projection_Eng <- 
  read_excel("./raw_data/population_projection_England.xlsx",
             sheet = "PERSONS") %>%
  dplyr::mutate(id = row_number()) %>%
  filter(id %in% c(5, 25)) %>%
  select(3:50) %>%
  row_to_names(1) %>%
  dplyr::mutate(variable = "population",
                .before = "2021") %>%
  pivot_longer(-variable,
               names_to = "year",
               values_to = "England") %>%
  mutate_at(c('year','England'), as.numeric) %>%
  mutate(England = England * 1000)

# Join
population_all <- 
  left_join(projection, projection_Eng) %>%
  mutate(percentage = England/UK) %>%
  select(year,percentage) %>%
  filter(year != 2021) %>%
  bind_rows(population_outturn) %>%
  arrange(year) %>%
  write_xlsx("./cleaned_data/population_projection_England_ratio.xlsx")
