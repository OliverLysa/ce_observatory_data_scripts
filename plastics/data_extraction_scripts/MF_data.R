# 2020

download.file(
  "https://environment.data.gov.uk/api/file/download?fileDataSetId=b5ce6b34-9df6-4821-ad44-bed981e690ca&fileName=21_05_28_ss_(MF_Data_January_to_December_2020).xlsx",
  "./raw_data/material_facilities/MF_Data_January_to_December_2020.xlsx"
)

MF_data_20 <-
  # Read in file
  read_excel("./raw_data/material_facilities/MF_Data_January_to_December_2020.xlsx",
             sheet = "Output") %>%
  clean_names() %>%
  filter(grade_if_som %in% c("PET Bottles - Coloured", 
                         "PET Bottles - Clear",
                         "PET Bottles - Mixed")) %>%
  select(1:13) %>%
  group_by(year, ea_area, grade_if_som) %>%
  summarise(tonnes = sum(tonnes))

# Includes some mixed categories e.g. PTT that will need to be broken down

# 2021

download.file(
  "https://environment.data.gov.uk/api/file/download?fileDataSetId=7544044a-1a03-4c8f-8deb-6e0eb45b1671&fileName=22_09_22_ss_(MF_Data_January_to_December_2021).xlsx",
  "./raw_data/material_facilities/MF_Data_January_to_December_2021.xlsx"
)

MF_data_21 <-
  # Read in file
  read_excel("./raw_data/material_facilities/MF_Data_January_to_December_2021.xlsx",
             sheet = "Output") %>%
  clean_names() %>%
  filter(grade_if_som %in% c("PET Bottles - Coloured", 
                             "PET Bottles - Clear",
                             "PET Bottles - Mixed")) %>%
  select(1:13) %>%
  group_by(year, ea_area, grade_if_som) %>%
  summarise(tonnes = sum(tonnes))

MF_data <- MF_data_20 %>%
  bind_rows(MF_data_21) %>%
  rename(region = 2,
         grade = 3)

DBI::dbWriteTable(con,
                  "MF_data",
                  MF_data,
                  overwrite = TRUE)

# Join Input and Output

MF_data_in <-   # Read in file
  read_excel("./raw_data/material_facilities/MF_Data_January_to_December_2021.xlsx",
             sheet = "Input")

MF_data_out <-  
  