##### **********************
# Author: Oliver Lysaght

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
  "data.table"
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
# EA WEEE POM data - EPR Register Data
# *******************************************************************************
#

# Code for latest publications in xlsx format

# Download EEE data file from URL at government website
download.file(
  "https://assets.publishing.service.gov.uk/media/65e1a5802f2b3b00117cd7f5/Electrical_and_electronic_equipment_placed_on_the_UK_market.xlsx",
  "./raw_data/EEE_on_the_market.xlsx"
)

# Extract all sheets into a list of dataframes
POM_sheets <- read_excel_allsheets(
  "./raw_data/EEE_on_the_market.xlsx")

# Bind rows to create one single dataframe, filter, rename, pivot and filter again
POM_data <-
  dplyr::bind_rows(POM_sheets) %>%
  rename(number = 1,
         number2 = 5,
         number3 = 7) %>%
  # Add column called quarters
  mutate(quarters = case_when(str_detect(number, "Period covered") ~ number), .before = number) %>%
  mutate(quarters2 = case_when(str_detect(number2, "Period covered") ~ number2), .before = number) %>%
  mutate(quarters3 = case_when(str_detect(number3, "Period covered") ~ number3), .before = number) %>%
  unite(period, c("quarters", "quarters2","quarters3"), na.rm = TRUE) 

# Convert blanks to NAs
POM_data$period[POM_data$period==""] <- NA

# Tidy dataset
POM_data <- POM_data %>%
  # Fill column
  tidyr::fill(1) %>%
  filter(grepl('January - December', period)) %>%
  select(1,3,4,5) %>%
  na.omit() %>%
  rename(
    year = 1,
    product = 2,
    household = 3,
    non_household = 4
  ) %>%
  mutate(year = substr(year, nchar(year)-4+1, nchar(year))) %>%
  filter(! grepl('Category', product)) %>%
  pivot_longer(-c(product,
                  year),
               names_to = "end_use",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  group_by(year, product, end_use) %>%
  summarise(value = sum(value))

# Write output to xlsx form
write_xlsx(POM_data,
           "./cleaned_data/electronics_placed_on_market.xlsx")

# Previous code for extracting data from earlier publications in ods format

# # Extract and list all sheet names
# POM_sheet_names <- list_ods_sheets(
#   "./raw_data/EEE_on_the_market.ods")
# 
# # Map sheet names to imported file by adding a column "sheetname" with its name
# POM_data <- purrr::map_df(POM_sheet_names,
#                           ~ dplyr::mutate(
#                             read_ods("./raw_data/EEE_on_the_market.ods",
#                                      sheet = .x),
#                             sheetname = .x
#                           )) %>%
#   # filter out NAs in column 1
#   filter(Var.1 != "NA") %>%
#   # Add column called quarters
#   mutate(quarters = case_when(str_detect(Var.1, "Period covered") ~ Var.1), .before = Var.1) %>%
#   # Fill column
#   tidyr::fill(1) %>%
#   filter(grepl('January - December', quarters)) %>%
#   # make numeric and filter out anything but 1-14 in column 1
#   mutate_at(c('Var.1'), as.numeric) %>%
#   filter(between(Var.1, 1, 14)) %>%
#   select(-c(`Var.1`,
#             Var.5,
#             quarters)) %>%
#   rename(
#     product = 1,
#     household = 2,
#     non_household = 3,
#     year = 4
#   ) %>%
#   mutate(year = gsub("\\_.*", "", year)) %>%
#   pivot_longer(-c(product,
#                   year),
#                names_to = "end_use",
#                values_to = "value") %>%
#   mutate_at(c('value'), as.numeric) %>%
#   group_by(year, product, end_use) %>%
#   summarise(value = sum(value))

# *******************************************************************************
# Apparent consumption calculation
# *******************************************************************************
#

# Import prodcom UNU data if not in global environment
Prodcom_data_UNU <-
  read_excel("./cleaned_data/Prodcom_data_UNU.xlsx")  %>%
  as.data.frame() %>%
  rename(unu = 1) %>%
  mutate(FlowTypeDescription = "domestic production") %>%
  clean_names()

# Import trade UNU data if not in global environment
Summary_trade_UNU <-
  read_excel("./cleaned_data/Summary_trade_UNU.xlsx")  %>%
  as.data.frame() %>%
  clean_names() %>%
  filter(variable == "Units") %>%
  select(-c(variable)) %>%
  rename(unu = 1)

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
    # equivalent of domestic material consumption at national level
    apparent_consumption = domestic_production + total_imports - total_exports,
    import_dependency = total_imports / apparent_consumption) %>%
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
  select(-year) # %>%
  # mutate_at(
  #   .vars = vars(contains("x")),
  #   .funs = ~ ifelse(abs(.) > median(.) + 5 * mad(., constant = 1), NA, .),
  #   ~ ifelse(abs(.) > median(.) - 5 * mad(., constant = 1), NA, .))

# Replace outliers (now NAs) by column/UNU across whole dataframe using straight-line interpolation
inflow_wide_outlier_replaced_interpolated <-
  na.approx(inflow_wide_outlier_replaced_NA,
            # as na.approx by itself only covers interpolation and not extrapolation (i.e. misses end values),
            # also performs extrapolation with rule parameter where end-values are missing through using constant (i.e. last known value)
            rule = 1,
            maxgap = 10) %>%
  as.data.frame() %>%
  mutate(year = c(2001:2022), .before = x0001) %>%
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

# augmented dickeyfuller unit root test, # plot autocorrelation function and partial acf to get correct order

# Produce forecast of sales - arima with economic variable externally (per capita GDP)
# Hierarchical time-series with bottom up aggregation approach to forecast

# https://stackoverflow.com/questions/67564279/looping-with-arima-in-r
# https://stackoverflow.com/questions/40195505/fitting-arima-model-to-multiple-time-series-and-storing-forecast-into-a-matrix

# Import outturn sales data (back to 2001 currently).
# 22 data point for annual time-step, 264 for monthly
inflow_wide_outlier_replaced_interpolated <-
  read_excel("inflow_wide_outlier_replaced_NA.xlsx", sheet = 1)

# Convert to time series format
apparent_consumption <- ts(inflow_wide_outlier_replaced_interpolated,
                           start = 2001,
                           frequency = 1)

# Import forecasted external data
external_forecasts_1 <-
  read_excel("gdp_forecast_1.xlsx", sheet = 2)

# Convert external forecasts to time series format
gdp_forecast_1 <- ts(external_forecasts_1$gdp_1,
                     start = 2022,
                     frequency = 1)

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
