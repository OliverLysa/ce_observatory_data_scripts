
# Quality scoring ---------------------------------------------------------

## Appends a quality score in an array format to the sankey
# Scoring done at the observation level based on metadata produced at the dataset level and a quality aggregation algorithm
# At the present time, we have close to 3,600 observations in the plastic sankey and it would be inefficient to grade each source by hand
# Conditional statements map and classify the metadata in the metadata catalogue against the following scoring schema for each observation - reflecting what the sankey is purporting to show
# Where one source populates the observation, the quality score reflects the quality dimensions of that one source only
# Where multiple data sources input, we taken an average across the sources for that data source

# First, add the source to the sankey
# Then perform the calculation
# Also in some cases, a variable is populated including with an estimation approach
# Identify in each dataset how the material of interest is classified and map datasets to position in value chain of relevance

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
# TIMELINESS%-%First year for which data is available
# TIMELINESS%-%Most recent year for which data is available

# Geographical correlation ------------------------------------------------

# The geographical relevance of the data to the studied region.	[{
#   score:1, definition:"Value is specific to the studied region.",
# } , {
#   score:2, definition:"Value covers the region, but is not specific.",
# } , {
#   score:3, definition:"Value relates to the same/slightly different socioeconomic region.",
# } , {
#   score:4, definition:"Value relates to a very different socioeconomic region.",
# }]

# Linked variables in the metadata catalogue
# Geographical coverage (the largest geospatial area that the source covers)
# Geographical disaggregation, by country (the list of geographical categories making up that spatial coverage)

# Other technological correlation -----------------------------------------

# Other Technological Correlation	Other factors such as the relevance of the data to the technology, product, or other contextual aspects.	[{
#   score:1, definition:"Value relates to the same product, material and process.",
# } , {
#   score:2, definition:"Value relates to the same prod technology or product.",
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
# Process

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

# Add completeness to data sources

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
# Stated quality assurance
# Reproducibility via code

# You can use this scoring approach to prioritise between sources or impose a cut-off
