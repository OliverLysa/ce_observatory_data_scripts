# *******************************************************************************
# Require packages
#********************************************************************************

require(writexl)
require(dplyr)
require(tidyverse)
require(readODS)
require(janitor)
require(data.table)
require(xlsx)
require(readxl)
require(reticulate)

con <- dbConnect(RPostgres::Postgres(),
                 dbname = 'postgres', 
                 host = 'aws-0-eu-west-2.pooler.supabase.com',
                 port = 6543,
                 user = 'postgres.qowfjhidbxhtdgvknybu',
                 password = rstudioapi::askForPassword("Database password"))

# *******************************************************************************
# Options and functions
#********************************************************************************

# Turn off scientific notation
options(scipen=999)

# Import functions
source("./scripts/functions.R", 
       local = knitr::knit_global())

## 
# Dry recycling - quarto, with breakdown to level of plastics as a whole

# https://assets.publishing.service.gov.uk/media/65ba6e0ff51b10000d6a7e44/WFH_England_Data_202122__1_.ods