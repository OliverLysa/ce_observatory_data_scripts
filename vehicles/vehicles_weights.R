#   Name:       vehicles_weights.R
#
#   Purpose:    Calculate per-unit weights for inclusion in modelled POM calculation. 
#
#   Author:     Oliver Lysaght

# Load packages -----------------------------------------------------------

# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "plyr",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "netstat",
  "mixdist",
  "janitor",
  "xlsx",
  "comtradr",
  "tidygraph",
  "DBI",
  "readr",
  "tidyr",
  "stringr",
  "broom",
  "purrr")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Options and functions ---------------------------------------------------

# Remove scientific notation
options(scipen = 999)

# do_backcast <- function(y, h = 10) {
#   y %>%
#     reverse_ts() %>%
#     hybridModel(models = "aet", weights = "equal") %>%
#     forecast(h = h) %>%
#     reverse_forecast()
# }
# 
# as_forecast_df <- function(fc, fuel) {
#   tibble(
#     Index    = time(fc$mean),
#     Forecast = as.numeric(fc$mean),
#     Lo95     = fc$lower[,"95%"],
#     Hi95     = fc$upper[,"95%"],
#     fuel     = fuel
#   )
# }
# 
# # 
# # make_ts <- function(df) {
# #   ts(df$per_unit_weight, start = min(df$year), frequency = 1)
# # }
# 
# make_ts <- function(df, k = 3) {
#   # k = window size for moving average
#   smoothed <- rollmean(df$per_unit_weight, k = k, fill = NA, align = "right")
#   
#   # fallback for first few NAs (and just use original values)
#   smoothed[is.na(smoothed)] <- df$per_unit_weight[is.na(smoothed)]
#   
#   ts(smoothed, start = min(df$year), frequency = 1)
# }

# Import the ultimate specs data and summarise by brand, year of manufacture and fuel type ---------------------------------

# Get average by year and brand
ultimate_specs_weights <- fread("./raw_data/ultimatespecs.csv") %>%
  # clean names to make them easier to work with
  clean_names() %>%
  # select relevant columns
  select(year, brand, body, model, curb_weight) %>%
  # Drop instances where no weights are present (no useful information for us)
  mutate(curb_weight = na_if(curb_weight, "")) %>%
  drop_na(curb_weight) %>%
  # separate the column now so we can get to the kg only
  separate_wider_delim(curb_weight, delim = "/", names = c("weight_1", "weight2")) %>%
  # Create first column where the data is in kg from the curb weight - could alternatively do weight conversion using case when but this is easier
  mutate(kg_1 = case_when(
    grepl("kg", weight_1, ignore.case = TRUE) ~ weight_1,
    TRUE ~ NA)) %>%
  # Create second column where the data is in kg from the curb weight
  mutate(kg_2 = case_when(
    grepl("kg", weight2, ignore.case = TRUE) ~ weight2,
    TRUE ~ NA)) %>%
  # Bring the two column together
  mutate(kg = coalesce(kg_1, kg_2)) %>%
  # Remove the unit as we know it's kg and need the column numeric
  mutate(kg = gsub(" kg", "", kg)) %>%
  # Clean the weights column - trailing and leading 0s so making numeric doesn't remove the data
  mutate(kg = trimws(kg)) %>%
  # Convert to numeric
  mutate_at(c('kg'), as.numeric) %>%
  # # Remove unrequired columns
  select(year, brand,model,kg) %>%
  # group by the variables
  group_by(year, brand) %>%
  # Get the average within the group
  dplyr::summarise(average_weight = mean(kg), .groups = "keep", na.rm = TRUE) %>%
  mutate(product = "vehicles")

# Import
ultimate_specs_weights_fuel <- fread("./raw_data/ultimatespecs.csv") %>%
  # clean names to make them easier to work with
  clean_names() %>%
  # We do this here as we drop engine type
  mutate(
    fuel_type = if_else(
      !is.na(engine_type) & str_detect(engine_type, regex("^electric$", ignore_case = TRUE)),
      "Battery electric",
      fuel_type
    )
  ) %>%
  # select relevant columns
  select(year, brand, body, fuel_type,model, curb_weight) %>%
  # Drop instances where no weights are present (no useful information for us)
  mutate(curb_weight = na_if(curb_weight, "")) %>%
  drop_na(curb_weight) %>%
  # separate the column now so we can get to the kg only
  separate_wider_delim(curb_weight, delim = "/", names = c("weight_1", "weight2")) %>%
  # Create first column where the data is in kg from the curb weight - could alternatively do weight conversion using case when but this is easier
  mutate(kg_1 = case_when(
    grepl("kg", weight_1, ignore.case = TRUE) ~ weight_1,
    TRUE ~ NA)) %>%
  # Create second column where the data is in kg from the curb weight
  mutate(kg_2 = case_when(
    grepl("kg", weight2, ignore.case = TRUE) ~ weight2,
    TRUE ~ NA)) %>%
  # Bring the two column together
  mutate(kg = coalesce(kg_1, kg_2)) %>%
  # Remove the unit as we know it's kg and need the column numeric
  mutate(kg = gsub(" kg", "", kg)) %>%
  # Clean the weights column - trailing and leading 0s so making numeric doesn't remove the data
  mutate(kg = trimws(kg)) %>%
  # Convert to numeric
  mutate_at(c('kg'), as.numeric) %>%
  # Final cleaning of body types in scope
  # Suspect categories - van, truck, pick-up, motorhome, bus
  # Applying ELV Regs rules (though no van in the dataset is greater than 3500 at present)
  filter(!(grepl("van", body, ignore.case = TRUE) & kg > 3500)) %>%
  # majority appears actually in scope, however due to our summarising at the brand level, they can be considered outliers that might be worth cleaning
  filter(!grepl("motorhome|van|bus|Limousine|minivan", body, ignore.case = TRUE)) %>%
  # Remove 
  # Flag outliers within each group
  group_by(fuel_type, year) %>%
  # Use MAD to remove outliers on the upper side
  mutate(
    med = median(kg, na.rm = TRUE),
    mad_val = mad(kg, na.rm = TRUE)
  ) %>%
  mutate(
    MAD_outlier = ifelse(kg > med + 1 * mad_val, TRUE, FALSE)
  ) %>%
  ungroup() %>%
  filter(MAD_outlier == FALSE | is.na(MAD_outlier)) %>%
  # # Remove unrequired columns
  select(year, brand,model,fuel_type, kg) %>%
  # group by the variables
  group_by(year, brand, fuel_type) %>%
  # Get the average within the group
  dplyr::summarise(average_weight = mean(kg), .groups = "keep") %>%
  mutate(product = "vehicles") %>%
  # Reclassify names for subsequent matching
  mutate(
    fuel_type = case_when(
      fuel_type %in% c("Mild Petrol", "Mild Diesel", 
                       "Mild Hybrid / Diesel", "Mild Hybrid / Petrol", 
                       "Hybrid / Petrol", "Hybrid / Diesel") ~ "Hybrid electric",
      fuel_type %in% c("Plug-in Hybrid / Petrol", "Plug-in Hybrid / Diesel","Plug-in Petrol") ~ "Plug-in hybrid electric",
      fuel_type %in% c("Petrol or CNG", "Petrol or LPG","Petrol or Ethanol") ~ "Petrol",
      TRUE ~ fuel_type
    )
  ) %>%
  filter(! fuel_type %in% c("LPG or CNG","-"))

# # Import the EV specifications data
# ev_specifications <- fread("./raw_data/cars.csv") %>%
#   clean_names() %>%
#   mutate(year = str_sub(model_name, 1, 4)) %>%
#   select(brand_name, year, curb_weight) %>%
#   mutate(
#     # extract the part ending in "kg"
#     average_weight = str_extract(curb_weight, "[0-9.]+\\s*kg"),
#     # remove "kg" and any spaces
#     average_weight = str_remove_all(average_weight, "kg"),
#     average_weight = str_trim(average_weight),
#     # convert to numeric
#     average_weight = as.numeric(average_weight)
#   ) %>%
#   select(-curb_weight) %>%
#   dplyr::mutate(fuel_type = "Battery electric") %>%
#   rename(brand = brand_name) %>%
#   mutate(product = "vehicles") %>%
#   mutate_at(c('year'), as.numeric) %>%
#   na.omit()
# 
# # COmbine the data together
# ultimate_specs_weights_fuel <- ultimate_specs_weights_fuel %>%
#   left_join(
#     ev_specifications %>%
#       select(brand, year, fuel_type, average_weight),
#     by = c("brand", "year", "fuel_type")
#   ) %>%
#   # Coalesce: use EV weight if present, otherwise ultimate specs
#   mutate(
#     average_weight = coalesce(average_weight.y, average_weight.x)
#   ) %>%
#   # Keep relevant columns
#   select(year, brand, fuel_type, average_weight, product)

# Extend the coverage of the data -----------------------------------------

# We make a version without fuel detail for joining to stock data without fuel detail

# Sample brands table
brands <- data.frame(
  brand = unique(ultimate_specs_weights$brand),
  product = "vehicles"
)

# Create years data frame (just the year column)
years <- data.frame(
  year = seq(
    min(ultimate_specs_weights_fuel$year, na.rm = TRUE),
    max(ultimate_specs_weights$year, na.rm = TRUE)
  )
)

# Cross the two
brand_year_grid <- crossing(brands, years)

## By fuel type ------------------------------------------------------------

# Unique brands & fuel types
brands <- data.frame(
  brand = unique(ultimate_specs_weights_fuel$brand),
  product = "vehicles"
)

fuel_types <- data.frame(
  fuel_type = unique(ultimate_specs_weights_fuel$fuel_type)
)

# Years
years <- data.frame(
  year = seq(
    min(ultimate_specs_weights_fuel$year, na.rm = TRUE),
    max(ultimate_specs_weights_fuel$year, na.rm = TRUE)
  )
)

# Cross brand x fuel_type x year
brand_fuel_year_grid <- crossing(brands, fuel_types, years)

# Extend backwards and forwards -------------------------------------------

all_weights <- brand_year_grid %>%
  left_join(ultimate_specs_weights, by = c("product", "brand", "year")) %>%
  select(-product) %>%
  group_by(brand) %>%
  arrange(year, .by_group = TRUE) %>%
  mutate(
    average_weight = if (sum(!is.na(average_weight)) >= 2) {
      # interpolate and extrapolate
      zoo::na.approx(average_weight, x = year, na.rm = FALSE, rule = 2)
    } else if (sum(!is.na(average_weight)) == 1) {
      # carry the single value forward and backward
      zoo::na.locf(zoo::na.locf(average_weight, na.rm = FALSE), fromLast = TRUE)
    } else {
      # nothing to fill from
      NA_real_
    }
  ) %>%
  ungroup() %>% 
  mutate(brand = str_replace_all(brand, "-", " "),
         brand = str_to_upper(brand)) %>% 
  rename(Make = brand, YearManufacture = year)

## By fuel type ------------------------------------------------------------

all_weights_fuel <- brand_fuel_year_grid %>%
  left_join(ultimate_specs_weights_fuel, by = c("product", "brand", "year", "fuel_type")) %>%
  select(-product) %>%
  group_by(brand, fuel_type) %>%
  arrange(year, .by_group = TRUE) %>%
  group_modify(~ {
    x <- .x$average_weight
    years <- .x$year
    n_non_na <- sum(!is.na(x))
    
    # Only interpolate if there are at least 2 non-NA values AND at least 2 distinct years
    if (n_non_na >= 2 & length(unique(years[!is.na(x)])) >= 2) {
      .x$average_weight <- zoo::na.approx(x, x = years, na.rm = FALSE, rule = 2)
    } else if (n_non_na == 1) {
      # Single value: carry it forward and backward
      .x$average_weight <- zoo::na.locf(zoo::na.locf(x, na.rm = FALSE), fromLast = TRUE)
    } else {
      # Not enough data: keep all NAs
      .x$average_weight <- rep(NA_real_, nrow(.x))
    }
    
    .x
  }) %>%
  ungroup() %>%
  mutate(
    brand = str_replace_all(brand, "-", " "),
    brand = str_to_upper(brand),
    fuel_type = na_if(fuel_type, "")
  ) %>%
  rename(Make = brand, YearManufacture = year) %>%
  unique() %>%
  na.omit()

# Join to the stock data --------------------------------------------------
# Only for the total - not broken down by fuel

# Read CSV - for licensed and SORNd by year of manufacture
VEH0124_AM <-
  fread("./raw_data/0124_AM.csv") %>%
  row_to_names(1)

# Read CSV - for licensed and SORNd by year of manufacture
VEH0124_NZ <-
  fread("./raw_data/0124_NZ.csv") %>%
  row_to_names(1)

# Create data to chart
VEH0124 <- rbindlist(
  list(
    VEH0124_AM,
    VEH0124_NZ),
  use.names = TRUE) %>%
  mutate(
    Make = as.character(Make),
    YearManufacture = as.integer(YearManufacture),
    YearFirstUsed = as.integer(YearFirstUsed)
  ) %>%
  mutate(YearManufacture = coalesce(YearManufacture, YearFirstUsed))

# Perform the join using Make and YearManufacture
stock_data <- VEH0124 %>%
  left_join(all_weights, by = c("Make", "YearManufacture")) %>%
  pivot_longer(-c(BodyType, 
                Make,
                GenModel,
                Model,
                YearFirstUsed,
                YearManufacture,
                LicenceStatus,
                average_weight),
             names_to = "DataYear",
             values_to = 'Value',
             values_transform = as.numeric) %>%
  na.omit(Value) %>%
  clean_names() %>%
  filter(body_type == "Cars") %>%
  mutate(weight_tonnes = (value * average_weight)/1000) %>%
  group_by(data_year, make) %>%
  dplyr::summarise(number = sum(value, na.rm = TRUE),
            weight_tonnes = sum(weight_tonnes, na.rm = TRUE))

stock_data_per_unit_weight <- stock_data %>%
  group_by(data_year) %>%
  dplyr::summarise(number = sum(number, na.rm = TRUE),
            weight_tonnes = sum(weight_tonnes, na.rm = TRUE)) %>%
  mutate(per_unit_weight = weight_tonnes/number)
  
# write_csv(stock_data, "./cleaned_data/stock_data_ultimate_specs.csv")

# Join to the POM data -------------------------------------------------

# Import GB data
df_VEH0160_GB <- read.csv("./raw_data/df_VEH0160_GB.csv") %>%
  clean_names() %>%
  pivot_longer(-c(body_type,
                  make,
                  gen_model,
                  model,
                  fuel),
               names_to = "period",
               values_to = 'value',
               values_transform = as.numeric) %>%
  mutate(period = gsub("x|q", "", period)) %>%
  mutate(year = substr(period, 1, 4)) %>%
  mutate(quarter = str_sub(period, -1)) %>%
  select(-period) %>%
  mutate(fuel = gsub(" \\(diesel\\)", "", fuel),
         fuel = gsub(" \\(petrol\\)", "", fuel)) %>%
  filter(body_type == "Cars") %>%
  # Sums registration in the year across quarters
  group_by(
           year,
           fuel) %>%
  dplyr::summarise(value = sum(value, na.rm = TRUE)) %>%
  rename(YearManufacture = year, Make = make) %>%
  filter(value != 0)

# Perform the join using Make and YearManufacture
pom_data_GB <- df_VEH0160_GB %>%
  mutate(
    Make = as.character(Make),
    YearManufacture = as.integer(YearManufacture)
  ) %>%
  left_join(all_weights, by = c("Make", "YearManufacture")) %>%
  na.omit(Value) %>%
  clean_names() %>%
  rename(year = year_manufacture) %>%
  mutate(weight_tonnes = (value * average_weight)/1000) %>%
  group_by(year, make) %>%
  dplyr::summarise(weight_tonnes = sum(weight_tonnes, na.rm = TRUE),
            number = sum(value, na.rm = TRUE))

# Get per unit weight derived based on make and year
pom_data_per_unit_weight_GB <- pom_data_GB %>%
  group_by(year) %>%
  dplyr::summarise(number = sum(number, na.rm = TRUE),
            weight_tonnes = sum(weight_tonnes, na.rm = TRUE)) %>%
  mutate(per_unit_weight = weight_tonnes/number)

# Plot the data
ggplot(pom_data_per_unit_weight_GB, aes(x = year, y = per_unit_weight)) +
  geom_line(size = 1.2) +
  geom_point(size = 2) +
  scale_color_manual(values = c("GB" = "#1f77b4", "UK" = "#ff7f0e")) +
  scale_linetype_manual(values = c("GB" = "solid", "UK" = "dashed")) +
  labs(
    title = "Average Weight of Vehicles Registered for the First Time",
    subtitle = "GB, source: DFT, Ultimate Specs",
    x = "Year",
    y = "Average Weight (metric tonnes per vehicle)",
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold"),
    legend.position = "top",
    panel.grid.minor = element_blank()
  ) +
  scale_y_continuous(limits = c(0, 2)) +
  scale_x_continuous(breaks = seq(min(2000), max(2025), 5),
                     expand = expansion(mult = c(0.1, 0.1)))

# Step 2: Perform the join using Make, YearManufacture and fuel
pom_data_GB_fuel <- df_VEH0160_GB %>%
  mutate(
    Make = as.character(Make),
    YearManufacture = as.integer(YearManufacture)
  ) %>%
  left_join(all_weights_fuel, by = c("Make", "YearManufacture", "fuel" = "fuel_type")) %>%
  clean_names() %>%
  na.omit(value) %>%
  rename(year = year_manufacture) %>%
  mutate(weight_tonnes = (value * average_weight)/1000) %>%
  group_by(year, make, fuel) %>%
  dplyr::summarise(weight_tonnes = sum(weight_tonnes, na.rm = TRUE),
                   number = sum(value, na.rm = TRUE)) %>%
  filter(number != 0)

# Get the per vehicle weights
pom_data_per_unit_weight_GB_fuel <- pom_data_GB_fuel %>%
  group_by(year, fuel) %>%
  summarise(
    number = sum(number, na.rm = TRUE),
    weight_tonnes = sum(weight_tonnes, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  mutate(per_unit_weight = weight_tonnes / number) %>%
  filter(!(fuel == "Battery electric" & year < 2008))

# Plot
ggplot(pom_data_per_unit_weight_GB_fuel, aes(x = year, y = per_unit_weight, color = fuel)) +
  geom_line(size = 1.2) +
  geom_point(size = 2) +
  labs(
    title = "Average Weight of Newly Registered Cars",
    subtitle = "GB, source: DFT, Ultimate Specs",
    x = "Year",
    y = "Average Weight (metric tonnes per vehicle)",
    color = "Fuel Type",
    linetype = "Fuel Type"
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold"),
    legend.position = "top",
    panel.grid.minor = element_blank()
  ) +
  scale_y_continuous(limits = c(0, 2.5)) +
  scale_x_continuous(
    # breaks = seq(min(pom_data_per_unit_weight_GB_fuel$year), max(pom_data_per_unit_weight_GB_fuel$year), 5),
    expand = expansion(mult = c(0.1, 0.1))
  )

# write.csv(pom_data_per_unit_weight_GB_fuel, "./cleaned_data/pom_data_per_unit_weight_GB_fuel.csv")

# Back-casting of per-unit weight -----------------------------------------------------------

## Functions ---------------------------------------------------------------

# Hybrid backcast for long series
do_backcast <- function(ts_obj, h = 10) {
  if(h <= 0) return(NULL)
  ts_obj %>%
    reverse_ts() %>%
    hybridModel(models = "aet", weights = "equal") %>%
    forecast(h = h) %>%
    reverse_forecast()
}

# Naive backcast for short series
do_naive_backcast <- function(df, target_start) {
  start_year <- min(df$year)
  h <- start_year - target_start
  if(h <= 0) return(NULL)
  
  # Extend first observed value backward
  value <- df$per_unit_weight[1]
  tibble(
    Year = seq(target_start, start_year - 1),
    Forecast = rep(value, h),
    Lo95 = rep(value * 0.95, h),
    Hi95 = rep(value * 1.05, h)
  )
}

do_naive_forecast <- function(df, target_end = 2040) {
  last_year <- max(df$year)
  h <- target_end - last_year
  if(h <= 0) return(NULL)
  
  value <- df$per_unit_weight[nrow(df)]
  tibble(
    Year = seq(last_year + 1, target_end),
    Forecast = rep(value, h),
    Lo95 = rep(value * 0.95, h),
    Hi95 = rep(value * 1.05, h)
  )
}

# Forecast df helper
as_forecast_df <- function(fc, fuel) {
  if(inherits(fc, "forecast")) {
    tibble(
      Index = time(fc$mean),
      Forecast = as.numeric(fc$mean),
      Lo95 = fc$lower[,"95%"],
      Hi95 = fc$upper[,"95%"],
      fuel = fuel
    )
  } else {
    tibble(
      Index = fc$Year,
      Forecast = fc$Forecast,
      Lo95 = fc$Lo95,
      Hi95 = fc$Hi95,
      fuel = fuel
    )
  }
}

# Make ts for hybridModel
make_ts <- function(df, k = 3) {
  smoothed <- zoo::rollmean(df$per_unit_weight, k = k, fill = NA, align = "right")
  smoothed[is.na(smoothed)] <- df$per_unit_weight[is.na(smoothed)]
  ts(smoothed, start = min(df$year), frequency = 1)
}

# Combine observed + backcast + forecast safely
combine_obs_backcast_forecast <- function(df, ts_obj, bc_fc, fuel) {
  combined <- combine_obs_backcast(df, ts_obj, bc_fc, fuel)
  
  # Naive forward forecast
  fc <- do_naive_forecast(df)
  if(!is.null(fc)) {
    fc_tibble <- tibble(
      Year = fc$Year,
      Value = fc$Forecast,
      Lo95  = fc$Lo95,
      Hi95  = fc$Hi95,
      Type  = "Forecast",
      fuel  = fuel
    )
    combined <- bind_rows(combined, fc_tibble)
  }
  
  combined
}

# Prepare data ------------------------------------------------------------

backcast_list <- split(
  pom_data_per_unit_weight_GB_fuel %>% select(fuel, year, per_unit_weight),
  f = pom_data_per_unit_weight_GB_fuel$fuel
)

ts_list <- lapply(backcast_list, make_ts)
target_start <- 1930


## Backcasts ---------------------------------------------------------------

bc_results <- imap(ts_list, function(ts_obj, fuel_name) {
  df <- backcast_list[[fuel_name]]
  start_year <- min(df$year)
  h <- start_year - target_start
  
  if(fuel_name %in% c("Battery electric","Diesel")) {
    do_naive_backcast(df, target_start)
  } else {
    do_backcast(ts_obj, h = h)
  }
})

## Combined backcast and observed -------------------------------------------

combined_df <- imap_dfr(bc_results, function(fc, fuel_name) {
  combine_obs_backcast(backcast_list[[fuel_name]], ts_list[[fuel_name]], fc, fuel_name)
})

bc_df <- imap_dfr(bc_results, as_forecast_df)

final_output <- imap_dfr(bc_results, function(fc, fuel_name) {
  combine_obs_backcast_forecast(backcast_list[[fuel_name]], ts_list[[fuel_name]], fc, fuel_name)
}) %>%
  select(Year, Value, Type, fuel)

write_csv(final_output, "./cleaned_data/final_output.csv")

## Plot --------------------------------------------------------------------

ggplot(final_output, aes(x = Year, y = Value, color = Type)) +
  geom_line(size = 1) +
  facet_wrap(~ fuel, scales = "free_y") +
  labs(
    title = "Observed + Backcast + Forecast per_unit_weight by Fuel",
    x = "Year", y = "per_unit_weight"
  ) +
  expand_limits(y = 0) +
  theme_minimal() +
  scale_color_manual(values = c(
    "Observed" = "black",
    "Backcast" = "blue",
    "Forecast" = "red"
  ))
# UK data -----------------------------------------------------------------

#read csv for uk pom data
df_VEH0160_UK <- read.csv("./raw_data/df_VEH0160_UK.csv") %>%
  clean_names() %>%
  pivot_longer(-c(body_type,
                  make,
                  gen_model,
                  model,
                  fuel),
               names_to = "period",
               values_to = 'value',
               values_transform = as.numeric) %>%
  mutate(period = gsub("x|q", "", period)) %>%
  mutate(year = substr(period, 1, 4)) %>%
  mutate(quarter = str_sub(period, -1)) %>%
  select(-period) %>%
  mutate(fuel = gsub(" \\(diesel\\)", "", fuel),
         fuel = gsub(" \\(petrol\\)", "", fuel)) %>%
  filter(body_type == "Cars") %>%
  # Sums registration in the year across quarters
  group_by(make,
           year) %>%
  dplyr::summarise(value = sum(value, na.rm = TRUE)) %>%
  rename(YearManufacture = year, Make = make) %>%
  filter(YearManufacture != 2014 )

# Step 2: Perform the join using Make and YearManufacture
pom_data_UK <- df_VEH0160_UK %>%
  mutate(
    Make = as.character(Make),
    YearManufacture = as.integer(YearManufacture)
  ) %>%
  left_join(all_weights, by = c("Make", "YearManufacture")) %>%
  na.omit(Value) %>%
  clean_names() %>%
  rename(year = year_manufacture) %>%
  mutate(weight_tonnes = (value * average_weight)/1000) %>%
  group_by(year, make) %>%
  dplyr::summarise(weight_tonnes = sum(weight_tonnes, na.rm = TRUE),
                   number = sum(value, na.rm = TRUE))

pom_data_per_unit_weight_UK <- pom_data_UK %>%
  group_by(year) %>%
  dplyr::summarise(number = sum(number, na.rm = TRUE),
                   weight_tonnes = sum(weight_tonnes, na.rm = TRUE)) %>%
  mutate(per_unit_weight = weight_tonnes/number)

# Combine GB and UK into one tidy df
plot_df <- bind_rows(
  pom_data_per_unit_weight_GB %>%
    mutate(region = "GB"),
  pom_data_per_unit_weight_UK %>%
    mutate(region = "UK")
) %>%
  mutate(year = as.integer(year))

ggplot(plot_df, aes(x = year, y = per_unit_weight, 
                    color = region, linetype = region)) +
  geom_line(size = 1.2) +
  geom_point(size = 2) +
  scale_color_manual(values = c("GB" = "#1f77b4", "UK" = "#ff7f0e")) +
  scale_linetype_manual(values = c("GB" = "solid", "UK" = "dashed")) +
  labs(
    title = "Average Weight of Newly Registered Cars",
    subtitle = "GB and UK, source: DFT, Ultimate Specs",
    x = "Year",
    y = "Average Weight (metric tonnes per vehicle)",
    color = "Region",
    linetype = "Region"
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold"),
    legend.position = "top",
    panel.grid.minor = element_blank()
  ) +
  scale_y_continuous(limits = c(0, 2)) +
  scale_x_continuous(breaks = seq(min(2000), max(2025), 5),
                     expand = expansion(mult = c(0.1, 0.1)))
