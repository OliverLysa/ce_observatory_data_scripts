##### **********************
# Author: Oliver Lysaght

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
              "DBI",
              "RPostgres")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Import functions, options and connections
# *******************************************************************************
# Import functions
source("functions.R", 
       local = knitr::knit_global())

# Stop scientific notation of numeric values
options(scipen = 999)

# Connect to supabase
con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'db.qcgyyjjmwydekbxsjjbx.supabase.co',
                 port = 5432,
                 user = 'postgres',
                 password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Classification matching
# *******************************************************************************
#

# Import UNU CN8 correspondence correspondence table
WOT_UNU_CN8 <-
  read_csv("./classifications/concordance_tables/wot2.0/cn-to-pcc-to-unu-mappings-in-WOT.csv") %>%
  mutate(SIC2 = substr(PCC, 1, 2),
         SIC4 = substr(PCC, 1, 4))

# Write file locally
write_xlsx(WOT_UNU_CN8, 
           "./classifications/concordance_tables/WOT_UNU_CN8_PCC_SIC.xlsx")

# Write file to database
DBI::dbWriteTable(con, "WOT_UNU_CN8", WOT_UNU_CN8)