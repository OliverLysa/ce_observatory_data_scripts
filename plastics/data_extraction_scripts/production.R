# Prodcom PET

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
  "campfin",
  "rjson",
  "zipcodeR",
  "ggmap",
  "zoo")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

Code <- c('22213065',
          '22213067',
          '22213069',
          '20164064')
Description <- c('Plate, sheets, film, foil, strip, of polyethylene terephthalate non-cellular, of a thickness <= 0.35mm EXCLUDING: floor, wall or ceiling covering, self-adhesive, reinforced, laminated, supported or similarly combined with other materials',
                 'Plates, sheets, film, foil, strip, of polyethylene terephthalate, non-cellular of a thickness > 0.35mm EXCLUDING: floor, wall or ceiling coverings, self-adhesive, reinforced, laminated, supported or similarly combined with other materials',
                 'Plates, sheets, film, foil and strip of polyesters, non-cellular EXCLUDING: floor, wall or ceiling coverings, self-adhesive, of polycarbonates, polyethylene terephthalate, and unsaturated polyesters',
                 'Polyethelene terephthalate in primary forms, EXCLUDING: of a viscosity of 183ml/g or greater')

code_descriptions <-
  data.frame(Code,
             Description)
  
prodcom_pet <-
  read_csv("./raw_data/20164062,20164064,22213065,22213067,22213069_2008-2024.csv") %>%
  filter(# Variable == "Volume (Kilogram)",
          !Code %in% c("22013069", "22213069"),
          Value != 0.0) %>%
  mutate(across(c(Value), na_if, "S")) %>%
  mutate(# Remove letter E in the value column
         Value = gsub("\\E","", Value),
         Value = gsub("e","", Value),
         # Remove commas in the value column
         Value = gsub(",","", Value),
         # Remove anything after hyphen in the value column
         Value = gsub("\\-.*","", Value)) %>%
  mutate(Value = gsub("[^0-9]", "", Value)) %>%
  mutate_at(c('Value'), as.numeric) %>%
  group_by(Code, Variable) %>%
  # mutate(Value = na.approx(Value, na.rm=FALSE)) %>%
  mutate(Value=ifelse(grepl("Volume", Variable), Value/1000, Value)) %>%
  mutate(across(is.numeric, round, digits=1)) %>%
  mutate_at(c('Code'), as.character) %>%
  mutate(Variable=ifelse(grepl("Volume", Variable), "Volume (Tonnes)", Variable)) %>%
  na.omit() %>%
  left_join(code_descriptions) %>%
  unite(Code, Code, Description, sep = " - ")

# Write table
DBI::dbWriteTable(con,
                  "plastic_prodcom",
                  prodcom_pet,
                  overwrite = TRUE)
