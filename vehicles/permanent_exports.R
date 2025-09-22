library(dplyr)
library(janitor)
library(tidyr)


table1 <- read.csv("./raw_data/Q1-Table 1.csv") %>%
  row_to_names(5) %>%
  select(1:2) %>%
  clean_names() %>%
  rename(year = calendar_year_of_export, no_exports = total_number_of_cars_exported) %>%
  mutate(no_exports = as.numeric(gsub(",", "", no_exports)))


table2 <- read.csv("./raw_data/Q2-Table 1.csv") %>%
  row_to_names(7) %>%
  clean_names() %>%
  pivot_longer(-c(1:3), names_to = "year", values_to = "value") %>%
  select(1:3, year, value) %>%
  mutate(year = as.numeric(gsub("x", "", year))) %>%
  group_by(make_model, year_of_first_registration, propulsion_type, year) %>%
  summarise(value = sum(value, na.rm = TRUE)) %>%
  filter(value != 0)

write.csv(table1, "./vehciles_exports_by_years.csv")
write.csv(table2, "./vehciles_exports_by_brand_model.csv")

proportion_tbl <- table2 %>%
  mutate(
    year = as.numeric(year),
    year_of_first_registration = as.numeric(year_of_first_registration),
    age = year - year_of_first_registration
  ) %>%
  group_by(year, age) %>%
  summarise(total_vehicles = sum(value, na.rm = TRUE), .groups = "drop") %>%
  filter(age >= 0) %>%
  mutate(age = as.numeric(age)) %>%
  group_by(year) %>%
  mutate(
    year_total = sum(total_vehicles),
    proportion = total_vehicles / year_total
  ) %>%
  ungroup()


