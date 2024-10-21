# *******************************************************************************
# Require packages
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
  "xlsx",
  "tabulizer",
  "docxtractr",
  "campfin"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Trade - UNITAR method

# Import hs to plastic conversion factors
# conversion_factors_trade <- read_excel("./raw_data/ENG  - Plastic Embedded POM-Calculation Tool.xlsm",
#                       sheet = "HS_PlasticKEY") %>%
#   clean_names() %>%
#   select(1:3,5) %>%
#   dplyr::rename(hs_description = 2,
#          plastic_key = 3,
#          plastic_fraction = 4) %>%
#   filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105"))

# Import conversion factors from latest guidelines
conversion_factors_hs_plastic_keys <- read_docx("./raw_data/2024 August_DRAFT Plastic guideline_after proofreading.docx") %>%
  docx_extract_tbl(1, header = TRUE) %>%
  clean_names() %>%
  filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
  mutate_at(c('plastic_content_tentative','hs_code'), as.numeric) %>%
  fill(plastic_content_tentative)

# 200911,200912,200919,200921,200929,200931,200939,200941,200949,200950,200961,200969,200971,200979,200981,200989,200989,200990,200990,220110,220190,220210,220299,392310,392321,392329,392330,392340,392350,392390

# Import trade data
trade_data <- 
  read_csv("./raw_data/Yearly - UK-Trade-Data - 202001 to 202012 - 200911 to 392390.csv") %>%
  dplyr::group_by(Hs6, FlowType, Year) %>%
  dplyr::summarise(NetMass = sum(NetMass))

# Import plastic to polymer conversion
polymer_conversion <- read_excel("./raw_data/Plastic Waste Generated Tool-2023.xlsm",
                                 sheet = "conversion") %>%
  select(-1) %>%
  slice(1) %>%
  clean_names() %>%
  pivot_longer(-total, 
               names_to = "Polymer",
               values_to = "value") %>%
  mutate(year = 2020) %>%
  select(-1)

# Join datasets
joined_data <- 
  left_join(trade_data, conversion_factors_hs_plastic_keys, by=c("Hs6" = "hs_code")) %>%
  mutate(kg = NetMass * plastic_content_tentative) %>%
  left_join(polymer_conversion, by=c("Year" = "year")) %>%
  filter(Polymer == "pet") %>%
  mutate(pet_kg = value * kg) %>%
  dplyr::group_by(FlowType) %>%
  dplyr::summarise(total = sum(pet_kg)/1000)


