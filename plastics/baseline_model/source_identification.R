# Purpose: Identify sources from data.gov that could be relevant
# Author: Oliver Lysaght

# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx",
  "httr",
  "jsonlite")

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# *******************************************************************************
# Data
# *******************************************************************************

{r}
# Firstly we look for any relevant organisations
raw = GET('https://data.gov.uk/api/action/organization_list')
publishers <- content(raw, "text")
publishers <- fromJSON(publishers, flatten = TRUE)
publishers <- as.data.frame(publishers$result)

# We used the data.gov.uk API to search their metadata library for the terms, collating sources, de-duplicating and manually reviewing against input requirements.

{r}
# #### Extract ####
# # Import search terms
terms <- c("plastic")

extractor <- function(x) {
  raw = GET(paste('https://data.gov.uk/api/action/package_search?q=',
                  x,'*&rows=1000',sep = ""))
  downloaded <- content(raw, "text")
  textJSON <- fromJSON(downloaded, flatten = TRUE)
  textJSON2 <- as.data.frame(textJSON$result$results)
  Results <- textJSON2 %>%
    mutate(Term = x)
  
  return(Results)
}

# 
res <- list()
for (i in seq_along(terms)) {
  res[[i]] <- extractor(terms[i])
  print(i)
  res <- lapply(res, function(x) {x[] <- lapply(x, as.character); x})
}

bind <-
  dplyr::bind_rows(res) %>%
  unique() %>%
  filter(type == "dataset",
         private != "TRUE",
         ! `theme-primary` %in% c("transport",
                                  "government-spending",
                                  "health",
                                  "defence",
                                  "crime-and-justice",
                                  "education",
                                  "mapping")) %>%
  filter(is.na(unpublished)|unpublished!="TRUE")

# Convert lists to format that can be exported
bind <-
  as.data.frame(substr(as.matrix(bind), 1, 32767))

write_xlsx(bind,
           "datagovall.xlsx")

