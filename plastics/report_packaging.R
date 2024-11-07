# Report packaging data

# This data was extracted from the Report Packaging Data (RPD) service on the 14th October 2024. RPD is the digital service for the extended producer responsibility (EPR) for packaging. Find out more about EPR

# This data report provides the UK aggregated packaging data, broken down by material and packaging type in tonnes, that has been reported for 2023 under the Packaging Waste (Data Reporting) Regulations 2023.
# This data was extracted from the Report Packaging Data (RPD) service on the 14th October 2024. RPD is the digital service for the extended producer responsibility (EPR) for packaging. Find out more about EPR.
# 
# These figures include 2023 packaging data submitted by UK large producers; the figures do not include:
#   
#  Data from large producers who are required to report their data but have not
# 
# Data from large producers who reported their 2023 data after the 14th October 2024
# 
# This includes some partial data submitted for 1 March to 31 December 2023. For Welsh producers, some data submitted covered 17 July to 31 December 2023.
# 
# This data has no uplift applied where producers have submitted partial data.
# 
# The data is subject to change due to late submissions, resubmissions and new submissions.
# 
# This is the first year of reporting under the Data reporting regulations. The regulators have a duty to monitor the accuracy of pEPR data submitted into RPD; these checks are ongoing. Regulators are also working with producers to identify and correct possible data errors. As a result, the data that makes up these total figures may include reporting issues that have not yet been addressed.
# 
# 2023 data is not impacted by The Packaging Waste (Data Reporting) (Amendment) Regulations 2024 as passed in each nation within the UK. For example, the requirement to report drinks containers supplied in Scotland was excluded for the calendar year 2023. The requirement to report drinks containers supplied in Scotland was introduced from 2024 onwards.
# 

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************

# Read in the data
packaging_data <- 
  # Read the raw data in
  read_excel("./raw_data/pEPR_2023ReportedPackagingData_14102024 (1).xlsx") %>%
  clean_names() %>%
  na.omit() %>%
  filter(x1 != "Total Supplied") %>%
  select(-total_t) %>%
  pivot_longer(-x1, 
               names_to = "material",
               values_to = "value") %>%
  mutate(material = gsub("\\_.*", "", material)) %>%
  mutate(year = 2023) %>%
  rename(category = 1) %>%
  mutate(value = round(value, 1)) %>%
  mutate_at(c('material'), trimws) %>%
  mutate(material = gsub("fibre", "Fibre composite", material)) %>%
  mutate(material = gsub("paper", "Paper/card", material)) %>%
  mutate(material = str_to_sentence(material))

# Write to site database using the connection established
DBI::dbWriteTable(con,
                  "RPD_service",
                  packaging_data,
                  overwrite = TRUE)
