library(dplyr)
library(readr)
library(readxl)
library(janitor)
library(tidyr)


# Import the official data on numbers stolen ------------------------------------------------

# Import the vehicle theft data - number of vehicle thefts
vehicle_offence_data <- read_xlsx("./raw_data/appendixtablesyedec2024final.xlsx", sheet = "Table A5a") %>%
  row_to_names(8) %>%
  clean_names() %>%
  select(-1) %>%
  filter(grepl("vehicle", .[[1]], ignore.case = TRUE)) %>%
  pivot_longer(
    cols = -1, 
    names_to = "year",  
    values_to = "value"       
  ) %>%
  filter(!grepl("percent", year, ignore.case = TRUE)) %>%
  filter(grepl(c("Theft or unauthorised taking of a motor vehicle|Aggravated vehicle taking"), offence_category, ignore.case = TRUE)) %>%
  # Here we convert the financial year into calendar year through assigning the financial year to its largest component - covering 9 months
  mutate(year = str_extract(year, "\\d{4}")) %>%
  mutate_at(c('value','year'), as.numeric) %>%
  group_by(year) %>%
  summarise(value = sum(value))

# Import the rate of return data, that we can subtract to get the final number of thefts
vehicle_return_owner <- read_xlsx("./raw_data/nocvehiclethefttables2024.xlsx", sheet = "Table_4") %>%
  row_to_names(8) %>%
  clean_names() %>%
  pivot_longer(
    cols = -1, 
    names_to = "year",
    values_to = "value"  
  ) %>%
  filter(!grepl("compared", year, ignore.case = TRUE)) %>%
  filter(str_trim(rates_of_return_and_damage) == "Returned to owner") %>%
  mutate(year = as.numeric(str_extract(year, "\\d{4}")),
         value = as.numeric(value),
         proportion = value / 100) %>%
  select(year, rates_of_return_and_damage, proportion) %>%
  complete(
    year = 2001:(max(year) + 1),        
    rates_of_return_and_damage = "Returned to owner"
  ) %>%
  arrange(year) %>%
  # Step 1: interpolate missing values inside observed range
  mutate(proportion_interp = zoo::na.approx(proportion, x = year, na.rm = FALSE)) %>%
  # Step 2: fit regression only on observed years
  { 
    model <- lm(proportion ~ year, data = filter(., !is.na(proportion)))
    mutate(., proportion_final = ifelse(is.na(proportion_interp),
                                        predict(model, newdata = data.frame(year = year)),
                                        proportion_interp))
  } %>%
  select(year, rates_of_return_and_damage, proportion = proportion_final)

# Combine the two datasets
vehicle_theft_adjusted <- vehicle_offence_data %>%
  left_join(vehicle_return_owner, by = "year") %>%
  mutate(
    returned = value * proportion,          # number returned
    adjusted_thefts = value - returned      # thefts not returned
  ) %>%
  select(year, adjusted_thefts) %>%
  rename(number = adjusted_thefts)

# Get age of stolen vehicles --------------------------------------------------
# We use this as a basis to map to the weights data

# Get the age profile of stolen vehicles
vehicle_age <- read_xlsx("./raw_data/nocvehiclethefttables2024.xlsx", sheet = "Table_10") %>%
  row_to_names(8) %>%
  clean_names() %>%
  pivot_longer(
    cols = -1, 
    names_to = "year",
    values_to = "value"  
  ) %>%
  filter(!grepl("compared", year, ignore.case = TRUE)) %>%
  mutate(year = str_extract(year, "\\d{4}")) %>%
  mutate_at(c('value'), as.numeric) %>%
  filter(age_of_vehicles != "Unweighted base - number of incidents") %>%
  mutate(value = value / 100) 

# Extend the table so we have a proportion for earlier years
vehicle_age_extended <- vehicle_age %>%
  mutate(year = as.numeric(year)) %>%
  # create full year sequence for each age group
  complete(age_of_vehicles, year = 2001:2023) %>%
  group_by(age_of_vehicles) %>%
  arrange(year) %>%
  # fill missing values backwards from first non-NA (2013 value)
  fill(value, .direction = "up") %>%
  ungroup()

# Then join the two tables so we have number of vehicles stolen for good by age group
vehicle_theft_by_age <- 
  left_join(vehicle_theft_adjusted, vehicle_age_extended) %>%
  mutate(number = number* value) %>%
  select(1:3) %>%
  na.omit()

expand_age_to_manufacture <- function(year_of_theft, number, age_of_vehicles) {
  if (is.na(age_of_vehicles)) {
    return(tibble(
      year_of_theft = NA_integer_,
      manufacture_year = NA_integer_,
      number = NA_real_
    ))
  } else if (str_detect(age_of_vehicles, "Less than one year")) {
    tibble(
      year_of_theft = year_of_theft,
      manufacture_year = year_of_theft,
      number = number
    )
  } else if (str_detect(age_of_vehicles, "More than one year, but less than five years")) {
    yrs <- (year_of_theft-4):(year_of_theft-1)
    tibble(
      year_of_theft = year_of_theft,
      manufacture_year = yrs,
      number = number / length(yrs)
    )
  } else if (str_detect(age_of_vehicles, "More than five years, but less than ten years")) {
    yrs <- (year_of_theft-9):(year_of_theft-5)
    tibble(
      year_of_theft = year_of_theft,
      manufacture_year = yrs,
      number = number / length(yrs)
    )
  } else if (str_detect(age_of_vehicles, "More than ten years")) {
    tibble(
      year_of_theft = year_of_theft,
      manufacture_year = year_of_theft-10,  # or a range if preferred
      number = number
    )
  } else {
    tibble(
      year_of_theft = NA_integer_,
      manufacture_year = NA_integer_,
      number = NA_real_
    )
  }
}

# Apply to the dataset
vehicle_age_expanded <- vehicle_theft_by_age %>%
  filter(!is.na(age_of_vehicles)) %>%
  mutate(row_id = row_number()) %>%
  group_by(row_id) %>%
  group_map(~ expand_age_to_manufacture(.x$year, .x$number, .x$age_of_vehicles)) %>%
  bind_rows() %>%
  arrange(year_of_theft, manufacture_year)

## Match the thefts by vehicle age to the weights per manufacture year so we have tonnages --------------------------

pom_data_per_unit_weight_GB_fuel <- read_csv("./cleaned_data/pom_data_per_unit_weight_GB_fuel.csv") %>%
  select(year, per_unit_weight)

# Temp - should be redone to match vehicle weights used elsewhere

# Fit linear model on observed data
model <- lm(per_unit_weight ~ year, data = pom_data_per_unit_weight_GB_fuel)

# Predict for earlier years (1990–2000)
backcast <- tibble(year = 1990:2000) %>%
  mutate(per_unit_weight = predict(model, newdata = tibble(year = year)))

# Combine with observed data
pom_data_per_unit_weight_GB_fuel <- bind_rows(backcast, pom_data_per_unit_weight_GB_fuel) %>%
  arrange(year)

# Join to get the tonnages
thefts_weight <- vehicle_age_expanded %>%
  left_join(pom_data_per_unit_weight_GB_fuel, by=c("manufacture_year" = "year")) %>%
  mutate(tonnes = number * per_unit_weight) %>%
  group_by(year_of_theft) %>%
  summarise(number = sum(number),
            tonnes = sum(tonnes)) %>%
  select(-number) %>%
  rename(year = year_of_theft)

# Then need to break this down by fuel type - we assume the thefts mirror the stock proportions in each year
thefts_weights_fuel_type_breakdown <- DBI::dbReadTable(observatory_con, "vehicle_stock") %>%
  select(1:4) %>%
  group_by(product, year) %>%
  summarise(value = sum(stock, na.rm = TRUE), .groups = "drop") %>%
  group_by(year) %>%
  mutate(
    total_year = sum(value, na.rm = TRUE),
    proportion = value / total_year
  ) %>%
  ungroup() %>%
  select(product, year, proportion)

# Join and then get the total weight broken down by fuel type (assuming same proportions as stock)
thefts_weights_fuel_type <- thefts_weight %>%
  left_join(thefts_weights_fuel_type_breakdown, by = c("year")) %>%
  mutate(value = tonnes * proportion) %>%
  select(year, product, value) %>%
  rename(fuel = product)

# Then need to break this down by material
# Component level first --------------------------------------------
composition <- read_excel("./raw_data/Book2.xlsx",
                          sheet = "Cars_components_weight_for OL_%") %>%
  select(-c(1:2)) %>%
  na.omit() %>%
  pivot_longer(-c(1:2),
               names_to = "fuel",
               values_transform = as.numeric) %>%
  clean_names()

# Get detail by component
theft_detail <- left_join(thefts_weights_fuel_type, composition, by=c("fuel")) %>%
  mutate(weight_tonnes = (value.x * value.y)) %>%
  # remove categories for which there is nothing
  filter(weight_tonnes != 0) %>%
  clean_names() %>%
  select(fuel,
         year,
         component_1,
         component_2,
         weight_tonnes)

# Then material
materials <- read_excel("./raw_data/Book2.xlsx",
                        sheet = "Material BOM_cars_for OL") %>%
  mutate_at(vars(4:81), as.numeric)%>%
  pivot_longer(-c(1:3),
               names_to = "component_2",
               values_to = "share") %>%
  na.omit() %>%
  mutate(share = share/100)

# Get detail by material
theft_material <- left_join(theft_detail, materials, by=c("fuel","component_2")) %>%
  mutate(material_tonnes = weight_tonnes*share) %>%
  filter(material_tonnes != 0) %>%
  group_by(fuel,
           year,
           component_1,
           component_2,
           material_group,
           material) %>%
  summarise(material_tonnes = sum(material_tonnes, na.rm = TRUE)) %>%
  mutate_at(c('year'), as.numeric) %>%
  group_by(year, fuel, material_group) %>%
  summarise(material_tonnes = sum(material_tonnes))
