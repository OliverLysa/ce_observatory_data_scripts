##### **********************
# Trade

# *******************************************************************************
# Require packages
#********************************************************************************

require(writexl)
require(dplyr)
require(tidyverse)
require(readODS)
require(janitor)
require(data.table)
require(xlsx)
require(readxl)
require(reticulate)

# Import and tidy
window_glass_trade <- read_csv("./raw_data/Windows_glass_Trade.csv") %>%
    unite(Description, Cn8, Description, sep = " - ") %>%
    select(1, 5:10) %>%
    mutate(NetMass = NetMass /1000) %>%
    mutate(across(is.numeric, round, digits=2)) %>%
    pivot_longer(-c(Description, Year, FlowType, Country),
                 names_to = "Variable",
                 values_to = "Value") 

# Write to database
DBI::dbWriteTable(con,
                  "window_glass_trade",
                  window_glass_trade,
                  overwrite = TRUE)  
