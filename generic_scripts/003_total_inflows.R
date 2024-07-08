##### **********************
# Author: Oliver Lysaght
# Required annual updates:

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
  "RSelenium",
  "netstat",
  "uktrade",
  "httr",
  "jsonlite",
  "mixdist",
  "janitor",
  "forecast",
  "lmtest",
  "zoo",
  "naniar"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Functions and options
# *******************************************************************************
# Import functions
source("./scripts/Functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Apparent consumption calculation
# *******************************************************************************
#

# Import prodcom UNU data if not in global environment
Prodcom_data_UNU <-
  read_excel("./cleaned_data/Prodcom_data_UNU.xlsx")  %>%
  as.data.frame() %>%
  rename(UNU = 1) %>%
  mutate(FlowTypeDescription = "domestic production") %>%
  clean_names() 

# Import trade UNU data if not in global environment
Summary_trade_UNU <-
  read_excel("./cleaned_data/Summary_trade_UNU.xlsx")  %>%
  as.data.frame() %>%
  filter(Variable == "Units") %>%
  select(-c(Variable)) %>%
  rename(UNU = 1) %>%
  clean_names()

# Bind/append prodcom and trade datasets to create a total inflow dataset
complete_inflows <- rbindlist(list(Summary_trade_UNU,
                                   Prodcom_data_UNU),
                              use.names = TRUE)

# Pivot wide to create aggregate indicators
# based on https://www.resourcepanel.org/global-material-flows-database
complete_inflows_wide <- pivot_wider(complete_inflows,
                                     names_from = flow_type_description,
                                     values_from = value) %>%
  clean_names()

# Turn domestic production NA values into a 0
complete_inflows_wide["domestic_production"][is.na(complete_inflows_wide["domestic_production"])] <-
  0

# Calculate key aggregates in wide format and then pivot longer
complete_inflows_long <- complete_inflows_wide %>%
  mutate(
    total_imports = eu_imports + non_eu_imports,
    total_exports = eu_exports + non_eu_exports,
    net_trade_balance = total_exports - total_imports,
    # equivalent of domestic material consumption at national level
    apparent_consumption = domestic_production + total_imports - total_exports,
    # production perspective - issue of duplication
    import_dependency = (total_imports / apparent_consumption)) %>%
  pivot_longer(-c(unu,
                  year),
               names_to = "indicator",
               values_to = 'value') %>%
  na.omit()

write_xlsx(complete_inflows_long,
           "./cleaned_data/inflow_indicators.xlsx")

# *******************************************************************************
# Automatic outlier detection and replacement
# *******************************************************************************
#

# Import data, converts to wide format (Redo this, but at the level of individual components of apparent consumption)
inflow_wide_outlier_replaced_NA <-
  read_xlsx("./cleaned_data/inflow_indicators.xlsx") %>%
  filter(indicator == "apparent_consumption") %>%
  select(-c(indicator)) %>%
  pivot_wider(names_from = unu,
              values_from = value) %>%
  clean_names() %>%
  mutate_at(c('year'), as.numeric) %>%
  arrange(year) %>%
  select(-year) %>%
  mutate_at(
    .vars = vars(contains("x")),
    .funs = ~ ifelse(abs(.) > median(.) + 5 * mad(., constant = 1), NA, .),
    ~ ifelse(abs(.) > median(.) - 5 * mad(., constant = 1), NA, .)
  )

# Replace outliers (now NAs) by column/UNU across whole dataframe using straight-line interpolation
inflow_wide_outlier_replaced_interpolated <-
  na.approx(inflow_wide_outlier_replaced_NA,
            # as na.approx by itself only covers interpolation and not extrapolation (i.e. misses end values),
            # also performs extrapolation with rule parameter where end-values are missing through using constant (i.e. last known value)
            rule = 2,
            maxgap = 10) %>%
  as.data.frame() %>%
  mutate(year = c(2001:2022), .before = x0101) %>%
  pivot_longer(-year, 
               names_to = "unu_key",
               values_to = "value") %>%
  mutate(`unu_key` = gsub("x", "", `unu_key`))

write_xlsx(inflow_wide_outlier_replaced_interpolated,
           "./cleaned_data/inflow_indicators_interpolated.xlsx")

# Interpolate using cubic spline method instead
inflow_wide_outlier_replaced_spline <-
  na.spline(inflow_wide_outlier_replaced_NA) +
  0 * na.approx(inflow_wide_outlier_replaced_NA,
                na.rm = FALSE,
                rule = 2) %>%
  as.data.frame()

# *******************************************************************************
# Forecasts (including lightly interpolated data from prior step)
# *******************************************************************************
#

# We produce a time-series forecast of apparent consumption using an ARIMA model with an external socio-economic variable (GDP per capita projections)
# A hierarchical time-series approach is used in forecast construction, with bottom up aggregation across UNU-keys

# Download OBR GDP data including short-term forecasts
download.file(
  "https://obr.uk/download/public-finances-databank-march-2024-2/?tmstv=1711722115",
  "raw_data/OBR_forecasts.xlsx")

# Import outturn and forecasted GDP data
GDP_outturn <-
  read_excel("raw_data/OBR_forecasts.xlsx", sheet = 2) %>%
  select(1,28) %>%
  na.omit()

# Convert external forecasts to time series format
gdp_forecast_1 <- ts(external_forecasts_1$gdp_1,
                     start = 2022,
                     frequency = 1)

# Import outturn apparent consumption data (back to 2008 currently across trade and prodcom).
# 22 data point for annual time-step, 264 for monthly
# Convert to time series format
apparent_consumption <- ts(inflow_wide_outlier_replaced_interpolated,
                           start = 2001,
                           frequency = 1)

# augmented dickeyfuller unit root test, # plot autocorrelation function and partial acf to get correct order
# https://stackoverflow.com/questions/67564279/looping-with-arima-in-r
# https://stackoverflow.com/questions/40195505/fitting-arima-model-to-multiple-time-series-and-storing-forecast-into-a-matrix

# Define arima model of consumption
arima_consumption <- auto.Arima(
  # define univariate timeseries
  apparent_consumption,
  allowdrift = F,
  xreg = gdp_forecast_1
)

# Generate forecast
forecast_com <-
  forecast(
    arima_consumption,
    h = 32,
    fan = F,
    level = 95,
    xreg = gdp_forecast_1
  )

# Create dataframe with forecasted data compiled
apparent_consumption_f <- data.frame(year_f,
                                     forecast_com$mean,
                                     forecast_com$lower[, 1],
                                     forecast_com$upper[, 1])
