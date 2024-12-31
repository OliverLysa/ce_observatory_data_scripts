download.file(
  "https://assets.publishing.service.gov.uk/media/65e9d56462ff48001a87b393/Flytipping_incidents_and_actions_taken__reported_by_LAs_in_England__2012-13_to_2022-23_accessible_revised.ods",
  "./raw_data/flytipping_la.ods"
)

flytipping_all <-
  read_ods("./raw_data/flytipping_la.ods", sheet = "LA_incidents") %>%
  select(1,3,16:30) %>%
  row_to_names(2)

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

write_csv(flytipping,
          "./cleaned_data/flytipping.csv")

# Write table
DBI::dbWriteTable(con,
                  "flytipping_england",
                  flytipping,
                  overwrite = TRUE)
  
# Get the weights
flytipping_sizes <-
  read_ods("./raw_data/flytipping_la.ods", sheet = "LA_incidents") %>%
  row_to_names(2) %>%
  select(1,3,31:44) %>%
  dplyr::filter(!grepl('Total', `LA Name`)) %>%
  pivot_longer(-c(Year, `LA Name`),
               names_to = "type",
               values_to = "value") %>%
  mutate(variable = case_when(str_detect(type, "£") ~ "Costs",
                              str_detect(type, "Incidents") ~ "Size")) %>%
  filter(variable == "Size") %>%
  mutate(Year = str_remove(Year, "-.+")) %>%
  mutate_at(c('value','Year'), as.numeric) %>%
  clean_names() %>%
  group_by(year, type,) %>%
  summarise(value = sum(value, na.rm = TRUE)) %>%
  group_by(type) %>% 
  mutate(percent = value/sum(value))

# flytipping of plastic packaging
# Estimate the weight of the relevant categories
# Summarise the totals across LAs
flytipping_totals <- flytipping %>%
  clean_names() %>%
  group_by(year, type) %>%
  summarise(value = sum(value)) %>%
  dplyr::filter(grepl('Black Bags', type)) %>%
  # Assuming 200 bags at 10 kg each - adjusted based on Brunel study
  mutate(weight_per_incident_kg = case_when(str_detect(type, "Commercial") ~ 2000,
                              # Assuming 30 bags at 10 kg each              
                              str_detect(type, "Household") ~ 300)) %>%
  mutate(weight_tonnes = (value * weight_per_incident_kg)/1000) %>%
  group_by(year) %>%
  summarise(weight_tonnes = sum(weight_tonnes)) %>%
  mutate(collection_route = "residual")

# Get weight of plastic packaging
composition <- 
  read_csv("./cleaned_data/waste_collection_composition_all.csv") %>%
  filter(collection_route == "residual") %>%
  filter(waste_type %in% c("PET bottles",
                           "HDPE bottles",
                           "Other plastic bottles",
                           "Pots, tubs & trays",
                           "Other dense plastic packaging",
                           "Polystyrene",
                           "Carrier bags",
                           "Other packaging plastic film")) %>%
  summarise(freq = sum(freq)) %>%
  mutate(collection_route = "residual")

# 
Fly_tipping_plastic_packaging <- left_join(flytipping_totals, composition) %>%
  mutate(value = weight_tonnes * freq)

