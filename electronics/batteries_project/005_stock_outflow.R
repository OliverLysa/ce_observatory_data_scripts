# Author: Oliver Lysaght
# Purpose:Calculate outflows - EEE moving on from use, storage and hoarding and EEE stocks
# Output: Summarised table of EEE POM, EEE WG, EEE Stocks

# https://www.researchgate.net/publication/344153717_Characterizing_the_Urban_Mine-Simulation-Based_Optimization_of_Sampling_Approaches_for_Built-in_Batteries_in_WEEE
# https://ewastemonitor.info/wp-content/uploads/2021/11/First_Dutch_Waste_Battery_Monitor_online_version.pdf
# https://rpra.ca/wp-content/uploads/Final-UNITAR-report-Batteries-weight-conversion-factors.pdf

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
# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Import lifespan data

# Extract lifespan data from the following source https://circabc.europa.eu/ui/group/636f928d-2669-41d3-83db-093e90ca93a2/library/8e36f907-0973-4bb3-8949-f2bf3efeb125/details
# Apply different lifespans depending on the makeup of apparent consumption - new vs. second hand. https://unstats.un.org/unsd/environment/FDES/EGES6/Session%202_8Tanzania_E-waste%20statistics.pdf
# Differences in lifespans between new and second-hand products

# Extract first half of table
unitar_lifespan_pg1 <-
  extract_tables('./electronics/batteries_project/raw_data_inputs/WEEE Calculation Tool__Manual_2023.pdf', pages = 22) %>%
  as.data.frame()

# Clip to data of interest, separate columns
unitar_lifespan_pg1 <- unitar_lifespan_pg1[c(6:46), c(1:3)] %>%
  separate(2, c("shape_NLFB", "scale_NLFB"), " ") %>%
  separate(4, c("shape_IT", "scale_IT"), " ")

# Extract 2nd half of table
unitar_lifespan_pg2 <-
  extract_tables('./electronics/batteries_project/raw_data_inputs/WEEE Calculation Tool__Manual_2023.pdf', pages = 23) %>%
  as.data.frame()

# Bind/append tables to create a complete dataset
unitar_lifespan <- rbindlist(list(unitar_lifespan_pg1,
                                  unitar_lifespan_pg2),
                             use.names = FALSE) %>%
  rename(unu_key = 1)

# Separate data by country
unitar_lifespan_IT <- unitar_lifespan[c(1:54), c(1, 4, 5)] %>%
  mutate(source = "unitar",
         country = "IT") %>%
  rename(unu_key = 1,
         shape = 2,
         scale = 3)

# Separate data by country
unitar_lifespan_NLFB <- unitar_lifespan[c(1:54), c(1:3)] %>%
  mutate(source = "unitar",
         country = "NLFB") %>%
  rename(unu_key = 1,
         shape = 2,
         scale = 3)

# Bind/append tables to create a complete dataset
unitar_lifespan <- rbindlist(list(unitar_lifespan_IT,
                                  unitar_lifespan_NLFB),
                             use.names = TRUE)

# Write summary file
write_csv(unitar_lifespan,
           "./electronics/batteries_project/cleaned_data/weibull_parameters.csv")

# Import lifespan data and filter to source and region of interest
lifespan_data <-
  read_csv("./electronics/batteries_project/cleaned_data/weibull_parameters.csv") %>%
  filter(country == "NLFB") %>%
  select(1:3) %>%
  mutate_at(c('shape', 'scale'), as.numeric)

# *******************************************************************************
# Import inflow data

# Import inflow data to match to lifespan
inflow_unu_mass_units <-
  read_csv("./electronics/batteries_project/cleaned_data/inflow_unu_mass.csv") %>%
  rename(unu_key = unu)

# Manually backcasted values
inflow_unu_mass_units <-
  read_csv("./electronics/batteries_project/cleaned_data/inflow_unu_mass_wide_manual.csv") %>%
  pivot_longer(-c(year,
                unit,
                variable),
               names_to = "unu_key",
               values_to = "value")

inflow_unu_mass_units$unu_key <- str_pad(inflow_unu_mass_units$unu_key, 4, pad = "0")

# Merge preferred inflow measure and lifespan data by unu_key
inflow_weibull <-
  merge(inflow_unu_mass_units,
        lifespan_data,
        by = c("unu_key"),
        all.x = TRUE) 

# *******************************************************************************
## Calculate outflows

# Set up dataframe for outflow calculation based on Balde et al 2016. Create empty columns for all years in range of interest
year_first <- min(as.integer(inflow_weibull$year))
year_last <- max(as.integer(inflow_weibull$year))
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
inflow_weibull_long_outflow_summary <- inflow_weibull_long %>%
  group_by(unu_key, year,
           unit,
           variable) %>%
  summarise(value =
              sum(value))

# Bind the inflow and outflow data (with stock to be added next)
unu_inflow_outflow <-
  rbindlist(list(inflow_unu_mass_units,
                 inflow_weibull_long_outflow_summary),
            use.names = TRUE) %>%
  na.omit()

unu_inflow_outflow$unu_key <- 
  str_pad(unu_inflow_outflow$unu_key, 4, pad = "0")

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
unu_inflow_stock_outflow_total <-
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
               values_to = "value") %>%
  filter(variable != "stock") %>%
  group_by(year, variable) %>%
  summarise(value = sum(value, na.rm = TRUE))

ggplot(unu_inflow_stock_outflow_total, aes(x = year, y = value, group = variable)) +
  # facet_wrap(vars(unu_key), nrow = 6, scales = "free") +
  xlim(2000, 2040) + 
  theme_light() +
  geom_line(aes(color=variable), size= 1) +
  theme(legend.position="bottom") +
  expand_limits(y = 0)

# Write summary file
write_csv(unu_inflow_stock_outflow_total,
           "./electronics/batteries_project/cleaned_data/unu_inflow_stock_outflow_total.csv")

# Merge inflow, stock and outflow, pivot longer
unu_inflow_stock_outflow_unu <-
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

ggplot(unu_inflow_stock_outflow_unu, aes(x = year, y = value, group = variable)) +
  facet_wrap(vars(unu_key), nrow = 6, scales = "free") +
  xlim(2000, 2040) + 
  theme_light() +
  geom_line(aes(color=variable), size= 1) +
  theme(legend.position="bottom")

# Write summary file
write_csv(unu_inflow_stock_outflow_unu,
          "./electronics/batteries_project/cleaned_data/unu_inflow_stock_outflow_unu.csv")
