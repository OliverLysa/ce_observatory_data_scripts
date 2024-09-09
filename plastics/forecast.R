require(readxl)
require(plyr)
require(dplyr)
require(tidyverse)
require(magrittr)
require(knitr)
require(ggplot2)
require(forecast)

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

#Product Holt ES
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

project_all <- rbindlist(
  list(lin_project,
                         holt_project,
                         ses_project),
                         use.names = TRUE) %>%
  bind_rows(pom_data_indicators)

# Add waste variable
projection_waste <- project_all %>%
  mutate(variable = "Waste generated") %>%
  bind_rows(project_all)

projection_kpi <- projection_waste %>%
  filter(! `Level` %in% c("Low","High"))

DBI::dbWriteTable(con,
                  "plastic_projection",
                  projection_waste,
                  overwrite = TRUE)

DBI::dbWriteTable(con,
                  "plastic_projection_kpi",
                  projection_kpi,
                  overwrite = TRUE)



## Multivariate Model (GDP & Pop)

rmc2 <- read_excel("rmc.xlsx", sheet = 2) 
rmcts2 <- ts(rmc2,frequency=1,start=c(1998,1))
mvm <- tslm(RMC ~ Population + GDP, data = rmcts2)
summary(mvm)
accuracy(mvm)
