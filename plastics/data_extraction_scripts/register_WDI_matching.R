## Matching WDI and Register

Register <- read_xlsx(
  "./cleaned_data/register_geo_data_exl_lat_long.xlsx") %>%
  filter(material_process == "Plastic",
         year == 2022,
         agency == "EA",
         status == "Active")

WDI_2022 <- 
  read_excel("./raw_data/Landfill_Incineration/Landfill/Input/2022/2022_extracted.xlsx", sheet = 1) %>%
  clean_names() %>%
  mutate(postcode = gsub(" ", "", post_code))

Joined <- 
    dplyr::left_join(# Join the correspondence codes and the trade data
      Register,
      WDI_2022,
      by =join_by("postcode"))

# Anti-join to see any which haven't been matched
left <-
  anti_join(Register, Joined, by = "accreditation_number")

write_xlsx(Joined,
            "./cleaned_data/basic_join_reg_wdi.xlsx")
