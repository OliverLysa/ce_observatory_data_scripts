
# Accredited reprocessors

pg1 <-
  extract_tables('./raw_data/Public Register 2024 (4).pdf', page = 1) %>%
  as.data.frame() %>%
  select(12:20) %>%
  # recode empty strings "" by NAs
  filter(X2.1!="")

pg2 <-
  extract_tables('./raw_data/Public Register 2024 (4).pdf', page = 2) %>%
  as.data.frame() %>%
  select(-1) %>%
  select(-10) %>%
  row_to_names(1)

pg3 <-
  extract_tables('./raw_data/Public Register 2024 (4).pdf', page = 3) %>%
  as.data.frame() %>%
  slice(-1) %>%
  select(-1) %>%
  select(-10)

ar_all <-
  rbindlist(
    list(
      pg2,
      pg3,
      pg1
    ),
    use.names = FALSE
  ) %>%
  mutate(Type = "Accredited Reprocessors", .before = 1)

# Accredit exporters

pg3b <-
  extract_areas('./raw_data/Public Register 2024 (4).pdf', page = 3) %>%
  as.data.frame() %>%
  select(-1)

pg4 <-
  extract_tables('./raw_data/Public Register 2024 (4).pdf', page = 4) %>%
  as.data.frame() %>%
  row_to_names(1) %>%
  select(2:10)

pg5 <-
  extract_tables('./raw_data/Public Register 2024 (4).pdf', page = 5) %>%
  as.data.frame() %>%
  row_to_names(1) %>%
  select(2:10)

ae_all <-
  rbindlist(
    list(
      pg5,
      pg4,
      pg3b
    ),
    use.names = FALSE
  ) %>%
  mutate(Type = "Accredited Exporters", .before = 1) %>%
  filter(Agency!="")

all <- ar_all %>%
  bind_rows(ae_all) %>%
  mutate(Year = "2024",
         .before = 1)

DBI::dbWriteTable(con,
                  "EA_register_packaging_plastic",
                  all,
                  overwrite = TRUE)

# Write the file
write.xlsx(all,
           "./cleaned_data/plastic_register_24.xlsx")
