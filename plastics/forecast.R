require(readxl)
require(plyr)
require(dplyr)
require(tidyverse)
require(magrittr)
require(knitr)
require(ggplot2)
require(forecast)

# Set options
options(warn = -1,
        scipen = 999,
        timeout = 1000)

# Import the POM data
pom_data_indicators <- read_xlsx( 
           "./cleaned_data/packaging_pom_indicators.xlsx") %>%
  filter(material == "plastic",
         variable == "Selling",
         year != "2024") %>%
  select(1,7) %>%
  mutate(variable = "Placed on market",
         type = "Outturn") %>%
  rename(value = 2) %>%
  mutate_at(c('year','value'), as.numeric)

# Calculate ratio to population 
# Import the baseline data
download.file(
  "https://www.ons.gov.uk/generator?format=xls&uri=/peoplepopulationandcommunity/populationandmigration/populationestimates/timeseries/ukpop/pop",
  "./raw_data/population_outturn.xls"
)

population_outturn <- 
  read_excel("./raw_data/population_outturn.xls", sheet = 1) %>%
  select(1,2) %>%
  row_to_names(7) %>%
  rename(year = 1,
         population = 2) %>%
  mutate_at(c('year'), as.numeric)

population_ratio <-
  dplyr::left_join(# Join the correspondence codes and the trade data
    pom_data_indicators,
    population_outturn,
    by =join_by("year")) %>%
  na.omit() %>%
  mutate_at(c('value','population'), as.numeric) %>%
  mutate(pom_per_capita = value/population) %>%
  select(pom_per_capita)

## Convert ratio into ts object
ratio_ts <- 
  ts(population_ratio,frequency=1,start=c(2014,1))

# Linear model
ratio_ts_mod <- 
  tslm(ratio_ts ~ trend)

linforecast <- 
  forecast(ratio_ts_mod, h=28)

output_lin <- 
  print(linforecast) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "linear model, time-series components")

checkresiduals(linforecast)

# Product Holt ES
ratio_holt <- 
  holt(ratio_ts, h=28)

output_holt <- 
  print(ratio_holt) %>%
  mutate(year = seq(2023, 2050, length = 28)) %>%
  mutate(forecast_type = "Holt linear trend method")

# SES
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
  mutate(id = row_number()) %>%
  filter(id %in% c(5, 25)) %>%
  select(3:50) %>%
  row_to_names(1) %>%
  mutate(variable = "Placed on market",
         .before = "2021") %>%
  pivot_longer(-variable,
               names_to = "year",
               values_to = "value") %>%
  mutate_at(c('year','value'), as.numeric) %>%
  mutate(value = value * 1000) 

# Produce linear projection
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

# Produce holt-based projection
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

# Produce SES-based projection
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

# ## Multivariate Model (GDP & Pop)
# rmc2 <- read_excel("rmc.xlsx", sheet = 2) 
# rmcts2 <- ts(rmc2,frequency=1,start=c(1998,1))
# mvm <- tslm(RMC ~ Population + GDP, data = rmcts2)
# summary(mvm)
# accuracy(mvm)

# Bind production-side material flows
project_all <- rbindlist(
  list(lin_project,
                         holt_project,
                         ses_project),
                         use.names = TRUE) %>%
  bind_rows(pom_data_indicators)

# Emissions

# Import emissions factor
ghg_emissions <- 
  read_excel("./raw_data/ghg-conversion-factors-2024_full_set__for_advanced_users_.xlsx",
             sheet = "Material use",
             range = "B70:G80") %>%
  slice(-1) %>%
  rename(material = 1) %>%
  filter(material == "Plastics: average plastics")

# Produce production emissions
production_emissions <- 
  project_all %>%
  mutate(emissions = 3164.7804900000001) %>%
  mutate(value = (value * emissions)/1000) %>%
  mutate(variable = "Production emissions (T CO2e)",
         .before = year) %>%
  select(-emissions)

# Add waste variable
projection_combined <- project_all %>%
  mutate(variable = "Waste generated") %>%
  bind_rows(project_all) %>%
  bind_rows(production_emissions)

# Create KPI table omitting low and high
projection_kpi <- projection_combined %>%
  filter(! `Level` %in% c("Low","High"))

# GDP analysis

# Import projection and tidy
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

# Emissions

# Import emissions factor
ghg_emissions <- 
  read_excel("./raw_data/ghg-conversion-factors-2024_full_set__for_advanced_users_.xlsx",
             sheet = "Material use",
             range = "B70:G80") %>%
  slice(-1) %>%
  dplyr::rename(material = 1) %>%
  filter(material == "Plastics: average plastics")

# Produce production emissions
production_emissions_gdp <- 
  project_all_gdp %>%
  mutate(emissions = 3164.7804900000001) %>%
  mutate(value = (value * emissions)/1000) %>%
  mutate(variable = "Production emissions (T CO2e)",
         .before = year) %>%
  select(-emissions)

# Add waste variable
projection_combined_gdp <- project_all_gdp %>%
  mutate(variable = "Waste generated") %>%
  bind_rows(project_all_gdp) %>%
  bind_rows(production_emissions_gdp)

# Create KPI table omitting low and high
projection_kpi_gdp <- projection_combined_gdp %>%
  filter(! `Level` %in% c("Low","High"))

projection_all_variables <- projection_combined %>%
  bind_rows(projection_combined_gdp) %>%
  filter(! year > 2042) %>%
  filter(! (year == 2023 & type == "Outturn"))

# Create KPI table omitting low and high
projection_kpi_all <- projection_kpi %>%
  bind_rows(projection_kpi_gdp) %>%
  filter(! year > 2042) %>%
  filter(! (year == 2023 & type == "Outturn"))

# Write table
DBI::dbWriteTable(con,
                  "plastic_projection",
                  projection_all_variables,
                  overwrite = TRUE)

# Write table
DBI::dbWriteTable(con,
                  "plastic_projection_kpi",
                  projection_kpi_all,
                  overwrite = TRUE)




