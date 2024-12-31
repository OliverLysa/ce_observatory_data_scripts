# Author: Oliver Lysaght
# Purpose: Produce apparent consumption estimates from trade and domestic production data

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
  "zoo",
  "fable"
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

# Function to reverse time when making ts forecasts
reverse_ts <- function(y)
{
  ts(rev(y), start=tsp(y)[1L], frequency=frequency(y))
}

# Function to reverse a forecast
reverse_forecast <- function(object)
{
  h <- length(object[["mean"]])
  f <- frequency(object[["mean"]])
  object[["x"]] <- reverse_ts(object[["x"]])
  object[["mean"]] <- ts(rev(object[["mean"]]),
                         end=tsp(object[["x"]])[1L]-1/f, frequency=f)
  object[["lower"]] <- object[["lower"]][h:1L,]
  object[["upper"]] <- object[["upper"]][h:1L,]
  return(object)
}


# *******************************************************************************
# EA WEEE POM data - EPR Register Data - use to sense-check the results
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
  geom_bar(position="stack", stat="identity")

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
# Outlier detection and replacement
# *******************************************************************************
#

# Import data, converts to wide format (Redo this, but at the level of individual components of apparent consumption)
inflow_wide_outlier_replaced_NA <-
  complete_inflows_long %>%
  filter(indicator == "apparent_consumption") %>%
  select(-c(indicator)) %>%
  ungroup() %>%
  group_by(unu_key) %>%
  # Flag median absolute deviation and Hampel Filter algorithm (median +_ 2 median absolute deviations)
  mutate(median = median(value, na.rm = TRUE),
         mad = mad(value, na.rm = TRUE),
         value = ifelse(value > median + 2 * mad | 
                                value < median - 2 * mad, NA, value)) %>%
  select(-c(median, mad)) %>%  
  pivot_wider(names_from = unu_key, 
                 values_from = value)

# Replace outliers (now NAs) by column/UNU across whole dataframe using straight-line interpolation
inflow_outlier_replaced_interpolated <-
  na.approx(inflow_wide_outlier_replaced_NA,
            rule = 2,
            maxgap = Inf,
            na.rm = FALSE) %>%
  as.data.frame() %>%
  pivot_longer(-c(year),
               names_to = "unu_key",
               values_to = "value")

write_csv(inflow_outlier_replaced_interpolated,
          "./electronics/batteries_project/cleaned_data/inflow_indicators_interpolated.csv")

# *******************************************************************************
# Backcasts
# *******************************************************************************

# https://stats.stackexchange.com/questions/567144/hierarchical-time-series-forecasting-optimal-reconciliation-using-fable-in-r
# https://fable.tidyverts.org/
# https://otexts.com/fpp3/hts.html

backcast_ts_tibble <- inflow_outlier_replaced_interpolated %>%
  as_tsibble(key = c(unu_key),
             index = year)

#### Backcasting - filter to variable of interest
backcast <- inflow_unu_mass_units %>%
  group_by(year) %>%
  summarise(value = sum(value, na.rm = TRUE)) %>%
  select(2) 

# Make a TS object
backcast <- 
  ts(backcast,frequency=1,start=c(2000,1))

# Backcast the values using auto arima
backcast %>%
  reverse_ts() %>%
  auto.arima() %>%
  forecast(h = 20) %>%
  reverse_forecast() -> bc_arim

autoplot(bc_arim) +
  ggtitle(paste("Backcasts from",bc_arim[["method"]]))

# Backcast the values using moving average
backcast %>%
  reverse_ts() %>%
  ma(order=1) %>%
  forecast(h = 20) %>%
  reverse_forecast() -> bc_ma

autoplot(bc_ma) +
  ggtitle(paste("Backcasts from",bc_ma[["method"]]))

# Backcast the values using neural network
backcast %>%
  reverse_ts() %>%
  nnetar() %>%
  forecast(h = 20) %>%
  reverse_forecast() -> bc_neural

autoplot(bc_neural) +
  ggtitle(paste("Backcasts from",bc_neural[["method"]]))

# Backcast the values using holt
backcast %>%
  reverse_ts() %>%
  holt(h = 30, damped = TRUE, phi = 0.97) %>%
  forecast(h = 30) %>%
  reverse_forecast() -> bc_holt

autoplot(bc_holt) +
  ggtitle(paste("Backcasts from",bc_holt[["method"]]))

backcast_holt <- 
  print(bc_holt) %>%
  as.data.frame()

# *******************************************************************************
# Forecasts
# *******************************************************************************
#

# We produce a time-series forecast of apparent consumption using a hierarchical time-series approach is used in forecast construction, with bottom up aggregation across UNU-keys

backcast %>%
  holt() %>%
  forecast(h = 30) -> fc_ma

autoplot(fc_ma) +
  ggtitle(paste("Backcasts from",fc_ma[["method"]]))

# Print the predictions
output_lin <- 
  print(fc_ma)

