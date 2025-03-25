##### **********************
# Author: Oliver Lysaght
# Purpose: POM projection for plastics

# Packages ----------------------------------------------------------------

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

# Options and functions ---------------------------------------------------

# Set options
options(warn = -1,
        scipen = 999,
        timeout = 1000)

# Import total POM ----------------------------------------------------------------

pom_data_indicators <- read_ods( 
  "./raw_data/UK_Statistics_on_Waste_dataset_September_2024_accessible (1).ods",
  sheet = "Packaging") %>%
  row_to_names(6) %>%
  filter(Material == "Plastic") %>%
  select(1,3) %>%
  dplyr::rename(year = 1,
         value = 2) %>%
  mutate_at(c('year','value'), as.numeric) %>%
  mutate(value = value * 1000) %>%
  mutate(variable = "Placed on market",
         type = "Outturn")

# Material coefficients ---------------------------------------------------

# Wider
BOM_wider <- BOM %>%
  pivot_wider(names_from = year, values_from = percentage) %>%
  mutate(material1 = "Plastic")

# # Create table to extrapolate the BOM
years <- c(2024:2042)
empty <-
  as.data.frame(matrix(NA, ncol = length(years), nrow = 14))

colnames(empty) <- years

BOM_future <- empty %>%
  mutate(material1 = "Plastic")

BOM_combined <- left_join(BOM_wider, BOM_future) %>%
  pivot_longer(-c(category, type, material, material1),
               names_to = "year",
               values_to = "rate") %>%
  group_by(type, material, material1, year) %>%
  summarise(rate = sum(rate)) %>%
  group_by(type, material, material1) %>%
  mutate(rate = na.approx(
    rate,
    na.rm = FALSE,
    maxgap = Inf,
    rule = 2
  )) %>%
  mutate_at(c('year'), as.numeric)

# *******************************************************************************
# Population as exogenous variable

# Calculate ratio of POM to population 
# Import the baseline data
# download.file(
#   "https://www.ons.gov.uk/generator?format=xls&uri=/peoplepopulationandcommunity/populationandmigration/populationestimates/timeseries/ukpop/pop",
#   "./raw_data/population_outturn.xls"
# )

# Import outturn population data
population_outturn <- 
  read_excel("./raw_data/population_outturn.xls", sheet = 1) %>%
  select(1,2) %>%
  row_to_names(7) %>%
  dplyr::rename(year = 1,
         population = 2) %>%
  mutate_at(c('year'), as.numeric)

# Create a ratio of POM to population (outturn)
population_ratio <-
  dplyr::left_join(
    pom_data_indicators,
    population_outturn,
    by =join_by("year")) %>%
  na.omit() %>%
  mutate_at(c('value','population'), as.numeric) %>%
  mutate(pom_per_capita = value/population) %>%
  select(pom_per_capita)

# *******************************************************************************
# Linear model with time-series components

## Convert ratio into ts object
ratio_ts <- 
  ts(population_ratio,frequency=1,start=c(2014,1))

# Create a linear forecast model
ratio_ts_mod <- 
  tslm(ratio_ts ~ trend)

# Produce 28 predictions
linforecast <- 
  forecast(ratio_ts_mod, h=28)

# # Check residuals of model
# checkresiduals(linforecast)

# Print the predictions
output_lin <- 
  print(linforecast) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "linear model, time-series components")

# *******************************************************************************
# Holt exponential smoothing

# Product Holt ES
ratio_holt <- 
  holt(ratio_ts, h=28)

output_holt <- 
  print(ratio_holt) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "Holt linear trend method")

# *******************************************************************************
# Simple exponential smoothing

ratio_ses <- 
  ses(ratio_ts, h=28)

output_ses <- 
  print(ratio_ses) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "Simple exponential smoothing method")

# Download population projection 

# download.file(
#   "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/tablea11principalprojectionuksummary/2021basedinterim/ukpppsummary.xlsx",
#   "./raw_data/population_projections.xlsx"
# )

# Import projection and tidy
projection <- 
  read_excel("./raw_data/population_projections.xlsx",
             sheet = "PERSONS") %>%
  dplyr::mutate(id = row_number()) %>%
  filter(id %in% c(5, 25)) %>%
  select(3:50) %>%
  row_to_names(1) %>%
  dplyr::mutate(variable = "Placed on market",
         .before = "2021") %>%
  pivot_longer(-variable,
               names_to = "year",
               values_to = "value") %>%
  mutate_at(c('year','value'), as.numeric) %>%
  mutate(value = value * 1000) 

# Produce linear projection by multiplying the projected ratio by the exogenous variable
lin_project <- projection %>%
  left_join(output_lin, "year") %>%
  na.omit() %>%
  mutate(`Mid` = value * `Point Forecast`,
         `Low` = value * `Lo 95`,
         `High` = value * `Hi 95`) %>%
  select(1,2,9:12) %>%
  pivot_longer(-c(variable,year, forecast_type), 
               names_to = "Level") %>%
  mutate(type = "Projection") %>%
  mutate(method = "Ratio-based",
         Exogenous_factor = "Population")

# Produce holt-based projection by multiplying the projected ratio by the exogenous variable
holt_project <- projection %>%
  left_join(output_holt, "year") %>%
  na.omit() %>%
  mutate(`Mid` = value * `Point Forecast`,
         `Low` = value * `Lo 95`,
         `High` = value * `Hi 95`) %>%
  select(1,2,9:12) %>%
  pivot_longer(-c(variable,year, forecast_type), 
               names_to = "Level") %>%
  mutate(type = "Projection") %>%
  mutate(method = "Ratio-based",
         Exogenous_factor = "Population")

# Produce SES-based projection by multiplying the projected ratio by the exogenous variable
ses_project <- projection %>%
  left_join(output_ses, "year") %>%
  na.omit() %>%
  mutate(`Mid` = value * `Point Forecast`,
         `Low` = value * `Lo 95`,
         `High` = value * `Hi 95`) %>%
  select(1,2,9:12) %>%
  pivot_longer(-c(variable,year, forecast_type), 
               names_to = "Level") %>%
  mutate(type = "Projection") %>%
  mutate(method = "Ratio-based",
         Exogenous_factor = "Population")

# Bind the projections made using population as the exogenous variable
project_all <- rbindlist(
  list(lin_project,
                         holt_project,
                         ses_project),
                         use.names = TRUE) %>%
  bind_rows(pom_data_indicators)

# *******************************************************************************
# GDP as exogenous variable

# Import OECD projection and tidy
gdp <- 
  read_excel("./raw_data/OECD,DF_EO114_LTB,,filtered,2024-09-11 11-55-19.xlsx",
             sheet = "Table") %>%
  row_to_names(4) %>%
  clean_names() %>%
  dplyr::rename(variable = 1) %>%
  filter(variable == "(GDPV) Gross domestic product, volume, chain-linked index in local currency, national base year") %>%
  slice(1) %>%
  select(-2) 

names(gdp)[-1] = sub(".*?_", "", names(gdp)[-1])

gdp <- gdp %>%
  pivot_longer(-variable, 
               names_to = "year",
               values_to = "value") %>%
  mutate_at(c('year'), trimws) %>%
  mutate_at(c('year','value'), as.numeric)

# Construct a ratio of GDP to POM (outturn)
gdp_ratio <- 
  dplyr::left_join(# Join the correspondence codes and the trade data
    pom_data_indicators,
    gdp,
    by =join_by("year")) %>%
  na.omit() %>%
  mutate_at(c('value.y'), as.numeric) %>%
  mutate(pom_per_gdp = value.x/value.y) %>%
  select(pom_per_gdp)

## Convert ratio into ts object
ratio_ts_gdp <- 
  ts(gdp_ratio,frequency=1,start=c(2014,1))

# Linear model
ratio_ts_mod_gdp <- 
  tslm(ratio_ts_gdp ~ trend)

linforecast_gdp <- 
  forecast(ratio_ts_mod_gdp, h=28)

output_lin_gdp <- 
  print(linforecast_gdp) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "linear model, time-series components")

#Product Holt ES
ratio_holt_gdp <- 
  holt(ratio_ts_gdp, h=28)

output_holt_gdp <- 
  print(ratio_holt_gdp) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "Holt linear trend method")

# SES
ratio_ses_gdp <- 
  ses(ratio_ts_gdp, h=28)

output_ses_gdp <- 
  print(ratio_ses_gdp) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "Simple exponential smoothing method")

# Produce linear projection
lin_project_gdp <- gdp %>%
  left_join(output_lin_gdp, "year") %>%
  na.omit() %>%
  mutate(`Mid` = value * `Point Forecast`,
         `Low` = value * `Lo 95`,
         `High` = value * `Hi 95`) %>%
  select(1,2,9:12) %>%
  pivot_longer(-c(variable,year, forecast_type), 
               names_to = "Level") %>%
  mutate(type = "Projection") %>%
  mutate(method = "Ratio-based",
         Exogenous_factor = "GDP")

# Produce holt-based projection
holt_project_gdp <- gdp %>%
  left_join(output_holt_gdp, "year") %>%
  na.omit() %>%
  mutate(`Mid` = value * `Point Forecast`,
         `Low` = value * `Lo 95`,
         `High` = value * `Hi 95`) %>%
  select(1,2,9:12) %>%
  pivot_longer(-c(variable,year, forecast_type), 
               names_to = "Level") %>%
  mutate(type = "Projection") %>%
  mutate(method = "Ratio-based",
         Exogenous_factor = "GDP")

# Produce SES-based projection
ses_project_gdp <- gdp %>%
  left_join(output_ses_gdp, "year") %>%
  na.omit() %>%
  mutate(`Mid` = value * `Point Forecast`,
         `Low` = value * `Lo 95`,
         `High` = value * `Hi 95`) %>%
  select(1,2,9:12) %>%
  pivot_longer(-c(variable,year, forecast_type), 
               names_to = "Level") %>%
  mutate(type = "Projection") %>%
  mutate(method = "Ratio-based",
         Exogenous_factor = "GDP")

# Bind gdp-side material flows
project_all_gdp <- rbindlist(
  list(lin_project_gdp,
       holt_project_gdp,
       ses_project_gdp),
  use.names = TRUE) %>%
  mutate(variable = "Placed on market")

# Bind the tables together
projection_all_variables <- projection_combined %>%
  bind_rows(projection_combined_gdp) %>%
  filter(! year > 2042) %>%
  filter(! (year == 2023 & type == "Outturn")) %>%
  mutate(material = "Plastic") %>%
  rename(material1 = material)

# Convert projection into composition breakdown
projection_detailed_future <- projection_all_variables %>%
  filter(variable == "Placed on market") %>%
  left_join(BOM_combined, "year") %>%
  clean_names() %>%
  mutate(value = value * rate) %>%
  select(-c(type_x, rate, material1_y)) %>%
  rename(application = type_y,
         material1 = material1_x) %>%
  filter(forecast_type == "linear model, time-series components",
       exogenous_factor == "Population",
       level == "Mid") 

# Convert outturn into composition breakdown
projection_detailed_outturn <- 
  projection_all_variables %>%
  filter(variable == "Placed on market") %>%
  left_join(BOM_combined, "year") %>%
  clean_names() %>%
  mutate(value = value * rate) %>%
  select(-c(type_x, rate, material1_y)) %>%
  rename(application = type_y,
         material1 = material1_x) %>%
  filter(year <= 2022,
         year >= 2014) 

# Bind the two tables together to input to the vensim model        
projection_detailed_total <- projection_detailed_future %>%
  bind_rows(projection_detailed_outturn) %>%
  mutate(domestic_production = value * 0.5,
         net_imports = value * 0.5) %>%
  rename(total = value)

############## 

# Import baseline run from vensim to present as default on the site
vensim_baseline <- read_csv(
  "./raw_data/model_output.csv") %>%
  filter(variable %in% c("Total POM",
                         "littering",
                         "Mechanical recycling")) %>%
  mutate(material1 = "Plastic") %>%
  filter(level == "Central") %>%
  dplyr::rename(material_sub_type = material) %>%
  mutate(type = if_else(year < 2023, "Outturn", "Projection")) %>%
  mutate(level = if_else(year < 2023, NA, "Mid")) %>%
  mutate(forecast_type = if_else(year < 2023, NA, "linear model, time-series components")) %>%
  mutate(method = if_else(year < 2023, NA, "Ratio-based")) %>%
  mutate(exogenous_factor = if_else(year < 2023, NA, "Population")) %>%
  mutate(material_sub_type = gsub("pet", "PET", material_sub_type)) %>%
  mutate(material_sub_type = gsub("Pet", "PET", material_sub_type)) %>%
  mutate(variable = gsub("Total POM", "Placed on market", variable))

trial <- vensim_baseline %>%
  pivot_wider(names_from = level,
              values_from = value) %>%
  rename(Outturn = 10) %>%
  mutate(value = coalesce(Mid, Outturn)) %>%
  select(-c(10,11)) %>%
  replace(is.na(.), "NULL") %>%
  mutate(value = if_else(value < 0, 0, value)) %>%
  dplyr::rename(material = material_sub_type)

write.csv(trial, "plastic_scenario_detailed.csv")

DBI::dbWriteTable(con,
                  "plastic_scenario_detailed",
                  trial,
                  overwrite = TRUE)
