production_impacts <- read_xlsx(
           "./cleaned_data/production_impacts_all.xlsx") %>%
  filter(SIC == "22.2") %>%
  mutate(SIC_Description = gsub("Plastics products", "Manufacture of plastic products", SIC_Description)) %>%
  unite(SIC2, SIC, SIC_Description, sep = " - ") %>%
  select(1,3:5) %>%
  mutate_at(c('value'), as.numeric) %>%
  mutate(across(is.numeric, round, digits=2))

# Export to database
DBI::dbWriteTable(con,
                  "plastics_production_impacts",
                  production_impacts)
