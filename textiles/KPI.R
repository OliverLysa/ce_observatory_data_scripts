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


## KPIs

# Import the KPIs for the texiles
textiles_KPI <- read_xlsx(
  "./raw_data/KPI_Datatable_DOsite v02.xlsx") %>%
  clean_names() %>%
  filter(product == "Textiles") %>%
  rename(uk_reuse = uk_reuse_resold)

# Import clothing KPIs
clothing_KPI <- read_excel(
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
  # Right join to compositional data
  right_join(textiles_percentage, by = c("product")) %>%
  # Convert value to numeric
  mutate_at(c('Value'), as.numeric) %>%
  # Multiply material composition (breakdown of total product) by inflows
  mutate(value = Value*proportion) %>%
  # Remove unwanted columns
  select(-c(Value, proportion)) %>%
  # Remove any 0 flows
  filter(year == 2022,
         scenario == "BAU") %>%
  filter(target %in% c("Consumption",
                       "UK reuse",
                       "Used exports",
                       "Incineration",
                       "Landfill",
                       "Recycled")) %>%
  group_by(target, year, product, material) %>%
  summarise(value = sum(value)) %>%
  pivot_wider(names_from = target, 
              values_from = value) %>%
  rename(apparent_consumption = Consumption,
         uk_reuse = `UK reuse`,
         used_exports = `Used exports`,
         incinerated = Incineration,
         landfilled = Landfill,
         recycled = Recycled)

# Combined table         
combined_kpi <- textiles_KPI %>%
  bind_rows(clothing_KPI) %>%
  mutate(region = "UK")

DBI::dbWriteTable(con,
                  "textiles_KPIs",
                  combined_kpi,
                  overwrite = TRUE)
