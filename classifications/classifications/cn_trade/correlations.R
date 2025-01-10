con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 6543,
                 user = 'postgres.qcgyyjjmwydekbxsjjbx',
                 password = rstudioapi::askForPassword("Database password"))
                 
# CN descriptions to identify further which to retain
#2021 CN lookup
# download.file(
#   "https://op.europa.eu/o/opportal-service/euvoc-download-handler?cellarURI=http%3A%2F%2Fpublications.europa.eu%2Fresource%2Fdistribution%2Fcombined-nomenclature-2021%2F20240425-0%2Fcsv%2Fcsv%2FCN2021_Self_Explanatory_Texts_EN_DE_FR.csv&fileName=CN2021_Self_Explanatory_Texts_EN_DE_FR.csv",
#   "./classifications/cn2021.csv")

CN_descriptions_21 <- read_csv("./classifications/cn2021.csv") %>%
  select(3:4) %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  rename(description_21 = 2) %>%
  mutate(reference_year = "2021",
         classifies = "trade",
         classification_name = "Combined Nomenclature")

# # # 2022 CN lookup
# download.file(
#   "https://op.europa.eu/o/opportal-service/euvoc-download-handler?cellarURI=http%3A%2F%2Fpublications.europa.eu%2Fresource%2Fdistribution%2Fcombined-nomenclature-2022%2F20240425-0%2Fcsv%2Fcsv%2FCN2022_Self_Explanatory_Texts_EN_DE_FR.csv&fileName=CN2022_Self_Explanatory_Texts_EN_DE_FR.csv",
#   "./classifications/cn2022.csv")

CN_descriptions_22 <- read_csv("./classifications/cn2022.csv") %>%
  select(3:4) %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  rename(description_22 = 2) %>%
  mutate(reference_year = "2022",
         classifies = "trade",
         classification_name = "Combined Nomenclature")

# # # Import CN 2023 descriptions
# download.file(
#   "https://op.europa.eu/o/opportal-service/euvoc-download-handler?cellarURI=http%3A%2F%2Fpublications.europa.eu%2Fresource%2Fdistribution%2Fcombined-nomenclature-2023%2F20240425-0%2Fcsv%2Fcsv%2FCN2023_Self_Explanatory_Texts_EN_DE_FR.csv&fileName=CN2023_Self_Explanatory_Texts_EN_DE_FR.csv",
#   "./classifications/cn2023.csv")

# Import cn descriptions
CN_descriptions_23 <- read_csv("./classifications/cn2023.csv") %>%
  select(3:4) %>%
  mutate(CN_CODE = gsub(" ", "", CN_CODE)) %>%
  rename(description_23 = 2) %>%
  mutate(reference_year = "2023",
         classifies = "trade",
         classification_name = "Combined Nomenclature")

# All trade
CN_all <- 
  rbindlist(
    list(
      CN_descriptions_21,
      CN_descriptions_22,
      CN_descriptions_23
    ),
    use.names = FALSE
  ) %>%
  rename(code = 1,
         description = 2)

DBI::dbWriteTable(con,
                  "correlation_CN",
                  CN_all,
                  overwrite = TRUE)

## SIC

# Import cn descriptions
SIC <- read_csv("./classifications/classifications/SIC07_CH_condensed_list_en.csv") %>%
  mutate(classifies = "activity",
         classification_name = "Standard Industrial Classification",
         reference_year = "2023") %>%
  rename(code = 1,
         description = 2)

# DBI::dbWriteTable(con,
#                   "correlation_SIC",
#                   SIC,
#                   overwrite = TRUE)

# LOW
LOW <- read_excel("./classifications/Appendix B List of EWC to add to permit.xls",
                  sheet = 2) %>%
  select(1:2) %>%
  na.omit() %>%
  rename(code = 1,
         description = 2) %>%
  mutate(description = str_to_sentence(description)) %>%
  mutate(reference_year = 2015,
         classifies = "waste",
         classification_name = "European Waste Catalogue (EWC)/List of Wastes (LOW)")

correlation_all <- 
  rbindlist(
    list(
      CN_all,
      SIC,
      LOW),
    use.names = TRUE)

DBI::dbWriteTable(con,
                  "correlation_all",
                  correlation_all,
                  overwrite = TRUE)

write_xlsx(correlation_all, 
           "./cleaned_data/correlation_all.xlsx")


