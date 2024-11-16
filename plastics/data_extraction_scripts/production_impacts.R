production_impacts <- read_xlsx(
           "./cleaned_data/production_impacts_all.xlsx") %>%
  mutate(SIC_Description = gsub("Plastics products", "Manufacture of plastic products", SIC_Description)) %>%
  unite(SIC2, SIC, SIC_Description, sep = " - ", remove = FALSE) %>%
  # select(1,3:5) %>%
  mutate_at(c('value','year'), as.numeric) %>%
  mutate(across(is.numeric, round, digits=2))

# Export to database
DBI::dbWriteTable(con,
                  "territorial_production_impacts",
                  production_impacts,
                  overwrite =TRUE)
