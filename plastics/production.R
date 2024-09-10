# Prodcom PET

require(zoo)

prodcom_pet <-
  read_csv("./raw_data/20164062,20164064,22213065,22213067,22213069_2008-2024.csv") %>%
  filter(# Variable == "Volume (Kilogram)",
         !Code %in% c("20164062","20164064")) %>%
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
  mutate(Value = na.approx(Value, na.rm=FALSE)) %>%
  mutate(Value=ifelse(grepl("Volume", Variable), Value/1000, Value)) %>%
  mutate(across(is.numeric, round, digits=1)) %>%
  mutate_at(c('Code'), as.character) %>%
  mutate(Variable=ifelse(grepl("Volume", Variable), "Volume (Tonnes)", Variable))

# Write table
DBI::dbWriteTable(con,
                  "plastic_prodcom",
                  prodcom_pet,
                  overwrite = TRUE)
