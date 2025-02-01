# Author: Oliver Lysaght
# Purpose: Produce apparent consumption estimates from trade and domestic production data

# How to handle different length time-series
# How to handle negative apparent consumption

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
  "scales",
  "zoo"
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

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# EA WEEE POM data - EPR Register Data
# *******************************************************************************
#

download.file(
  "https://assets.publishing.service.gov.uk/media/660bc0c1e8c4421717220332/Electrical_and_electronic_equipment_placed_on_the_UK_market.ods",
  "./raw_data/EEE_on_the_market.ods"
)

# Extract and list all sheet names
POM_sheet_names <- list_ods_sheets(
  "./raw_data/EEE_on_the_market.ods")

# Map sheet names to imported file by adding a column "sheetname" with its name
POM_data <- purrr::map_df(POM_sheet_names,
                          ~ dplyr::mutate(
                            read_ods("./raw_data/EEE_on_the_market.ods",
                                     sheet = .x),
                            sheetname = .x
                          )) %>%
  rename(Var.1 = 1,
         Var.5 = 5) %>%
  # filter out NAs in column 1
  filter(1 != "NA") %>%
  # Add column called quarters
  mutate(quarters = case_when(str_detect(Var.1, "Period covered") ~ Var.1), .before = Var.1) %>%
  # Fill column
  tidyr::fill(1) %>%
  filter(grepl('January - December', quarters)) %>%
  # make numeric and filter out anything but 1-14 in column 1
  mutate_at(c('Var.1'), as.numeric) %>%
  filter(between(Var.1, 1, 14)) %>%
  select(-c(`Var.1`,
            quarters,
            ...5)) %>%
  rename(
    product = 1,
    household = 2,
    non_household = 3,
    year = 4
  ) %>%
  mutate(year = gsub("\\_.*", "", year)) %>%
  pivot_longer(-c(product,
                  year),
               names_to = "end_use",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric)

ggplot(POM_data, aes(fill=product, y=value, x=year)) + 
  geom_bar(position="stack", stat="identity") +
  facet_wrap(vars(end_use), nrow = 2)

# *******************************************************************************
# Apparent consumption calculation
# *******************************************************************************
#

# Import prodcom UNU data if not in global environment
summary_prodcom_UNU <-
  read_csv("./electronics/batteries_project/cleaned_data/Prodcom_data_UNU.csv") %>%
  as.data.frame() %>%
  mutate(flow_desc = "domestic production") %>%
  clean_names()

# Import trade UNU data if not in global environment
summary_trade_UNU <-
  read_csv("./electronics/batteries_project/cleaned_data/comtrade_matched.csv")  %>%
  as.data.frame() %>%
  clean_names() %>%
  rename(year = ref_year,
         value = qty)

# Bind/append prodcom and trade datasets to create a total inflow dataset
complete_inflows <- rbindlist(list(summary_trade_UNU,
                                   summary_prodcom_UNU),
                              use.names = TRUE)

# Pivot wide to create aggregate indicators
# based on https://www.resourcepanel.org/global-material-flows-database
complete_inflows_wide <- pivot_wider(complete_inflows,
                                     names_from = flow_desc,
                                     values_from = value) %>%
  clean_names()

# Turn domestic production NA values into a 0
complete_inflows_wide["domestic_production"][is.na(complete_inflows_wide["domestic_production"])] <-
  0

# Calculate key aggregates in wide format and then pivot longer
complete_inflows_long <- complete_inflows_wide %>%
  mutate(
    # equivalent of domestic material consumption at national level
    apparent_consumption = domestic_production + import - export) %>%
  pivot_longer(-c(unu_key,
                  year),
               names_to = "indicator",
               values_to = 'value') %>%
  na.omit()

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
    ~ ifelse(abs(.) > median(.) - 5 * mad(., constant = 1), NA, .))

# Replace outliers (now NAs) by column/UNU across whole dataframe using straight-line interpolation
inflow_wide_outlier_replaced_interpolated <-
  na.approx(inflow_wide_outlier_replaced_NA,
            rule = 1,
            maxgap = 10) %>%
  as.data.frame() %>%
  mutate(year = c(2001:2022), .before = x0001) %>%
  pivot_longer(-year,
               names_to = "unu_key",
               values_to = "value") %>%
  mutate(`unu_key` = gsub("x", "", `unu_key`))

# Interpolate using cubic spline method instead
inflow_wide_outlier_replaced_spline <-
  na.spline(inflow_wide_outlier_replaced_NA) +
  0 * na.approx(inflow_wide_outlier_replaced_NA,
                na.rm = FALSE,
                rule = 2) %>%
  as.data.frame()

write_csv(inflow_wide_outlier_replaced_interpolated,
           "./electronics/batteries_project/cleaned_data/inflow_indicators_interpolated.csv")

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

# Account for outlier effects (abrupt changes in the time-series related to unexpected events)


# Import outturn and forecasted GDP data
GDP_outturn <-
  read_excel("raw_data/OBR_forecasts.xlsx", sheet = 2) %>%
  select(1,28) %>%
  na.omit() %>%
  rename(year = 1,
         value = 2) %>%
  mutate(year = substr(year,1,4))

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
