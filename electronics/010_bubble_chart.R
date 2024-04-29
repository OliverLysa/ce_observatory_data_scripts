# *******************************************************************************
# Packages
# *******************************************************************************
# Package names
packages <- c("magrittr", 
              "writexl", 
              "readxl", 
              "dplyr", 
              "tidyverse", 
              "readODS", 
              "data.table", 
              "mixdist",
              "janitor",
              "logOfGamma")

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
source("./scripts/functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# *******************************************************************************
# Extract and match
# *******************************************************************************

# Read input data for lifespan and mass (two of three variables)
# This input is used in the earlier stock calculation also
inflow_weibull_chart <- read_xlsx( 
           "./cleaned_data/inflow_weibull.xlsx") %>%
  # Calculate mean and median from Weibull parameters
  mutate(average = scale*exp(gammaln(1+1/shape)),
         median = scale*(log(2))^(1/shape)) %>%
  filter(unit == "mass") %>%
  select(-c(shape,
            scale,
            variable,
            unit,
            median))

# Import data outflow fate (CE-score), pivot longer, filter, drop NA and rename column 'route' 
outflow_routing <- read_excel(
  "./cleaned_data/PDFs_datasets_CDJS.xlsx") %>%
  clean_names() %>%
  pivot_longer(-c(
    `unu_key`,
    `unu_description`,
    `variable`
  ),
  names_to = "route", 
  values_to = "value") %>%
  filter(variable == "Percentage",
         route != "total") %>%
  drop_na(value) %>%
  mutate(year = 2017) %>%
  select(-c(variable, unu_description)) %>%
  mutate(route = gsub("general_bin", "disposal", route),
         route = gsub("recycling", "recycling", route),
         route = gsub("sold", "resale", route),
         route = gsub("donation_or_re_use", "resale", route),
         route = gsub("other", "refurbish", route),
         route = gsub("take_back_scheme", "remanufacture", route),
         route = gsub("unknown", "maintenance", route))

# Multiply percentages by ordinal score
outflow_routing_weights <- read_excel(
  "./intermediate_data/weights.xlsx")

# Scoring logic based on the EMF CE-model 

# Reused: 10 
# Recycling: 6
# Downcycling: -6 
# Export: -6 
# Landfill: -8 
# Lost: -8 
# Leakage: -10 
# Incineration: -10 
# Buried: -10

# Merge outflow routing with outflow routing weights
outflow_routing_weighted <- merge(outflow_routing,
                                    outflow_routing_weights,
                                    by.x=c("route"),
                                    by.y=c("route")) %>%
  mutate(route_score = value*score) %>%
  group_by(`unu_key`, year) %>%
  summarise(ce_score = sum(route_score))

# Rescale the score between 0-100% - only works if not using negative values
# %>%
#  # =(suboptimal-actual)/(suboptimal-optimal)
#  mutate(scaled = (0-score)/(0-5)*100) %>%
#  mutate(across(c('scaled'), round, 1)) %>%
#  select(-c(score))

# Merge all three variables together
unu_inflow_weibull_outflow_chart <- 
  left_join(
            inflow_weibull_chart,
            outflow_routing_weighted,
            by = c("unu_key", "year")) %>%
  tidyr::fill(ce_score)

# Import user-friendly names for codes
UNU_colloquial <- read_xlsx( 
  "./classifications/classifications/UNU_colloquial.xlsx")

# Merge data with UNU colloquial for user-friendly names and rename and reformat
unu_inflow_weibull_outflow_chart <- merge(
  unu_inflow_weibull_outflow_chart,
  UNU_colloquial,
  by = c("unu_key")) %>%
  rename(apparent_consumption = 3,
         mean_lifespan = 4) %>%
  select(-c(unu_key)) %>%
  mutate(across(c('apparent_consumption', 'mean_lifespan', 'ce_score'), round, 2)) %>%
  rename(product = unu_description)

# Turn NA values into a 0
unu_inflow_weibull_outflow_chart["ce_score"][is.na(unu_inflow_weibull_outflow_chart["ce_score"])] <- 0

# Write file   
write_csv(unu_inflow_weibull_outflow_chart,
  "./cleaned_data/electronics_chart_bubble.csv")

# Convert into material
# Read Bom data
BoM_percentage_UNU <- read_xlsx(
  "./intermediate_data/BoM_percentage_UNU.xlsx")

# Right join the BoM proportion and mass collected per year
electronics_bubble_material <- right_join(BoM_percentage_UNU, unu_inflow_weibull_outflow_chart,
                                                by = c("product")) %>%
  mutate(mass = freq*apparent_consumption) %>%
  select("product", 
         "material",
         "year",
         "mass",
         "mean_lifespan",
         "ce_score") %>%
  mutate(
    material = gsub("Flatpanelglass", 'Flat panel glass', material),
    material = gsub("Metals other", 'Metals (other)', material),
    material = gsub("Other metals", 'Metals (other)', material),
    material = gsub("Liionbattery", 'Li-ion battery', material),
    material = gsub("Electronics incl PCB", 'Electronics incl. PCB', material)) %>%
  mutate(across(c('mass'), round, 1)) %>%
  rename(apparent_consumption = mass)

# Write stacked area chart data
write_csv(electronics_bubble_material, 
          "./cleaned_data/electronics_chart_bubble_material.csv")  
