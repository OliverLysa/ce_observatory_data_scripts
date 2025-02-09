# Linkage
# Condition
# Aggregation

## Import the sankey data with sources attached
plastic_packaging_sankey_flows <-
  read_csv("sankey_all.csv") %>%
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

for ( col in 1:ncol(metadata)){
  colnames(metadata)[col] <-  sub("percent_percent._*", "", colnames(metadata)[col])
}

# Quality scoring ---------------------------------------------------------

# Appends a quality score in an array format to the sankey
# Scoring done at the observation level based on metadata produced at the dataset level in combination with a quality score aggregation algorithm
# Conditional statements map and classify the metadata in the metadata catalogue against a scoring schema for each observation in a chart
# Where one source populates the observation, the quality score reflects the quality dimensions of that one source only, including an analysis step e.g. estimation of waste based on lifespan
# Where multiple data sources input, we taken an average across the sources for that variable or some other weighted combination approach

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
  select(1:11,26) %>%
  # See if a match on region
  mutate(patterns = map_chr(strsplit(region, ", "),paste,collapse="|"),
         match = str_detect(spatial_coverage_and_detail_geographical_coverage, patterns)) %>%
  mutate_at(c('match'), as.character) %>%
  mutate(geographic_score_source_1 = case_when(str_detect(match, "TRUE") ~ 1,
                                               str_detect(match, "FALSE") ~ 2)) %>%
  select(1:5,10,11,15)

plastic_packaging_sankey_flows_geographical_source_2 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id2" = "name_identifier")) %>%
  select(1:11,26) %>%
  # See if a match on region
  mutate(patterns = map_chr(strsplit(region, ", "),paste,collapse="|"),
       match = str_detect(spatial_coverage_and_detail_geographical_coverage, patterns)) %>%
  mutate_at(c('match'), as.character) %>%
  mutate(geographic_score_source_2 = case_when(str_detect(match, "TRUE") ~ 1,
                                               str_detect(match, "FALSE") ~ 2)) %>%
  select(11,15)

plastic_packaging_sankey_flows_geographical_source_3 <-
  left_join(plastic_packaging_sankey_flows, metadata, c("data_source_id3" = "name_identifier")) %>%
  select(1:11,26) %>%
  # See if a match on region
  mutate(patterns = map_chr(strsplit(region, ", "),paste,collapse="|"),
         match = str_detect(spatial_coverage_and_detail_geographical_coverage, patterns)) %>%
  mutate_at(c('match'), as.character) %>%
  mutate(geographic_score_source_3 = case_when(str_detect(match, "TRUE") ~ 1,
                                               str_detect(match, "FALSE") ~ 2)) %>%
  select(11,15)

plastic_packaging_sankey_flows_geographical <- 
  left_join(plastic_packaging_sankey_flows_geographical_source_1, plastic_packaging_sankey_flows_geographical_source_2, by='row_id') %>%
  left_join(., plastic_packaging_sankey_flows_geographical_source_3, by='row_id') %>%
  rowwise() %>% 
  mutate(geographic_score = mean(c_across(c(geographic_score_source_1, 
                                            geographic_score_source_2,
                                            geographic_score_source_3)), na.rm = TRUE)) %>%
  select(1:7,11) %>%
  mutate(across(c('geographic_score'), round, 1))

## Temporal correlation ----------------------------------------------------

# The congruence of the available data with the ideal data with respect to time.	[{
#   score:1, definition:"Value relates to the correct time period.",
# } , {
#   score:2, definition:"Deviation of 1 to 5 years.",
# } , {
#   score:3, definition:"Deviation of 5 to 10 years.",
# } , {
#   score:4, definition:"Deviation of more than 10 years.",
# }]

# Linked variables in the metadata catalogue
# TIMELINESS%-%Years covered

# We calculate if observation year is equal to a year value in the metadata for that input source
# If not, then we calculate the distance from the min/max year and classify it into an ordinal scoring based on the above categories

# Other technological correlation -----------------------------------------

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

# Linked variables in the metadata catalogue
# Specific to or just covers - is it specifically named in that column? Otherwise, is it link to the named process (separate lookup)
# Product - packaging
# Material - Polymer
# Process - The process e.g. landfilling 

# Completeness ------------------------------------------------------------

# The extent to which all relevant mass flows are accounted for.	[{
#   score:1, definition:"Value includes all relevant processes/flows.",
# } , {
#   score:2, definition:"Value includes quantitatively main processes/flows.",
# } , {
#   score:3, definition:"Value includes partial important processes/flows, certainty of data gaps..",
# } , {
#   score:4, definition:"Only fragmented data available; important processes/mass flows are missing..",
# }]

# Add completeness to data sources - an aggregate across product, material, technology/process

# Reliability -------------------------------------------------------------
# Also a function of any estimation required to counteract a lack of completeness 
# Reliability	The source of the data, including documentation of how the data was generated, verification methods, and whether the data has been peer -
#   reviewed.	[{
#     score:1, definition:"Well-documented, consistent, and peer-reviewed data.",
#   } , {
#     score:2, definition:"Methodology described but not fully transparent, no verification.",
#   } , {
#     score:3, definition:"Methodology not comprehensively described, principle clear but no verification.",
#   } , {
#     score:4, definition:"Methodology unknown, no documentation available.",
#   }]

## Variables linked to 
# Methodology documented 
# Qualitative communication of uncertainty
# Quantitative communication of uncertainty (if applicable)
# Stated quality assurance process
# Reproducibility via code

