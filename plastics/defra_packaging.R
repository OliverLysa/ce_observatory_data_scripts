# Defra packaging statistics

Defra_packaging_all <- read_ods( 
  "./raw_data/UK_Statistics_on_Waste_dataset_September_2024_accessible (1).ods",
  sheet = "Packaging") %>%
  row_to_names(6) %>%
  clean_names() %>%
  filter(material != "Total recycling and recovery", 
         material != "Total recycling") %>%
  filter(! str_detect(material, 'Metal')) %>%
  mutate(material = gsub("of which: ", "", material)) %>%
  mutate(material = gsub("of which:", "", material)) %>%
  pivot_longer(-c(year,material,achieved_recovery_recycling_rate),
               names_to = "variable",
               values_to = "value") %>%
  mutate_at(c('achieved_recovery_recycling_rate','value'), as.numeric) %>%
  na.omit() %>%
  mutate(value = value * 1000) %>%
  mutate_at(vars('achieved_recovery_recycling_rate','value'), funs(round(., 2)))%>%
  dplyr::rename(rate = 3)

DBI::dbWriteTable(con,
                  "Defra_packaging",
                  Defra_packaging_all,
                  overwrite = TRUE)
