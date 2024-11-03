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

POM <- read_xlsx(
  "./cleaned_data/plastic_projection_detailed.xlsx")

# Import lifespan data - mean
lifespan_mean <-
  read_xlsx("./raw_data/Plastic Waste Generated Tool-2023.xlsm",
            sheet = "mean") %>%
  row_to_names(16) %>%
  clean_names() %>%
  filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
  select(where(not_all_na)) %>%
  mutate_at(c('x1980'), as.numeric) %>%
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
  mutate_at(c('x1980'), as.character) %>%
  pivot_longer(-c(plastic_key, description, sector),
               names_to = "year",
               values_to = "sd") %>%
  mutate(year = gsub("x", "", year))

# Join the data
lifespan_data <- left_join(lifespan_mean, lifespan_sd) %>%
  mutate_at(c('mean','sd','year'), as.numeric) %>%
  group_by(sector, year) %>%
  summarise(shape = mean(mean),
            scale = mean(sd)) %>%
  dplyr::filter(! year < 2000) %>%
  mutate(value = 2000000, .before = shape) %>%
  ungroup()

# Set up dataframe for outflow calculation
year_first <- min(as.integer(lifespan_data$year))
year_last <- max(as.integer(lifespan_data$year)) + 12
years <- c(unlist(year_first:year_last))
empty <-
  as.data.frame(matrix(NA, ncol = length(years), nrow = nrow(lifespan_data)))
colnames(empty) <- years

# Add the empty columns to inflow weibull dataframe and remove the empty 
inflow_outflow <- cbind(lifespan_data, empty)
rm(empty)

# Calculate WEEE from inflow year based on shape and scale parameters
for (i in year_first:year_last) {
  inflow_outflow$POM_dif <-
    i - (as.integer(inflow_outflow[, "year"]))
  wb <-
    dweibull(
      inflow_outflow[(inflow_outflow$POM_dif >= 0), "POM_dif"] + 0.5,
      shape = inflow_outflow[(inflow_outflow$POM_dif >= 0), "shape"],
      scale = inflow_outflow[(inflow_outflow$POM_dif >= 0), "scale"],
      log = FALSE
    )
  weee <-
    wb * inflow_outflow[(inflow_outflow$POM_dif >= 0), "value"]
  inflow_outflow[(inflow_outflow$POM_dif >= 0), as.character(i)] <-
    weee
}

# Make long format aggregating by year outflow (i.e. suppressing year POM)
outflow <- inflow_outflow %>%
  select(-c(shape,
            scale, 
            POM_dif,
            value,
            year)) %>%
  pivot_longer(-c(sector),
               names_to = "year",
               values_to = "value_outflow") %>%
  na.omit() %>%
  group_by(sector, year) %>%
  summarise(outflow = sum(value_outflow)) %>%
  mutate_at(c('year'), as.numeric)

inflow <- inflow_outflow %>%
  select(1:3) %>%
  rename(pom = value)

inflow_outflow <- full_join(inflow, outflow)

## STOCK CALCULATION

# Calculate cumulative sums per group
tbl_stock <- data.table(inflow_outflow)
tbl_stock[, inflow_cumsum := cumsum(pom), by = list(sector)]
tbl_stock[, outflow_cumsum := cumsum(outflow), by = list(sector)]

# Calculate stock by year subtracting cumulative outflows from cumulative inflows
tbl_stock$stock <-
  tbl_stock$inflow_cumsum - tbl_stock$outflow_cumsum
# Convert into dataframe
tbl_stock <- as.data.frame(tbl_stock)

# Select columns of interest for merge
all_variables <- tbl_stock %>%
  select(c("sector",
           "year",
           "pom",
           "outflow",
           "stock")) %>%
  pivot_longer(-c(sector,
                  year),
               names_to = "variable",
               values_to = "value")
