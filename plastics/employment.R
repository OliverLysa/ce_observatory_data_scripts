download.file(
  "https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/datasets/industry235digitsicbusinessregisterandemploymentsurveybrestable2/2022provisional/table22022p.xlsx",
  "./raw_data/ONS_employment_data.xlsx"
)

# 2022

employment <- read_excel("./raw_data/ONS_employment_data.xlsx",
                          sheet = "Table 2a GB") %>%
  row_to_names(3) %>%
  clean_names() %>%
  # fill(c(1:2), .direction = "down") %>%
  select(3:5,7,8) %>%
  na.omit() %>%
  rename(SIC = 1,
         `FT-public` = 2,
         `FT-private` = 3,
         `PT-public` = 4,
         `PT-private` = 5) %>%
  pivot_longer(-SIC,
               names_to = "type",
               values_to = "value") %>%
  mutate_at(c('value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate(year = "2022")

DBI::dbWriteTable(con,
                  "Business Register and Employment Survey",
                  employment,
                  overwrite = TRUE)
