require(readxl)
require(plyr)
require(dplyr)
require(tidyverse)
require(magrittr)
require(knitr)
require(ggplot2)
require(forecast)

# Import the data
pom_data_indicators <- read_xlsx( 
           "./cleaned_data/packaging_pom_indicators.xlsx") %>%
  filter(material == "plastic",
         variable == "Selling",
         year != "2024") %>%
  select(1,7)

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
         population = 2)

population_ratio <-
  dplyr::left_join(# Join the correspondence codes and the trade data
    pom_data_indicators,
    population_outturn,
    by =join_by("year")) %>%
  na.omit() %>%
  mutate_at(c('POM','population'), as.numeric) %>%
  mutate(pom_per_capita = POM/population) %>%
  select(4)

ratio_ts <- 
  ts(population_ratio,frequency=1,start=c(2014,1))

ratio_ts_mod <- 
  tslm(ratio_ts ~ trend)

linforecast <- 
  forecast(ratio_ts_mod, h=28)

autoplot(linforecast) +
  ggtitle("POM") +
  ylab("tonnes")

output_lin <- 
  print(linforecast) %>%
  mutate(year = seq(2023, 2050, length = 28))

checkresiduals(linforecast)

download.file(
  "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/tablea11principalprojectionuksummary/2021basedinterim/ukpppsummary.xlsx",
  "./raw_data/population_projections.xlsx"
)

projection <- 
  read_excel("./raw_data/population_projections.xlsx",
             sheet = "PERSONS") %>%
  mutate(id = row_number()) %>%
  filter(id %in% c(5, 25)) %>%
  select(3:50) %>%
  row_to_names(1) %>%
  mutate(variable = "projection",
         .before = "2021") %>%
  pivot_longer(-variable,
               names_to = "year",
               values_to = "value") %>%
  mutate_at(c('year','value'), as.numeric) %>%
  mutate(value = value * 1000) %>%
  left_join(output_lin, "year") %>%
  na.omit() %>%
  mutate(mid = value * `Point Forecast`,
         low = value * `Lo 95`,
         high = value * `Hi 95`) %>%
  select(2,9:11)

## Multivariate Model (GDP & Pop)

rmc2 <- read_excel("rmc.xlsx", sheet = 2) 
rmcts2 <- ts(rmc2,frequency=1,start=c(1998,1))
mvm <- tslm(RMC ~ Population + GDP, data = rmcts2)
summary(mvm)
accuracy(mvm)

