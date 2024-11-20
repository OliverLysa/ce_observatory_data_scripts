# Historic sankey

############## PLACED ON MARKET

# Set join by function
by <- join_by(closest(year <= year))

# Import composition data
BOM <- 
  read_excel("./cleaned_data/plastic_packaging_composition.xlsx",
             sheet = "compiled") %>%
  clean_names() %>%
  select(-source_url) %>%
  pivot_longer(-c(year, category, type),
               names_to = "material",
               values_to = "value")

# Import 
POM_packaging_composition <-
  read_excel("./cleaned_data/defra_packaging_all.xlsx") %>%
  mutate_at(c('year'), as.numeric) %>%
  select(-rate) %>%
  filter(variable == "Arisings",
         material == "Plastic") %>%
  left_join(BOM, by) %>%
  mutate(tonnes = value.x * value.y) %>%
  select(year.x,
         category,
         type,
         material.y,
         tonnes) %>%
  rename(year = 1,
         material = 4,
         value = 5)

# POM Stage 1 - POM > Consumer/non-consumer

POM_1 <- POM_packaging_composition %>%
  group_by(year, category, material) %>%
  summarise(value = sum(value)) %>%
  mutate(source = "POM") %>%
  rename(target = category) %>%
  select(year,
         source,
         target,
         material,
         value)

POM_2 <- POM_packaging_composition %>%
  group_by(year, category, type, material) %>%
  summarise(value = sum(value)) %>%
  rename(source = category,
         target = type) %>%
  select(year,
         source,
         target,
         material,
         value)
  
############## WASTE GENERATED

# Import the modelled waste data

WG <- read_csv("inflow_outflow_stock.csv") %>%
  filter(variable == "WG",
         ! year > 2023) %>%
  select(-c(material, sector)) %>%
  left_join(BOM, by) %>%
  mutate(tonnes = value.x * value.y) %>%
  select(year.x,
         type,
         material,
         tonnes) %>%
  group_by(year.x,
           type,
           material) %>%
  summarise(value = sum(tonnes)) %>%
  rename(year = 1,
         source = 2) %>%
  mutate(target = "WG") %>%
  select(year,
         source,
         target,
         material,
         value)

############## COLLECTION AND LITTERING



############## TREATMENT 1

# WASTE TRADE

# 





