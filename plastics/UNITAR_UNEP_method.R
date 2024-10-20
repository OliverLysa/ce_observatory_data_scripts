# Trade - UNITAR method

# Import hs to plastic conversion factors
conversion_factors_trade <- read_excel("./raw_data/ENG  - Plastic Embedded POM-Calculation Tool.xlsm",
                      sheet = "HS_PlasticKEY") %>%
  clean_names() %>%
  select(1:3,5) %>%
  dplyr::rename(hs_description = 2,
         plastic_key = 3,
         plastic_fraction = 4) %>%
  filter(plastic_key %in% c("P101", "P102", "P103", "P104", "P105"))

# Import trade data
trade_data <- 
  read_csv("./raw_data/Yearly - UK-Trade-Data - 202001 to 202012 - 200911 to 392330.csv") %>%
  dplyr::group_by(Hs6, FlowType, Year) %>%
  dplyr::summarise(NetMass = sum(NetMass))

# Import plastic to polymer conversion
polymer_conversion <- read_excel("./raw_data/Plastic Waste Generated Tool-2023.xlsm",
                                 sheet = "conversion") %>%
  select(-1) %>%
  slice(1) %>%
  clean_names() %>%
  pivot_longer(-total, 
               names_to = "Polymer",
               values_to = "value") %>%
  mutate(year = 2020) %>%
  select(-1)

# Join datasets
joined_data <- 
  left_join(trade_data, conversion_factors_trade, by=c("Hs6" = "hs_code")) %>%
  mutate(kg = NetMass * plastic_fraction) %>%
  left_join(polymer_conversion, by=c("Year" = "year")) %>%
  filter(Polymer == "pet") %>%
  mutate(pet_kg = value * kg) %>%
  dplyr::group_by(FlowType, plastic_key) %>%
  dplyr::summarise(total = sum(pet_kg)/1000)


