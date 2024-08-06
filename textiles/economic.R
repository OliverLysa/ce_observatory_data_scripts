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
              "janitor")

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

# Import all data
econ_textiles <-
  # Import the file
  read_excel("./raw_data/count, employment, employees and turnover of UK textiles industry.xlsx", 
             sheet = "Analysis 1") %>%
  # Take row 12 as table headers removing the lines before
  row_to_names(row_number = 12) %>%
  # clean column names to make easier to work with
  clean_names() %>%
  # rename columns
  rename(region = 1,
         activity = 2) %>%
  # Fill first column so region is apparent across all lines
  fill(region, .direction = "down") %>%
  # Pivot longer - key operation for tidy data
  pivot_longer(-c(region,activity),
               names_to = "variable",
               values_to = "value") %>%
  # Conditional if statement to use the variable column notation to define year
  mutate(year=ifelse(grepl("_2", variable), "2022",
         ifelse(grepl("_3", variable), "2023", "2021"))) %>%
  # Remove unwanted characters in variable column 
  mutate(variable = str_remove(variable, '[_]\\w+|:')) %>%
  # Filter unwanted character in value column
  filter(value != "..C") %>%
  # Remove anything before colon in the region column
  mutate(region = gsub(".*:","",region)) %>%
  # Trim and white space in the region column
  mutate_at(c('region'), trimws) %>%
  # Remove the rows with nas in them 
  na.omit() %>%
  mutate(variable=ifelse(grepl("count", variable), "Count (number)",
                     ifelse(grepl("employment", variable), "Count (number)",
                            ifelse(grepl("turnover", variable), "Turnover (GBP)",
                                   ifelse(grepl("employees", variable), "Employees (number)","2021")))))

write_xlsx(econ_textiles,
          "./cleaned_data/econ_textiles.xlsx")

DBI::dbWriteTable(con,
                  "econ_textiles_test",
                  econ_textiles,
                  overwrite = TRUE)

  

