##### **********************
# Author: Oliver Lysaght
# Purpose:
# Inputs:
# Required annual updates:
# The URL to download from

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
  "pdftools",
  "data.table",
  "RSelenium",
  "netstat",
  "uktrade",
  "httr",
  "jsonlite",
  "mixdist",
  "janitor",
  "tabulizer"
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
source("functions.R",
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# Delete columns where all are NAs
not_all_na <- function(x) any(!is.na(x))

# *******************************************************************************
# Import data

# Import inflow data
POM <-
  read_xlsx("./cleaned_data/POM.xlsx")

# Import lifespan data - mean
lifespan_mean <-
  read_xlsx("./raw_data/Plastic Waste Generated Tool-2023.xlsm",
            sheet = "mean") %>%
  row_to_names(16) %>%
  clean_names() %>%
  filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
  select(where(not_all_na)) %>%
  select(-x1980) %>%
  pivot_longer(-c(plastic_key, description, sector),
               names_to = "year",
               values_to = "mean") %>%
  mutate(year = gsub("x", "", year))

# Import lifespan data - SD
lifespan_sd <-
  read_xlsx("./raw_data/Plastic Waste Generated Tool-2023.xlsm",
            sheet = "std dev") %>%
  row_to_names(16) %>%
  clean_names() %>%
  filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
  select(where(not_all_na)) %>%
  select(-x1980) %>%
  pivot_longer(-c(plastic_key, description, sector),
               names_to = "year",
               values_to = "sd") %>%
  mutate(year = gsub("x", "", year))

# Join the data
lifespan_data <- left_join(lifespan_mean, lifespan_sd) %>%
  mutate_at(c('mean', 'sd'), as.numeric) %>%
  group_by(sector, year) %>%
  summarise(mean = mean(mean),
            sd = mean(sd))

# Set up dataframe for outflow calculation based on Balde et al 2016. Create empty columns for all years in range of interest
year_first <- min(2031)
year_last <- max(2031) + 13
years <- c(year_first:year_last)
empty <-
  as.data.frame(matrix(NA, ncol = length(years), nrow = nrow(lifespan_data)))
colnames(empty) <- years

# Import lifespan data and filter to source and region of interest
lifespan_data <-
  read_excel("./raw_data/lifespan_parameters.xlsx") %>%
  select(1:3) %>%
  mutate_at(c('mean', 'sd'), as.numeric)

# Set up dataframe for outflow calculation based on Balde et al 2016. Create empty columns for all years in range of interest
year_first <- min(as.integer(inflow_weibull$year))
year_last <- max(as.integer(inflow_weibull$year)) + 30
years <- c(year_first:year_last)
empty <-
  as.data.frame(matrix(NA, ncol = length(years), nrow = nrow(inflow_weibull)))
colnames(empty) <- years

# Add the empty columns to inflow weibull dataframe and remove the empty 
inflow_weibull_outflow <- cbind(inflow_weibull, empty)
rm(empty)

# Calculate WEEE from inflow year based on shape and scale parameters
for (i in year_first:year_last) {
  inflow_weibull_outflow$WEEE_POM_dif <-
    i - (as.integer(inflow_weibull[, "year"]))
  wb <-
    dweibull(
      inflow_weibull_outflow[(inflow_weibull_outflow$WEEE_POM_dif >= 0), "WEEE_POM_dif"] + 0.5,
      shape = inflow_weibull_outflow[(inflow_weibull_outflow$WEEE_POM_dif >= 0), "shape"],
      scale = inflow_weibull_outflow[(inflow_weibull_outflow$WEEE_POM_dif >= 0), "scale"],
      log = FALSE
    )
  weee <-
    wb * inflow_weibull_outflow[(inflow_weibull_outflow$WEEE_POM_dif >= 0), "value"]
  inflow_weibull_outflow[(inflow_weibull_outflow$WEEE_POM_dif >= 0), as.character(i)] <-
    weee
}

# Make long format while including the year placed on market
inflow_weibull_long <- inflow_weibull_outflow %>% select(-c(shape,
                                                            scale,
                                                            value,
                                                            WEEE_POM_dif)) %>%
  rename(year_pom = year) %>%
  mutate(variable = gsub("inflow",
                         "outflow",
                         variable)) %>%
  pivot_longer(-c(unu_key,
                  year_pom,
                  unit,
                  variable),
               names_to = "year",
               values_to = "value") %>%
  na.omit()

# Make long format aggregating by year outflow (i.e. suppressing year POM)
inflow_weibull_long_outflow_summary <- inflow_weibull_outflow %>%
  select(-c(shape,
            scale,
            value,
            WEEE_POM_dif)) %>%
  rename(year_pom = year) %>%
  mutate(variable = gsub("inflow",
                         "outflow",
                         variable)) %>%
  pivot_longer(-c(unu_key,
                  year_pom,
                  unit,
                  variable),
               names_to = "year",
               values_to = "value") %>%
  na.omit() %>%
  group_by(unu_key,
           unit,
           variable,
           year) %>%
  summarise(value =
              sum(value))

# Bind the inflow and outflow data (with stock to be added next)
unu_inflow_outflow <-
  rbindlist(list(inflow_unu_mass_units,
                 inflow_weibull_long_outflow_summary),
            use.names = TRUE) %>%
  na.omit()

## STOCK CALCULATION - based on https://github.com/Statistics-Netherlands/ewaste/blob/master/scripts/05_Make_tblAnalysis.R

# Merge the two datasets covering inflows and outflow horizontally for the subsequent stock calculation
inflow_outflow_merge <-
  merge(
    inflow_unu_mass_units,
    inflow_weibull_long_outflow_summary,
    by = c("unu_key", "year", "unit"),
    all.x = TRUE
  ) %>%
  select(-c("variable.x",
            "variable.y")) %>%
  rename(inflow = 4,
         outflow = 5)

# Calculate the stock (historic POM - historic WEEE) in weight and units by calculating the cumulative sums and then subtracting from each other

# Calculate cumulative sums per group
tbl_stock <- data.table(inflow_outflow_merge)
tbl_stock[, inflow_cumsum := cumsum(inflow), by = list(unu_key, unit)]
tbl_stock[, outflow_cumsum := cumsum(outflow), by = list(unu_key, unit)]

# Calculate stock by year subtracting cumulative outflows from cumulative inflows
tbl_stock$stock <-
  tbl_stock$inflow_cumsum - tbl_stock$outflow_cumsum
# Convert into dataframe
tbl_stock <- as.data.frame(tbl_stock)

# Remove negative stock values by incorporating the negative stock value into WEEE (occurring because of the apparent consumption approach)
selection <- which (tbl_stock$stock < 0)
if (length(selection) > 0) {
  tbl_stock[selection, "outflow"] <-
    tbl_stock[selection, "outflow"] - tbl_stock[selection, "stock"]
  tbl_stock[selection, "stock"] <- 0
}

# Select columns of interest for merge
unu_stock <- tbl_stock %>%
  select(c("unu_key",
           "year",
           "unit",
           "stock"))

# Merge inflow, stock and outflow, pivot longer
unu_inflow_stock_outflow <-
  merge(
    inflow_outflow_merge,
    unu_stock,
    by = c("unu_key", "year", "unit"),
    all.x = TRUE
  ) %>%
  pivot_longer(-c(unu_key,
                  year,
                  unit),
               names_to = "variable",
               values_to = "value")