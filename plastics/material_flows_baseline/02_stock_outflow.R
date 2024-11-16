##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate WG and stock from inflow and lifespan

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
  "janitor",
  "methods"
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

# # Import functions
# source("functions.R",
#        local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# Delete columns where all are NAs
not_all_na <- function(x) any(!is.na(x))

# *******************************************************************************
# Import data

# Import the outturn POM data
POM_outturn <- read_xlsx(
  "plastic_projection_detailed.xlsx") %>%
  filter(variable == "Placed on market",
         type == "Outturn")

# Import one POM projection
POM_proj <- read_xlsx(
  "plastic_projection_detailed.xlsx") %>%
  filter(variable == "Placed on market",
         type == "Projection",
         exogenous_factor == "Population",
         forecast_type == "linear model, time-series components",
         level == "Mid")

# Bind these together
POM_all <- POM_outturn %>%
  bind_rows(POM_proj) %>%
  group_by(type, year, material) %>%
  summarise(value = sum(value)) %>%
  ungroup()

write_xlsx(POM_all, "POM_all.xlsx")

# Import lifespan data - mean
lifespan_mean <-
  read_xlsx("Plastic Waste Generated Tool-2023.xlsm",
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
  read_xlsx("Plastic Waste Generated Tool-2023.xlsm",
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
  dplyr::group_by(sector, year) %>%
  dplyr::summarise(mean = mean(mean),
            sd = mean(sd)) %>%
  dplyr::filter(! year < 2000) %>%
  ungroup()

# Join inflow and lifespan data
lifespan_data <- left_join(POM_all, lifespan_data) %>%
  arrange(year) %>%
  fill(c(5:7), .direction = 'down')
  
# Set up dataframe for outflow calculation
year_first <- min(as.integer(lifespan_data$year))
year_last <- max(as.integer(lifespan_data$year))
years <- c(unlist(year_first:year_last))
empty <-
  as.data.frame(matrix(NA, ncol = length(years), nrow = nrow(lifespan_data)))
colnames(empty) <- years

# Add the empty columns to inflow weibull dataframe and remove the empty 
inflow_outflow <- cbind(lifespan_data, empty)
rm(empty)

# Difficult to approximate lifespan using the weibull distribution

# May need to add more fine-grain intervals for the normal distribution
# Calculate WEEE from inflow year based on shape and scale parameters
for (i in year_first:year_last) {
  inflow_outflow$POM_dif <-
    i - (as.integer(inflow_outflow[, "year"]))
  wb <-
    pnorm(
      inflow_outflow[(inflow_outflow$POM_dif >= 0), "POM_dif"] + 1,
      mean = inflow_outflow[(inflow_outflow$POM_dif >= 0), "mean"],
      sd = inflow_outflow[(inflow_outflow$POM_dif >= 0), "sd"],
      log = FALSE
    )
  wg <-
    wb * inflow_outflow[(inflow_outflow$POM_dif >= 0), "value"]
  inflow_outflow[(inflow_outflow$POM_dif >= 0), as.character(i)] <-
    wg
}

# Make long format aggregating by year outflow (i.e. suppressing year POM)
outflow <- inflow_outflow %>%
  select(-c(type, 
            mean,
            sd, 
            POM_dif)) %>%
  pivot_longer(-c(sector, material, value, year),
               names_to = "year_outflow",
               values_to = "value_outflow") %>%
  na.omit() 

# Filter to match in the same year
outflow <- 
  outflow[outflow$year==outflow$year_outflow, ]

inflow_outflow_stock <- outflow %>%
  rename(POM = value,
         WG = value_outflow) %>%
  select(year,
         material,
         sector,
         POM,
         WG) %>%
  mutate(stock = 0) %>%
  pivot_longer(-c(year,
                  material,
                  sector),
               names_to = "variable",
               values_to = "value")

write_csv(inflow_outflow_stock,
           "inflow_outflow_stock.csv")

## STOCK CALCULATION

# # Calculate cumulative sums per group
# tbl_stock <- data.table(inflow_outflow)
# tbl_stock[, inflow_cumsum := cumsum(pom), by = list(sector)]
# tbl_stock[, outflow_cumsum := cumsum(outflow), by = list(sector)]
# 
# # Calculate stock by year subtracting cumulative outflows from cumulative inflows
# tbl_stock$stock <-
#   tbl_stock$inflow_cumsum - tbl_stock$outflow_cumsum
# # Convert into dataframe
# tbl_stock <- as.data.frame(tbl_stock)
# 
# # Select columns of interest for merge
# all_variables <- tbl_stock %>%
#   select(c("sector",
#            "year",
#            "pom",
#            "outflow",
#            "stock")) %>%
#   pivot_longer(-c(sector,
#                   year),
#                names_to = "variable",
#                values_to = "value")
# 
# write_csv(all_variables,
#            "stock_outflow.csv")
# 
# ggplot(data=all_variables, aes(x=year, y=value, color=variable)) +
#   geom_line()+
#   geom_point()
