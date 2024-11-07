##### **********************
# Author: Oliver Lysaght
# Purpose:Calculate post-collection treatment routes 

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
# Transfer coefficients describe the fractions of a process’s output that flow to different destinations.

# Import data
waste_generated <- read_csv(
          "stock_outflow.csv") %>%
  filter(variable == "outflow") %>%
  select(-variable) %>%
  mutate(source = "POM",
         target = "WG")

#######################
## Collection stage

# Collection
collection_shares <- read_csv(
  "collection_routes.csv")

# Calculate collection routes using transfer coefficient
collection <- 
  left_join(waste_generated, collection_shares) %>%
  mutate(collected = value * share) %>%
  select(-c(source, target, value, share))

# Calculate litter as a residual
litter <- collection %>%
  group_by(year) %>% 
  summarise(total = sum(collected)) %>%
  ungroup() %>%
  left_join(waste_generated) %>%
  mutate(litter = value-total) %>%
  select(-c(source, target, value, total)) %>%
  mutate(target = "litter") %>%
  rename(value = litter)

collection_stage <- collection %>%
  rename(value = collected,
         target = route) %>%
  bind_rows(litter) %>%
  mutate(source = "WG")

#######################
## Initial treatment
initial_treatment <- collection_stage %>%
  filter(target != "litter") %>%
  select(-source)

# TCs
tc_treatment_initial <- read_csv(
  "tc_treatment_initial.csv")

# Calculate collection routes using transfer coefficients
treatment_initial <- 
  left_join(initial_treatment, tc_treatment_initial) %>%
  rename(source = target,
         target = route) %>%
  mutate(value = value * share) %>%
  select(-c(share))

#######################
## Formal domestic treatment
## Initial treatment
formal_domestic_treatment <- treatment_initial %>%
  filter(target == "formal_domestic_treatment") %>%
  select(-source) %>%
  rename(source = target)

# TCs
tc_formal_domestic_treatment <- read_csv(
  "tc_formal_domestic_treatment.csv")

# Calculate collection routes using transfer coefficients
treatment_formal_domestic <- 
  left_join(formal_domestic_treatment, tc_formal_domestic_treatment) %>%
  rename(target = route) %>%
  mutate(value = value * share) %>%
  select(-share)

# Construct final sankey by binding all tables together
sankey_all <-
  rbindlist(
    list(
      waste_generated,
      collection_stage,
      treatment_initial,
      treatment_formal_domestic),
    use.names = TRUE)

write_csv(sankey_all,
          "sankey_all.csv")      


