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


####### Trade
# ***********************

# Make HS correlation table
# Where are these codes sourced from 

trade_codes <- (c(200911,200912,200919,200921,200929,200931,200939,200941,200949,200950,200961,200969,200971,200979,200981,200989,200990,
                  220110,220190,220210,220299,392310,392321,392329,392330,392350,392390)) %>%
  as.data.frame() %>%
  mutate(year = 2022) %>%
  rename(hs = 1)

# Import trade data
trade_data <- 
  read_csv("./raw_data/Yearly - UK-Trade-Data - 202001 to 202012 - 200911 to 392390.csv") %>%
  dplyr::group_by(Hs6, FlowType, Year) %>%
  dplyr::summarise(NetMass = sum(NetMass))

# Import conversion factors from latest guidelines
conversion_factors_hs_plastic_keys <- read_docx("./raw_data/2024 August_DRAFT Plastic guideline_after proofreading.docx") %>%
  docx_extract_tbl(1, header = TRUE) %>%
  clean_names() %>%
  filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
  mutate_at(c('plastic_content_tentative','hs_code'), as.numeric) %>%
  fill(plastic_content_tentative)

write_xlsx(conversion_factors_hs_plastic_keys, 
           "conversion_factors_hs_plastic_keys.xlsx")

# Import UK-specific polymer conversion
UK_polymer_breakdown <- read_xlsx( 
  "./cleaned_data/plastic_packaging_composition.xlsx") %>%
  filter(Category == "Total") %>%
  select(1,5:12) %>%
  pivot_longer(-Year, 
               names_to = "Polymer",
               values_to = "value")

# Join datasets
trade_indicators <- 
  left_join(trade_data, conversion_factors_hs_plastic_keys, by=c("Hs6" = "hs_code")) %>%
  mutate(kg = NetMass * plastic_content_tentative) %>%
  # left_join(UK_polymer_breakdown, by=c("Year" = "Year")) %>%
  # filter(Polymer == "PET") %>%
  # mutate(pet_kg = value * kg) %>%
  dplyr::group_by(FlowType) %>%
  dplyr::summarise(tonnes = sum(kg)/1000) %>%
  pivot_wider(names_from = FlowType,
              values_from = tonnes) %>%
  clean_names() %>%
  mutate(net_imports = eu_imports + non_eu_imports - eu_exports - non_eu_exports) %>%
  mutate(year = 2020)

#######  Prodcom
# ***********************

# Make CN to PCC correlation table

# Import prodcom data
prodcom <- read_xlsx(
  "./cleaned_data/Prodcom_data_all.xlsx") %>%
  # mutate(Code_6 = substr(Code, 1, 5)) %>%
  filter(Year == "2020",
         Variable != "Value £000's") %>%
  filter(Code %in% c(# UNITAR HS codes correlated to Prodcom
    "10321210",
    "10321220",
    "10321230",
    "10321910",
    "10321100",
    "10321920",
    "10321700",
    "11071150",
    "11071930",
    "22221300",
    "22221100",
    "22221200",
    "22221300",
    "22221450",
    "22221925",
    # Drewniock 
    "10511133",
    "10511137",
    "10511142",
    "10511148",
    "10511210",
    "10511220",
    "10511230",
    "10511240",
    "10512230",
    "10512260",
    "10515245",
    "10731130",
    "10731150",
    "10851410",
    "10851430",
    "10851910",
    "11071130",
    "11071150",
    "11071930",
    "11071950",
    "11071970"
  ))

# Import conversion factors

# conversion_factors_cpc_plastic_keys <- read_docx("./raw_data/CPC codes plastics guidelines.docx") %>%
#   docx_extract_tbl(1, header = TRUE) %>%
#   row_to_names(1) %>%
#   clean_names() %>%
#   filter(plastic_key_unu_key %in% c("P101", "P102", "P103", "P104", "P105")) %>%
#   select(3:5,7) %>%
#   mutate_at(c('cpc_subclass'), as.numeric)

Drewniok_conversion <- read_xlsx(
  "./raw_data/ProdClassification (1).xlsx",
  sheet = "Data") %>%
  clean_names() %>%
  filter(packaging == 1) %>%
  select(1:21)

domestic_production_indicators <-
  # Convert into standard unit
  left_join(prodcom, Drewniok_conversion, by=c("Code" = "code")) %>%
  clean_names() %>%
  mutate(plastic_fraction_manual = case_when(str_detect(code, "22221925") ~ 1.0)) %>%
  mutate(plastic_fraction = coalesce(plastic_fraction, plastic_fraction_manual)) %>%
  mutate(plastic_fraction = replace_na(plastic_fraction, 0)) %>%
  mutate(plastic_tonnes = case_when(str_detect(variable, "Tonnes") ~ value * plastic_fraction,
                                    str_detect(variable, "Kilogram") ~ (value/1000)*plastic_fraction,
                                    str_detect(variable, "items") ~ value*unit_conv*plastic_fraction,
                                    str_detect(variable, "Litre") ~ value * plastic_fraction,
                                    str_detect(variable, "litre") ~ value * plastic_fraction)) %>%
  filter(code != "11071130") %>%
  dplyr::summarise(domestic_production = sum(plastic_tonnes)) %>%
  mutate(year = 2020)

# Calculate apparent consumption

# Construct apparent consumption estimate
apparent_consumption_plastic_packaging <-
  left_join(trade_indicators, domestic_production_indicators, by=c("year")) %>%
  mutate(apparent_consumption = domestic_production + net_imports) %>%
  select(year, eu_exports, eu_imports, non_eu_exports, non_eu_imports, net_imports, domestic_production, apparent_consumption)

