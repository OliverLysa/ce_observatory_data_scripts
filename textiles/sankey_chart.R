##### **********************
# Purpose: Converts cleaned data into sankey format for presenting in sankey chart

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
              "janitor")

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
# Proportional data
# *******************************************************************************

# Read proportion data
# This approach assumes that proportions are the same across all years/value chain stages
textiles_percentage <- read_xlsx(
  "./intermediate_data/textiles_composition.xlsx") %>%
  mutate_at(c('proportion'), as.numeric)

# *******************************************************************************
# Import Joel data
textiles_sankey_links <- read_excel(
  "./raw_data/textiles/Outputs_ForDistribution_v2.xlsx",
  sheet = "Flows") %>%
  # rename columns
  rename(source = Origin,
         target = Destination,
         value = Value_kt) %>%
  # clean all names
  clean_names() %>%
  # multiply value by 1000 to convert to tonnes (shorthand built into javascript)
  mutate(Value = value * 1000) %>%
  # mutate to add product column
  mutate(product = "Clothing") %>%
  # Rename
  mutate(across(everything(), ~ replace(., . == "Non-UK reuse", "Reused non-UK"))) %>%
  mutate(across(everything(), ~ replace(., . == "Non-UK disposals", "Disposed non-UK"))) %>%
  mutate(across(everything(), ~ replace(., . == "Reused UK", "UK reuse"))) %>%
  # Right join to compositional data
  right_join(textiles_percentage, by = c("product")) %>%
  # Convert value to numeric
  mutate_at(c('Value'), as.numeric) %>%
  # Multiply material composition (breakdown of total product) by inflows
  mutate(value = Value*proportion) %>%
  # Remove unwanted columns
  select(-c(Value, proportion)) %>%
  # Remove any 0 flows
  filter(value != 0,
         year == 2022,
         scenario == "BAU") %>%
  # Round
  mutate(across(c('value'), round, 2)) %>%
  mutate(region = "UK") %>%
  select(-scenario)

# Import textiles data
latest_textiles <- read_csv(
  "./raw_data/textiles_combined (5).csv") %>%
  mutate(year = 2022,
         product = "Textiles") %>%
  mutate(material = str_to_sentence(material)) %>%
  mutate(region = "UK") %>%
  mutate(source = gsub("_", " ", source),
         target = gsub("_", " ", target))

# Bind the tables together
textiles_combined <-
  rbindlist(
    list(
      textiles_sankey_links,
      latest_textiles
    ),
    use.names = TRUE
  ) %>%
  rename(source = 1,
         target = 2,
         value = 3,
         year = 4,
         product = 5,
         material = 6,
         region = 7) %>%
  mutate_at(c('year'), as.numeric) %>%
  arrange(desc(product))

DBI::dbWriteTable(con,
                  "textiles_sankey_links",
                  textiles_combined,
                  overwrite = TRUE)


  
