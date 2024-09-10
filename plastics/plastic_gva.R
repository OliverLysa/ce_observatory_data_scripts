# Write summary file
aGVA_data <- 
  read_xlsx("./cleaned_data/ABS_all.xlsx")

plastic_packaging_gva <- aGVA_data %>%
  filter(code %in% c("2222",
                   "2221",
                   "2016",
                   "2223",
                   "2229",
                   "2896")) %>%
  unite(description, code, description, sep = " - ")

DBI::dbWriteTable(con,
                  "plastic_packaging_gva",
                  plastic_packaging_gva,
                  overwrite = TRUE)
