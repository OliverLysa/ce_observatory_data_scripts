#### Libraries ####
require(writexl)
require(httr)
require(readODS)
require(readxl)
require(janitor)
require(xlsx)
require(tidyverse)
require(data.table)
require(ggplot2)
require(plotly)
require(highcharter)
require(netstat)
require(ggridges)
require(jsonlite)
require(mixdist)
require(logOfGamma)
require(tabulizer)
require(DT)
require(googlesheets4)
require(shiny)
require(shinyWidgets)

options(warn = -1,
        scipen=999,
        timeout=1000)

# Table 1. Search terms/strings used to identify assets
# 
# While quite a number of online public catalogues exist in the UK for users to find and retrieve data public assets across geographies and topics of interest (with several of these set out in Table 18), several catalogues or repositories have sought to consolidate available data and in particular, data.gov.uk. We can see there are large number and breadth of publishers on data.gov.uk, making it a useful centralised source for data published by central government and local government.
# https://en.wikipedia.org/wiki/Open_data_in_the_United_Kingdom

{r}
# Firstly we look for any relevant organisations
raw = GET('https://data.gov.uk/api/action/organization_list')
publishers <- content(raw, "text")
publishers <- fromJSON(publishers, flatten = TRUE)
publishers <- as.data.frame(publishers$result)

datatable(publishers,
          options = list(paging = TRUE,
                         paging = TRUE,
                         autoWidth = TRUE,
                         server = FALSE,
                         dom = 'Bfrtip'),
          extensions = 'Buttons',
          filter = 'top'
)

# We used the data.gov.uk API to search their metadata library for the terms, collating sources, de-duplicating and manually reviewing against input requirements.

{r}
# #### Extract ####
# # Import search terms
terms <- c("electronic", "EEE", "WEEE", "electronic+waste", "lifespan", "lifetime", "electronic+price")

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

bind <-
  as.data.frame(substr(as.matrix(bind), 1, 32767))

write_xlsx(bind,
           "datagovall.xlsx")

# 0 returns for plastics - need to use adjacent and linked terminology
https://www.gov.uk/government/statistical-data-sets

# For Andrew - best way to get the

# 

