# Quality scoring ---------------------------------------------------------

# Appends a quality score in an array format to the sankey
# Scoring done at the observation level based on metadata produced at the dataset level in combination with a quality score aggregation algorithm
# Conditional statements map and classify the metadata in the metadata catalogue against a scoring schema for each observation in a chart
# Where one source populates the observation, the quality score reflects the quality dimensions of that one source only, including an analysis step e.g. estimation of waste based on lifespan
# Where multiple data sources input, we taken an average across the sources for that variable or some other weighted combination approach

## Import the sankey data with sources attached
plastic_packaging_sankey_flows <-
  read_csv("./cleaned_data/sankey_all.csv") %>%
  # Add the region to the sankey for the geographical correlation
  mutate(region = "UK") %>%
  separate_wider_delim(data_source_id,
                       delim = "_",
                       too_few = "align_start",
                       names_sep = '') %>%
  mutate(row_id = row_number())

# Import the metadata for those sources
metadata <-
  read_excel("./raw_data/data_sources.xlsx") %>%
  clean_names()

# Clean up column names for joining
for ( col in 1:ncol(metadata)){
  colnames(metadata)[col] <-  sub("percent_percent._*", "", colnames(metadata)[col])
}

# Geographical correlation ------------------------------------------------

# The geographical relevance of the data to the studied region.	[{
#   score:1, definition:"Value is specific to the studied region.",
# } , {
#   score:2, definition:"Value covers (part of) the region, but is not specific to it.",
# } , {
#   score:3, definition:"Value relates to the same/slightly different socioeconomic region.",
# } , {
#   score:4, definition:"Value relates to an entirely different socioeconomic region.",
# }]

# Linked variables in the metadata catalogue
# Geographical coverage (the largest geospatial area that the source covers)
# Geographical disaggregation, by country (the list of geographical categories making up that spatial coverage)
# Use a standardised terminology for the region

# Join the metadata catalogue to the sankey columns
plastic_packaging_sankey_flows_geographical_source_1 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id1" = "name_identifier")) %>%
  select(1:11,29) %>%
  # See if a match on region
  mutate(patterns = map_chr(strsplit(region, ", "),paste,collapse="|"),
         match = str_detect(spatial_coverage_and_detail_geographical_coverage, patterns)) %>%
  mutate_at(c('match'), as.character) %>%
  mutate(geographic_score_source_1 = case_when(str_detect(match, "TRUE") ~ 1,
                                               str_detect(match, "FALSE") ~ 2)) %>%
  select(1:5,10,11,15)

plastic_packaging_sankey_flows_geographical_source_2 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id2" = "name_identifier")) %>%
  select(1:11,29) %>%
  # See if a match on region
  mutate(patterns = map_chr(strsplit(region, ", "),paste,collapse="|"),
       match = str_detect(spatial_coverage_and_detail_geographical_coverage, patterns)) %>%
  mutate_at(c('match'), as.character) %>%
  mutate(geographic_score_source_2 = case_when(str_detect(match, "TRUE") ~ 1,
                                               str_detect(match, "FALSE") ~ 2)) %>%
  select(11,15)

plastic_packaging_sankey_flows_geographical_source_3 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id3" = "name_identifier")) %>%
  select(1:11,29) %>%
  # See if a match on region
  mutate(patterns = map_chr(strsplit(region, ", "),paste,collapse="|"),
         match = str_detect(spatial_coverage_and_detail_geographical_coverage, patterns)) %>%
  mutate_at(c('match'), as.character) %>%
  mutate(geographic_score_source_3 = case_when(str_detect(match, "TRUE") ~ 1,
                                               str_detect(match, "FALSE") ~ 2)) %>%
  select(11,15)

# Take an average for the score across the sources
plastic_packaging_sankey_flows_geographical <- 
  left_join(plastic_packaging_sankey_flows_geographical_source_1, plastic_packaging_sankey_flows_geographical_source_2, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_geographical_source_3, by='row_id') %>%
  rowwise() %>% 
  mutate(geographic_score = mean(c_across(c(geographic_score_source_1, 
                                            geographic_score_source_2,
                                            geographic_score_source_3)), na.rm = TRUE)) %>%
  select(1:7,11) %>%
  mutate(across(c('geographic_score'), round, 0))

## Temporal correlation ----------------------------------------------------

# The congruence of the available data with the ideal data with respect to time.	[{
#   score:1, definition:"Value relates to the same time period.",
# } , {
#   score:2, definition:"Deviation of 1 to 5 years between the source data and observation.",
# } , {
#   score:3, definition:"Deviation of 6 to 10 years between the source data and observation.",
# } , {
#   score:4, definition:"Deviation of more than 10 years between the source data and observation.",
# }]

# Linked variables in the metadata catalogue
# TIMELINESS%-%Years covered

# Create a lookup table of the years each source covers
timeliness_metadata <- metadata %>%
  select(1,21) %>%
  separate_wider_delim(timeliness_period_covered,
                       delim = ";",
                       too_few = "align_start",
                       names_sep = '') %>%
  pivot_longer(-c(name_identifier),
               names_to = "source_year",
               values_to = "year") %>%
  select(-source_year) %>%
  na.omit() %>%
  mutate_at(c('year'), as.numeric) # %>%
  # as.data.table()

plastic_packaging_sankey_flows_temporal_source_1 <- plastic_packaging_sankey_flows %>%
  left_join(timeliness_metadata, by = c("data_source_id1" = "name_identifier")) %>%
  group_by(row_id) %>%
  slice(which.min(abs(year.y - year.x))) %>%
  mutate(difference = abs(year.y - year.x)) %>%
  ungroup() %>%
  mutate(temporal_score_source_1 = ifelse(difference == 0, 1,
                                   ifelse(difference >=1 & difference <= 5, 2,
                                   ifelse(difference >5 & difference <= 10, 3,
                                   ifelse(difference >10, 4,
                                          NA))))) %>%
  select(1:5,11,14)

plastic_packaging_sankey_flows_temporal_source_2 <- plastic_packaging_sankey_flows %>%
  left_join(timeliness_metadata, by = c("data_source_id2" = "name_identifier")) %>%
  group_by(row_id) %>%
  slice(which.min(abs(year.y - year.x))) %>%
  mutate(difference = abs(year.y - year.x)) %>%
  ungroup() %>%
  mutate(temporal_score_source_2 = ifelse(difference == 0, 1,
                                          ifelse(difference >=1 & difference <= 5, 2,
                                                 ifelse(difference >5 & difference <= 10, 3,
                                                        ifelse(difference >10, 4,
                                                               NA))))) %>%
  select(11,14)

plastic_packaging_sankey_flows_temporal_source_3 <- plastic_packaging_sankey_flows %>%
  left_join(timeliness_metadata, by = c("data_source_id3" = "name_identifier")) %>%
  group_by(row_id) %>%
  slice(which.min(abs(year.y - year.x))) %>%
  mutate(difference = abs(year.y - year.x)) %>%
  ungroup() %>%
  mutate(temporal_score_source_3 = ifelse(difference == 0, 1,
                                          ifelse(difference >=1 & difference <= 5, 2,
                                                 ifelse(difference >5 & difference <= 10, 3,
                                                        ifelse(difference >10, 4,
                                                               NA))))) %>%
  select(11,14)

# Take an average across the sources for the score
plastic_packaging_sankey_flows_temporal <- 
  left_join(plastic_packaging_sankey_flows_temporal_source_1, plastic_packaging_sankey_flows_temporal_source_2, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_temporal_source_3, by='row_id') %>%
  rowwise() %>% 
  mutate(temporal_score = mean(c_across(c(temporal_score_source_1, 
                                          temporal_score_source_2,
                                          temporal_score_source_3)), na.rm = TRUE)) %>%
  select(6,10) %>%
  mutate(across(c('temporal_score'), round, 0))

# Technological correlation -----------------------------------------

# Other Technological correlation	- other factors such as the relevance of the data to the technology, product, or other contextual aspects.	[{
#   score:1, definition:"Value is specific to the product, material and process.",
# } , {
#   score:2, definition:"Value covers, but is not specific to the same technology or product.",
# } , {
#   score:3, definition:"Value deviates from the technology or product of interest, but rough correlations can be established.",
# } , {
#   score:4, definition:"Value deviates strongly from the technology or product of interest, with vague and speculative correlations.",
# }]
# 

# Linked variables in the metadata catalogue - sub-scoring scheme
# Product(s) covered - Plastic Packaging
# Product relevance column - options
# 1. Category in the data specific to plastic packaging used
# 2. Category in the data specific to plastic or packaging used, but not specifically plastic packaging
# 3. Category in the data not specific to plastic or packaging used
# Technology - The process

# Completeness ------------------------------------------------------------

# The extent to which all relevant mass flows are accounted for.	[{
#   score:1, definition:"Value includes all relevant processes/flows.",
# } , {
#   score:2, definition:"Value includes main processes/flows.",
# } , {
#   score:3, definition:"Value includes partial important processes/flows, certainty of data gaps.",
# } , {
#   score:4, definition:"Only fragmented data available; important processes/mass flows are missing",
# }]

# Add completeness to data sources - an average across product, material, technology/process and then across the data sources
# Provide an estimated % of the flow, material and product covered
plastic_packaging_sankey_flows_completeness_source_1 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id1" = "name_identifier")) %>%
  select(1:6,11,24,26) %>%
  mutate(completeness_material_product = ifelse(
    input_requirement_mapping_material_and_product_completeness <= 100 & input_requirement_mapping_material_and_product_completeness <= 90, 1,
                                                 ifelse(input_requirement_mapping_material_and_product_completeness <90 & input_requirement_mapping_material_and_product_completeness >= 75, 2,
                                                        ifelse(input_requirement_mapping_material_and_product_completeness <75 & input_requirement_mapping_material_and_product_completeness >= 50, 3,
                                                               ifelse(input_requirement_mapping_material_and_product_completeness <50 & input_requirement_mapping_material_and_product_completeness >= 0, 4,
                                                               NA))))) %>%
  mutate(completeness_technology = ifelse(
    input_requirement_mapping_material_and_product_completeness <= 100 & input_requirement_mapping_material_and_product_completeness <= 90, 1,
    ifelse(input_requirement_mapping_material_and_product_completeness <90 & input_requirement_mapping_material_and_product_completeness >= 75, 2,
           ifelse(input_requirement_mapping_material_and_product_completeness <75 & input_requirement_mapping_material_and_product_completeness >= 50, 3,
                  ifelse(input_requirement_mapping_material_and_product_completeness <50 & input_requirement_mapping_material_and_product_completeness >= 0, 4,
                         NA))))) %>%
  mutate(completeness_score_1 = (completeness_material_product + completeness_technology)/2) %>%
  select(1:5,7,12)

plastic_packaging_sankey_flows_completeness_source_2 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id2" = "name_identifier")) %>%
  select(7,11,24,26) %>%
  mutate(completeness_material_product = ifelse(
    input_requirement_mapping_material_and_product_completeness <= 100 & input_requirement_mapping_material_and_product_completeness <= 90, 1,
    ifelse(input_requirement_mapping_material_and_product_completeness <90 & input_requirement_mapping_material_and_product_completeness >= 75, 2,
           ifelse(input_requirement_mapping_material_and_product_completeness <75 & input_requirement_mapping_material_and_product_completeness >= 50, 3,
                  ifelse(input_requirement_mapping_material_and_product_completeness <50 & input_requirement_mapping_material_and_product_completeness >= 0, 4,
                         NA))))) %>%
  mutate(completeness_technology = ifelse(
    input_requirement_mapping_material_and_product_completeness <= 100 & input_requirement_mapping_material_and_product_completeness <= 90, 1,
    ifelse(input_requirement_mapping_material_and_product_completeness <90 & input_requirement_mapping_material_and_product_completeness >= 75, 2,
           ifelse(input_requirement_mapping_material_and_product_completeness <75 & input_requirement_mapping_material_and_product_completeness >= 50, 3,
                  ifelse(input_requirement_mapping_material_and_product_completeness <50 & input_requirement_mapping_material_and_product_completeness >= 0, 4,
                         NA))))) %>%
  mutate(completeness_score_2 = (completeness_material_product + completeness_technology)/2) %>%
  select(1:5,7,12)

plastic_packaging_sankey_flows_completeness_source_3 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id3" = "name_identifier")) %>%
  select(8,11,24,26) %>%
  mutate(completeness_material_product = ifelse(
    input_requirement_mapping_material_and_product_completeness <= 100 & input_requirement_mapping_material_and_product_completeness <= 90, 1,
    ifelse(input_requirement_mapping_material_and_product_completeness <90 & input_requirement_mapping_material_and_product_completeness >= 75, 2,
           ifelse(input_requirement_mapping_material_and_product_completeness <75 & input_requirement_mapping_material_and_product_completeness >= 50, 3,
                  ifelse(input_requirement_mapping_material_and_product_completeness <50 & input_requirement_mapping_material_and_product_completeness >= 0, 4,
                         NA))))) %>%
  mutate(completeness_technology = ifelse(
    input_requirement_mapping_material_and_product_completeness <= 100 & input_requirement_mapping_material_and_product_completeness <= 90, 1,
    ifelse(input_requirement_mapping_material_and_product_completeness <90 & input_requirement_mapping_material_and_product_completeness >= 75, 2,
           ifelse(input_requirement_mapping_material_and_product_completeness <75 & input_requirement_mapping_material_and_product_completeness >= 50, 3,
                  ifelse(input_requirement_mapping_material_and_product_completeness <50 & input_requirement_mapping_material_and_product_completeness >= 0, 4,
                         NA))))) %>%
  mutate(completeness_score_3 = (completeness_material_product + completeness_technology)/2) %>%
  select(1:5,7,12)

plastic_packaging_sankey_flows_completeness <- 
  left_join(plastic_packaging_sankey_flows_completeness_source_1, plastic_packaging_sankey_flows_completeness_source_2, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_completeness_source_3, by='row_id') %>%
  rowwise() %>% 
  mutate(completeness_score = mean(c_across(c(completeness_score_1, 
                                              completeness_score_2,
                                              completeness_score_3)), na.rm = TRUE)) %>%
  select(6,10) %>%
  mutate(across(c('completeness_score'), round, 0))

# Reliability -------------------------------------------------------------
# Reliability	The source of the data, including documentation of how the data was generated, verification methods, and whether the data has been peer -reviewed.	[{
#     score:1, definition:"Methodology documented, consistent, and peer-reviewed data.",
#   } , {
#     score:2, definition:"Methodology described but not fully transparent, no verification.",
#   } , {
#     score:3, definition:"Methodology not comprehensively described, principle clear but no verification.",
#   } , {
#     score:4, definition:"Methodology unknown, no documentation available.",
#   }]

## Variables linked to 
# Communication of uncertainty - 1) Comprehensive and quantified, 2) Comprehensive; 3) Some; 4) None
# Stated quality assurance process - 1) Official accredited statistics or equivalent e.g. peer review; 2) Informal peer review; 3) Stated administrative checking process; 4) 

plastic_packaging_sankey_flows_reliability_source_1 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id1" = "name_identifier")) %>%
  select(1:6,11,34,35) %>%
  mutate(reliability_uncertainty = case_when(str_detect(quality_communication_of_methodology_and_data_quality, "Comprehensive and quantified") ~ 1,
                                              str_detect(quality_communication_of_methodology_and_data_quality, "Comprehensive") ~ 2,
         str_detect(quality_communication_of_methodology_and_data_quality, "Some") ~ 3,
         str_detect(quality_communication_of_methodology_and_data_quality, "None") ~ 4)) %>%
  mutate(reliability_qa = case_when(str_detect(quality_stated_and_accredited_quality_assurance, "Official accredited statistics") ~ 1,
                                             str_detect(quality_stated_and_accredited_quality_assurance, "Informal peer review") ~ 2,
                                             str_detect(quality_stated_and_accredited_quality_assurance, "Official statistics") ~ 2,
                                             str_detect(quality_stated_and_accredited_quality_assurance, "Administrative checking") ~ 3,
                                             str_detect(quality_stated_and_accredited_quality_assurance, "None") ~ 4)) %>%
  mutate(reliability_score_1 = (reliability_uncertainty + reliability_qa)/2) %>%
  select(1:5,7,12)

plastic_packaging_sankey_flows_reliability_source_2 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id2" = "name_identifier")) %>%
  select(7,11,34,35) %>%
  mutate(reliability_uncertainty = case_when(str_detect(quality_communication_of_methodology_and_data_quality, "Comprehensive and quantified") ~ 1,
                                             str_detect(quality_communication_of_methodology_and_data_quality, "Comprehensive") ~ 2,
                                             str_detect(quality_communication_of_methodology_and_data_quality, "Some") ~ 3,
                                             str_detect(quality_communication_of_methodology_and_data_quality, "None") ~ 4)) %>%
  mutate(reliability_qa = case_when(str_detect(quality_stated_and_accredited_quality_assurance, "Official accredited statistics") ~ 1,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "Informal peer review") ~ 2,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "Official statistics") ~ 2,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "Administrative checking") ~ 3,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "None") ~ 4)) %>%
  mutate(reliability_score_2 = (reliability_uncertainty + reliability_qa)/2) %>%
  select(2,7)

plastic_packaging_sankey_flows_reliability_source_3 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id3" = "name_identifier")) %>%
  select(8,11,34,35) %>%
  mutate(reliability_uncertainty = case_when(str_detect(quality_communication_of_methodology_and_data_quality, "Comprehensive and quantified") ~ 1,
                                             str_detect(quality_communication_of_methodology_and_data_quality, "Comprehensive") ~ 2,
                                             str_detect(quality_communication_of_methodology_and_data_quality, "Some") ~ 3,
                                             str_detect(quality_communication_of_methodology_and_data_quality, "None") ~ 4)) %>%
  mutate(reliability_qa = case_when(str_detect(quality_stated_and_accredited_quality_assurance, "Official accredited statistics") ~ 1,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "Informal peer review") ~ 2,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "Official statistics") ~ 2,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "Administrative checking") ~ 3,
                                    str_detect(quality_stated_and_accredited_quality_assurance, "None") ~ 4)) %>%
  mutate(reliability_score_3 = (reliability_uncertainty + reliability_qa)/2) %>%
  select(2,7)

plastic_packaging_sankey_flows_reliability <- 
  left_join(plastic_packaging_sankey_flows_reliability_source_1, plastic_packaging_sankey_flows_reliability_source_2, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_reliability_source_3, by='row_id') %>%
  rowwise() %>% 
  mutate(reliability_score = mean(c_across(c(reliability_score_1, 
                                             reliability_score_2,
                                             reliability_score_3)), na.rm = TRUE)) %>%
  select(6,10) %>%
  mutate(across(c('reliability_score'), round, 0))

# Combine the scores into an array -------------------------------------------------------------

# Join the tables together
plastic_packaging_sankey_flows_quality_scores <- 
  left_join(plastic_packaging_sankey_flows_geographical, plastic_packaging_sankey_flows_temporal, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_reliability, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_completeness, by='row_id')

write_csv(plastic_packaging_sankey_flows_quality_scores, 
          "sankey_all_quality_scores.csv")
