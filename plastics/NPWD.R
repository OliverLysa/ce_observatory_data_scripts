##### **********************
# National Packaging Waste Database
# Description: Used by obligated businesses and compliance schemes to register with DA-level environment agencies and for preprocessors and exporters to submit quarterly returns on, and issue, EPRNS and ePERNs.
# Geographical scope: UK-wide
# Frequency of updates: Monthly - Annual
# 

# Steps
# 1. Extract the NPWD data
# 2. Bin the files into different variables covered 
  
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

# *******************************************************************************
# Options and functions
# *******************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./functions.R", 
       local = knitr::knit_global())

# *******************************************************************************
# Download and data preparation
#********************************************************************************
#

## Recycling summary 

# Following python script downloading all files from NPWD, list files in groups corresponding to the variables they cover and file type - recycling and recovery summary
quarterly_recycling_file_list <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='Recycling_Summary.+xls')

# Doing this for each variation in naming from the EA
quarterly_recycling_file_list2 <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='_RRS.+xls')

# Removing those meeting the pattern but containing monthly data
quarterly_recycling_file_list2 <-
  quarterly_recycling_file_list2[!grepl(pattern = "Monthly", quarterly_recycling_file_list2)]

# Doing this for each variation in naming from the EA
quarterly_recycling_file_list3 <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='recovery_summary.+xls')

# Bind list of file names
quarterly_recycling_file_list_all <- c(quarterly_recycling_file_list,
                                       quarterly_recycling_file_list2,
                                       quarterly_recycling_file_list3)

# Import those files and bind to a single df
quarterly_recycling_df <- 
  lapply(paste("./raw_data/NPWD_downloads/",
               quarterly_recycling_file_list_all,sep = ""), read_excel) %>%
  dplyr::bind_rows() %>%
  select(where(not_all_na)) %>%
  clean_names() %>% 
  mutate(x2 = coalesce(x2, national_packaging_waste_database)) %>%
  fill(2, .direction = "down") %>%
  filter(! str_detect(x2, 'Table 3|Summary of Recovery and Recycling|Summary of Recycling')) 

# Create non-detailed summary table
summary_table <- 
  quarterly_recycling_df %>%
  filter(str_detect(x2, 'Table 1')) %>%
  select(where(not_all_na)) %>%
  mutate(x4 = coalesce(x4, x3)) %>%
  mutate(x8 = coalesce(x8, x10),
         x8 = coalesce(x8, x7)) %>%
  mutate(x12 = coalesce(x12, x14)) %>%
  mutate(x12 = coalesce(x12, x10)) %>%
  mutate(x20 = coalesce(x20, x23)) %>%
  mutate(x20 = coalesce(x20, x18)) %>%
  mutate(x20 = coalesce(x20, x21)) %>%
  select(x2,x4,x8,x12,x20) %>%
  row_to_names(row_number = 2) %>%
  na.omit() %>%
  rename(year = 1, 
         category = 2,
         `UK reprocessing` = 3,
         `Overseas reprocessing` = 4,
         `PRNs issued` = 5) %>%
  mutate(year = gsub("[^0-9]", "", year)) %>%
  mutate(across(c('year'), substr, 2, nchar(year))) %>%
  mutate(year = substr(year, 1, 4)) %>%
  mutate(year = gsub("1202", '2020', year),
         year = gsub("2202", '2020', year),
         year = gsub("3202", '2020', year),
         year = gsub("4202", '2020', year)) %>%
  pivot_longer(-c(year, category),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  group_by(year, category, variable) %>%
  summarise(value = sum(value)) %>%
  filter(year != "2024") %>%
  mutate(unit=ifelse(grepl("PRNs", variable), "PRNs (Number)", "Tonnages")) %>%
  dplyr::filter(!grepl('TOTAL', category)) %>%
  mutate(identifier = 4)

DBI::dbWriteTable(con,
                    "packaging_recovery_recycling_alt",
                    summary_table,
                    overwrite = TRUE)

write_xlsx(summary_table,
                 "./cleaned_data/NPWD_recycling_recovery_summary.xlsx")

# Detail table
detail_table <- 
quarterly_recycling_df %>%
  mutate(year=ifelse(grepl("Table 1",x2), as.character(x2), NA), .before = x2) %>%
  mutate(year = gsub("[^0-9]", "", year)) %>%
  mutate(across(c('year'), substr, 2, nchar(year))) %>%
  mutate(year = substr(year, 1, 4)) %>%
  fill(year, .direction = "down") %>%
  mutate(year = gsub("1202", '2020', year),
         year = gsub("2202", '2020', year),
         year = gsub("3202", '2020', year),
         year = gsub("4202", '2020', year)) %>%
  filter(! str_detect(x2, 'Table 1')) %>%
  rename(tab = 1) %>%
  mutate(tab=ifelse(grepl("Table",tab), tab, NA), .before = x2) %>%
  mutate(rep=ifelse(grepl("Reprocessors",x2), x2, NA), .before = x2) %>%
  mutate(exp=ifelse(grepl("Exporters",x2), x2, NA), .before = x2) %>%
  mutate(combined = coalesce(tab, rep, exp), .before = x2) %>%
  fill(combined, .direction = "down") %>%
  filter(! combined %in% c("Reprocessors", "Exporters")) %>%
  select(-c(tab, rep, combined)) %>%
  row_to_names(row_number = 2) %>%
  clean_names() %>%
  select(where(not_all_na)) %>%
  mutate(na_3 = coalesce(na_3, na_4)) %>%
  mutate(gross1_received = coalesce(gross1_received, gross1_exported, gross1_total)) %>%
  # delete gross1exported where matching with gross1
  mutate_at(c('gross1_received','gross1_exported','gross1_total','na_8','na_10','net2_exported'), as.numeric) %>%
  mutate(gross1_exported = ifelse(gross1_received == gross1_exported, NA, gross1_exported)) %>%
  mutate(gross1_total = ifelse(gross1_received == gross1_total, NA, gross1_total)) %>%
  mutate(gross1_exported = coalesce(gross1_exported, na_8, gross1_total, na_10)) %>%
  mutate(gross_total = gross1_received + gross1_exported) %>%
  mutate(net2_received = ifelse(net2_received == gross_total, NA, net2_received)) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  mutate(net2_exported = ifelse(net2_exported == gross_total, NA, net2_exported)) %>%
  mutate(net2_received = coalesce(net2_received, na_12)) %>%
  mutate(net2_received = coalesce(net2_received, na_13)) %>%
  mutate(net2_received = coalesce(net2_received, na_14)) %>%
  # mutate(net2_exported = coalesce(net2_received, na_14)) %>%
  mutate_at(c('net2_received','net2_exported','net2_total','na_17','na_13'), as.numeric) %>%
  mutate(net_total = net2_received + net2_exported) %>%
  mutate(across(is.numeric, round, digits=2)) %>%
  mutate(net2_exported = coalesce(net2_exported, net2_total)) %>%
  mutate(net2_exported = coalesce(net2_exported, na_13)) %>%
  mutate(net2_exported = coalesce(net2_exported, na_17)) %>%
  select(1:3,5,6,10,11,21) %>%
  mutate(net_total = net2_received + net2_exported) %>%
  drop_na(gross1_received) %>%
  rename(year = 1,
         mat1 = 2,
         mat2 = 3,
         `Gross received` = 4,
         `Gross exported` = 5,
         `Net received` =6,
          `Net exported`= 7,
         `Gross total` =8,
         `Net total` =9) %>%
  mutate(mat1 = gsub("Re-melt", "Remelt", mat1)) %>%
  mutate(mat2 = coalesce(mat2, mat1)) %>%
  pivot_longer(-c(year, mat1, mat2),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  group_by(year, mat1, mat2, variable) %>%
  summarise(value = sum(value,na.rm =TRUE)) %>%
  filter(year != "2024") %>%
  dplyr::filter(!grepl('Total', mat2)) %>%
  unite(mat2, c(mat1, mat2), sep = "-", remove = FALSE) %>%
  # mutate(mat2 = gsub("\\(.*", "", mat2)) 
  dplyr::filter(!grepl('total', variable)) %>%
  mutate(unit = case_when(str_detect(variable, "Gross") ~ "Gross",
                          str_detect(variable, "Net") ~ "Net")) %>%
  mutate(mat2 = gsub("\\(Agreed with local agency office or based on sampling\\)", "", mat2)) %>%
  mutate(mat2 = gsub("\\(Agreed with local agency office\\)", "", mat2)) %>%
  # mutate(mat2 = gsub("-", " ", mat2)) %>%
  # mutate(mat2 = gsub("Plastic-Other", "Plastic - Other", mat2)) %>%
  mutate(identifier = 4)

# Write to database  
DBI::dbWriteTable(con,
                  "packaging_recovery_recycling_detail_alt",
                  detail_table,
                  overwrite = TRUE)

# Write locally
write_xlsx(detail_table,
           "./cleaned_data/NPWD_recycling_recovery_detail.xlsx")

## PRN Revenue

substrRight <- function(x, n){
  substr(x, nchar(x)-n+1, nchar(x))
}

revenue_files <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='PRN.+xls')

# Import those files and bind to a single df
revenue_data <- 
  lapply(paste("./raw_data/NPWD_downloads/",
               revenue_files,sep = ""), read_excel) %>%
  dplyr::bind_rows() %>%
  mutate(Material = coalesce(Material, `Material Type`)) %>%
  mutate(Material = coalesce(Material, `Material/ Process`)) %>%
  separate(Material,c("Material","Accreditation_Type"),sep=" (?=[^ ]*$)") %>%
  mutate(`Accreditation Type` = coalesce(`Accreditation Type`, Accreditation_Type)) %>%
  select(-c(Accreditation_Type, `Material Type`, `Material/ Process`, Total)) %>%
  mutate(year=ifelse(grepl("©",Material), as.character(Material), NA), .before = Material) %>%
  mutate(year = gsub("[^0-9]", "", year)) %>%
  mutate(year = substrRight(year, 4)) %>%
  mutate_at(c('year'), as.numeric) %>%
  mutate(year = year - 1) %>%
  fill(year, .direction = "up") %>%
  filter(! Material %in% c("Total", "Paper Composting")) %>%
  drop_na(`Infrastructure and capacity`) %>%
  mutate(Material = ifelse( (Material %in% "Glass") & (year %in% c("2022", "2023")) & (`Accreditation Type` %in% "Reprocessor"), "Glass Re-melt", Material)) %>%
  mutate(Material = ifelse( (Material %in% "Glass") & (year %in% c("2022", "2023")) & (`Accreditation Type` %in% "Exporter"), "Glass Re-melt", Material)) %>%
  mutate(Material = ifelse( (Material %in% "Glass") & (year %in% c("2022", "2023")) & (`Accreditation Type` %in% "Exp & Rep"), "Glass Other", Material)) %>%
  mutate(Material = ifelse( (Material %in% "*Glass") & (year %in% c("2022", "2023")) & (`Accreditation Type` %in% "Rep & Exp"), "Glass Other", Material)) %>%
  mutate(Material = ifelse( (Material %in% "Glass") & (year %in% c("2018","2020")) & (`Accreditation Type` %in% "Re-melt"), "Glass Re-melt", Material)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Glass Other Rep. & Glass Other"), "Reprocessor & Exporter", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Aluminium") & (year %in% c("2018", "2020")) & (is.na(`Accreditation Type`)), "Reprocessor", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "EfW") & (year %in% c("2018", "2020")) & (is.na(`Accreditation Type`)), "Reprocessor", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Paper/board") & (year %in% c("2018", "2020")) & (is.na(`Accreditation Type`)), "Reprocessor", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Plastic") & (year %in% c("2018", "2020")) & (is.na(`Accreditation Type`)), "Reprocessor", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Steel") & (year %in% c("2018", "2020")) & (is.na(`Accreditation Type`)), "Reprocessor", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Glass Other Rep &"), "Reprocessor & Exporter", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "EfW Rep &"), "Reprocessor & Exporter", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Wood Rep. & Wood"), "Reprocessor & Exporter", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Steel") & (year %in% c("2018", "2020")) & (is.na(`Accreditation Type`)), "Reprocessor", `Accreditation Type`)) %>%
  mutate(Material = ifelse( (Material %in% "Glass") & (year %in% c("2021")) & (`Accreditation Type` %in% c("Reprocessor", "Exporter")), "Glass Re-melt", Material)) %>%
  mutate(Material = ifelse( (Material %in% "*Glass"), "Glass Other", Material)) %>%
  mutate(`Accreditation Type` = gsub("\\bRep\\b", 'Reprocessor', `Accreditation Type`),
         `Accreditation Type` = gsub("\\bExp\\b", 'Exporter', `Accreditation Type`),
         `Accreditation Type` = gsub("\\bExp\\.\\b", 'Exporter', `Accreditation Type`),
         `Accreditation Type` = gsub("\\bExporter & Reprocessor\\b", 'Reprocessor & Exporter', `Accreditation Type`),
         `Accreditation Type` = gsub("\\bExport\\b", 'Exporter', `Accreditation Type`)) %>%
  mutate(Material = gsub("\\bAlum.\\b", 'Aluminium', Material),
         Material = gsub("\\bAlum\\b", 'Aluminium', Material),
         Material = gsub("\\bEfW Rep &\\b", 'EfW', Material),
         Material = gsub("\\bGlass Other Rep &\\b", 'Glass Other', Material),
         Material = gsub("\\bGlass Other Rep &\\b", 'Glass Other', Material),
         Material = gsub("\\bGlass Other & Glass Other\\b", 'Glass Other', Material),
         Material = gsub("\\bGlass Other Rep. & Glass Other\\b", 'Glass Other', Material),
         Material = gsub("\\bWood Rep. &\\b", 'Wood', Material),
         Material = gsub("\\bWood Rep. & Wood\\b", 'Wood', Material),
         Material = gsub("\\bWood & Wood\\b", 'Wood', Material),
         Material = gsub("\\bEfW for\\b", 'EfW', Material),
         Material = gsub("\\bPaper/board\\b", 'Paper/Board', Material)) %>% 
  mutate(Material = gsub("\\*", "", Material),
         `Accreditation Type` = gsub("\\.", "", `Accreditation Type`),
         `Accreditation Type` = gsub("Re-melt", "Reprocessor", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Glass Other") & (year %in% c("2018")), "Reprocessor & Exporter", `Accreditation Type`)) %>%
  mutate(`Accreditation Type` = ifelse( (Material %in% "Wood") & (year %in% c("2017", "2018")), "Reprocessor & Exporter", `Accreditation Type`)) %>%
  pivot_longer(-c(year, Material, `Accreditation Type`),
               names_to = "item",
               values_to = "value") %>%
  clean_names() %>%
  mutate_at(c('material'), trimws) %>%
  mutate(identifier = 4)

DBI::dbWriteTable(con,
                  "packaging_revenue_data",
                  revenue_data,
                  overwrite = TRUE)

write_xlsx(revenue_data,
           "./cleaned_data/packaging_revenue_data.xlsx")

# POM

pom_files <- 
  list.files("./raw_data/NPWD_downloads",
             pattern='Consolidated.+xls')

# Import those files and bind to a single df
pom_data <- 
  lapply(paste("./raw_data/NPWD_downloads/",
               pom_files,sep = ""), read_excel) %>%
  dplyr::bind_rows() %>%
  select(where(not_all_na)) %>%
  clean_names() %>%
  mutate(year=ifelse(
    grepl("Year", consolidated_table_for_all_activities) |
    grepl("Year", consolidated_tables_for_all_activities_all_weights_in_whole_tonnes), 
          as.character(x3), NA),
    .before = consolidated_table_for_all_activities) %>%
  fill(year, .direction = "downup") %>%
  mutate(consolidated_table_for_all_activities = coalesce(consolidated_table_for_all_activities, 
                                                          consolidated_tables_for_all_activities_all_weights_in_whole_tonnes)) %>%
  select(1:10) %>%
  row_to_names(12) %>%
  clean_names() %>%
  rename(variable = 2) %>%
  drop_na(variable) %>%
  filter(! str_detect(variable, 'Producer|Obligation|Registration|Paper|Glass|Aluminium|Steel|Plastic|Wood|Organisation|NPWD|Organisation|HANDLED|SUMMARY|%|Activity|Total*')) %>%
  mutate(table=ifelse(grepl("Table",variable), paper, NA), .before = variable) %>%
  fill(table, .direction = "down") %>%
  filter(! str_detect(variable, 'Table')) %>%
  mutate(table=replace_na(table, "Packaging Supplied")) %>%
  select(where(not_all_na)) %>%
  filter(! str_detect(variable, 'Packaging/Packaging Materials Imported|Imported Transit Packaging|Packaging/Packaging Materials Exported')) %>%
  rename(year = 1) %>%
  pivot_longer(-c(year, table, variable),
               names_to = "material",
               values_to = "value") %>%
  mutate(identifier = 4)

pom_data_indicators <- pom_data %>%
  select(-identifier) %>%
  mutate_at(c('value'), as.numeric) %>%
  mutate(variable = gsub("Imported for ", "", variable)) %>%
  mutate(variable = gsub("End User Packaging", "Selling", variable)) %>%
  pivot_wider(names_from = table,
              values_from = value) %>%
  filter(variable %in% c("Selling",
                       "Pack/Filling",
                       "Conversion")) %>%
  clean_names() %>%
  rename(domestic_production = packaging_supplied) %>%
  mutate(imports = rowSums(pick(packaging_imported_into_the_uk_for_the_purpose_of_an_activity, packaging_imported_into_the_uk_as_an_end_user), na.rm = T),
         exports = rowSums(pick(packaging_exported_outside_the_uk_by_the_producer, packaging_exported_outside_the_uk_by_a_third_party), na.rm = T),
         POM = domestic_production + imports - exports) %>%
  select(year, material, variable, domestic_production, imports, exports, POM)

DBI::dbWriteTable(con,
                  "packaging_POM_NPWD",
                  pom_data,
                  overwrite = TRUE)

# Write output to xlsx form
write_xlsx(pom_data, 
           "./cleaned_data/packaging_pom.xlsx")

write_xlsx(pom_data_indicators, 
           "./cleaned_data/packaging_pom_indicators.xlsx")

wrap_composition_data <- 
  read_excel("./raw_data/wrap_plastic_market_situation report.xlsx") %>%
  filter(Category != "Total")
  
prop_table <- prop.table(wrap_composition_data)





