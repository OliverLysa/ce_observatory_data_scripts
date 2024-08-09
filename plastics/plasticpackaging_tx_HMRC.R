##### **********************
# Author: Matt and Oliver
# Data update frequency: Quarterly

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
              "RPostgres",
              "RSelenium",
              "netstat",
              "uktrade",
              "httr",
              "jsonlite",
              "mixdist",
              "janitor",
              "future",
              "furrr",
              "rjson",
              "comtradr")

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

# *******************************************************************************
# Data download
# *******************************************************************************
#

download.file(
  "https://assets.publishing.service.gov.uk/media/64d4b18f5cac650014c2dd2a/PPT_statistics_ODS.xlsx",
  "./raw_data/HMRC_tax_revenue.xlsx"
)

PPT_statistics <-
  # Read in file
  read_excel("./raw_data/HMRC_tax_revenue.xlsx",
             sheet = "Table 1 & 2")%>%
  # Remove nas
  na.omit() %>%
  # Make row 1 the column names
  row_to_names(1) %>%
  # Clean those column names
  clean_names() %>%
  # Remove row with string detected in column
  filter(! str_detect(table_1, 'Table 2')) %>%
  pivot_longer(-c(table_1),
               names_to = 'variable') %>%
  mutate(frequency = ifelse(grepl("2022 to 2023", table_1),'annual','quarterly')) %>%
  mutate(unit = case_when(str_detect(variable, "revenue") ~ "Monetary",
                          str_detect(variable, "tonnage") ~ "Tonnes",
                          str_detect(variable, "number") ~ "Number")) %>%
  filter(! str_detect(value, '[x]'))

# connecting to database
con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres',
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 5432,
                 user = 'postgres.qowfjhidbxhtdgvknybu',
                 password = rstudioapi::askForPassword("Database password"))

# Export to database
DBI::dbWriteTable(con, "pptxeffects",
                  PPT_statistics,
                  overwrite = TRUE)

write.csv(PPT_statistics, "pptxeffects.csv")
