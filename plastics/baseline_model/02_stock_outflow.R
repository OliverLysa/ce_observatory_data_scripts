##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate waste generated and stocks from inflow and lifespan data

# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "readODS",
  "tidyverse",
  "data.table",
  "janitor",
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
# Import data

## Import the WG data modelled in excel using a sales-lifetime approach and split by polymer and region
WG <- 
  read_excel("./plastics/baseline_model/stock_outflow_excel_model.xlsx") %>%
  select(-c(1:6)) %>%
  row_to_names(4) %>%
  slice(-c(32:33)) %>%
  mutate(variable = "WG") %>%
  mutate_at(c('2012'), as.numeric) %>%
  pivot_longer(-variable, 
               names_to = "year",
               values_to = "value") %>%
  group_by(variable, year) %>%
  summarise(value = sum(value, na.rm = TRUE)) %>%
  mutate_at(c('year'), as.numeric)

# Left join total tonnages and composition (assumed to be the same as POM)
WG_packaging_composition <-
  left_join(WG, BOM, by = "year") %>%
  mutate(tonnes = value * percentage) %>%
  select(year, category, type, material, tonnes) %>%
  group_by(year,material) %>%
  summarise(value = sum(tonnes)) %>%
  filter(year <= 2023)

# Import the outturn POM data
# POM_outturn <- read_xlsx("./cleaned_data/plastic_projection_detailed.xlsx") %>%
#   filter(variable == "Placed on market", type == "Outturn")

# # Import lifespan data - mean
# lifespan_mean <-
#   read_xlsx("./raw_data/Plastic Waste Generated Tool-2023.xlsm", sheet = "mean") %>%
#   row_to_names(16) %>%
#   clean_names() %>%
#   filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
#   select(where(not_all_na)) %>%
#   mutate_at(c('x1980'), as.numeric) %>%
#   pivot_longer(-c(plastic_key, description, sector),
#                names_to = "year",
#                values_to = "mean") %>%
#   mutate(year = gsub("x", "", year))
# 
# # Import lifespan data - SD
# lifespan_sd <-
#   read_xlsx("./raw_data/Plastic Waste Generated Tool-2023.xlsm", sheet = "std dev") %>%
#   row_to_names(16) %>%
#   clean_names() %>%
#   filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
#   select(where(not_all_na)) %>%
#   mutate_at(c('x1980'), as.character) %>%
#   pivot_longer(-c(plastic_key, description, sector),
#                names_to = "year",
#                values_to = "sd") %>%
#   mutate(year = gsub("x", "", year))
# 
# # Join the data
# lifespan_data <- left_join(lifespan_mean, lifespan_sd) %>%
#   mutate_at(c('mean', 'sd', 'year'), as.numeric) %>%
#   dplyr::group_by(sector, year) %>%
#   dplyr::summarise(mean = mean(mean), sd = mean(sd)) %>%
#   dplyr::filter(!year < 2000) %>%
#   ungroup()
# 
# # Join inflow and lifespan data
# lifespan_data <- left_join(POM_all, lifespan_data) %>%
#   arrange(year) %>%
#   fill(c(5:7), .direction = 'down')
# 
# # Set up dataframe for outflow calculation
# year_first <- min(as.integer(lifespan_data$year))
# year_last <- max(as.integer(lifespan_data$year))
# years <- c(unlist(year_first:year_last))
# empty <-
#   as.data.frame(matrix(NA, ncol = length(years), nrow = nrow(lifespan_data)))
# colnames(empty) <- years
# 
# # Add the empty columns to inflow weibull dataframe and remove the empty
# inflow_outflow <- cbind(lifespan_data, empty)
# rm(empty)
# 
# # Calculate wast generated based on gaussian distribution
# for (i in year_first:year_last) {
#   inflow_outflow$POM_dif <-
#     i - (as.integer(inflow_outflow[, "year"]))
#   wb <-
#     dnorm(inflow_outflow[(inflow_outflow$POM_dif >= 0), "POM_dif"]  + 0.5,
#           mean = inflow_outflow[(inflow_outflow$POM_dif >= 0), "mean"],
#           sd = inflow_outflow[(inflow_outflow$POM_dif >= 0), "sd"],
#           log = FALSE)
#   wg <-
#     wb * inflow_outflow[(inflow_outflow$POM_dif >= 0), "value"]
#   inflow_outflow[(inflow_outflow$POM_dif >= 0), as.character(i)] <-
#     wg
# }
# 
# # Make long format aggregating by year outflow
# outflow <- inflow_outflow %>%
#   select(-c(type, mean, sd, POM_dif)) %>%
#   pivot_longer(-c(sector, material, value, year),
#                names_to = "year_outflow",
#                values_to = "value_outflow") %>%
#   na.omit()

# Left join on population data
# EOL_packaging_composition_geo_breakdown <-
#   left_join(EOL_packaging_composition, population_outturn, by = "year") %>%
#   mutate(tonnes = tonnes * percentage) %>%
#   mutate(material = str_to_upper(material)) %>%
#   select(year, category, type, material, country, tonnes)
