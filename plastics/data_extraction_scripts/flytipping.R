download.file(
  "https://assets.publishing.service.gov.uk/media/65e9d56462ff48001a87b393/Flytipping_incidents_and_actions_taken__reported_by_LAs_in_England__2012-13_to_2022-23_accessible_revised.ods",
  "./raw_data/flytipping_la.ods"
)

flytipping_all <-
  read.ods("./raw_data/flytipping_la.ods", sheet = "LA_incidents") %>%
  select(1,3,16:30) %>%
  row_to_names(3)

flytipping <- flytipping_all %>%
  dplyr::filter(!grepl('Total', `LA Name`)) %>%
  pivot_longer(-c(Year, `LA Name`),
               names_to = "type",
               values_to = "value") %>%
  mutate(Year = str_remove(Year, "-.+")) %>%
  mutate_at(c('value','Year'), as.numeric) %>%
  na.omit() %>%
  rename(Year = 1,
         LA = 2,
         type = 3,
         value = 4) %>%
  mutate_at(c('LA'), trimws)

# Write table
DBI::dbWriteTable(con,
                  "flytipping_england",
                  flytipping,
                  overwrite = TRUE)
