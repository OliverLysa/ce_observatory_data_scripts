# *******************************************************************************
# Extraction functions
#********************************************************************************

# Read all sheets of an excel file
read_excel_allsheets <- function(filename, tibble = FALSE) {
  # but if you would prefer a tibble output, pass tibble = TRUE
  sheets <- readxl::excel_sheets(filename)
  x <- lapply(sheets, function(X) readxl::read_excel(filename, sheet = X))
  if(!tibble) x <- lapply(x, as.data.frame)
  names(x) <- sheets
  x 
}

# Read all sheets of ABS excel file
read_excel_allsheets_ABS <- function(filename, tibble = FALSE) {
  # but if you would prefer a tibble output, pass tibble = TRUE
  sheets <- readxl::excel_sheets(filename)
  x <- lapply(sheets, function(X) readxl::read_excel(filename, sheet = X, skip = 6))
  if(!tibble) x <- lapply(x, as.data.frame)
  names(x) <- sheets
  x
}

# Read all sheets of BEIS emissions data
read_excel_allsheets_BEIS_emissions_SIC <- function(filename, tibble = FALSE) {
  # but if you would prefer a tibble output, pass tibble = TRUE
  sheets <- readxl::excel_sheets(filename)
  x <- lapply(sheets, function(X) readxl::read_excel(filename, sheet = X, skip = 4))
  if(!tibble) x <- lapply(x, as.data.frame)
  names(x) <- sheets
  x
}

# Read all sheets of ONS emissions data
read_excel_allsheets_ONS <- function(filename, tibble = FALSE) {
  # but if you would prefer a tibble output, pass tibble = TRUE
  sheets <- readxl::excel_sheets(filename)
  x <- lapply(sheets, function(X) readxl::read_excel(filename, sheet = X, skip = 3))
  if(!tibble) x <- lapply(x, as.data.frame)
  names(x) <- sheets
  x
}

# Use the OTS package to extract trade data from the UKTradeInfo API
extractor <- function(x) {
  trade_results <-
    load_ots(
      # The month argument specifies a range in the form of c(min, max)
      month = c(200101, 202212),
      flow = NULL,
      commodity = c(x),
      country = NULL,
      print_url = TRUE,
      join_lookup = FALSE,
      output = "df"
    )
  trade_results <- trade_results %>%
    mutate(search_code = x)
  
  return(trade_results)
}

# *******************************************************************************
# Wrangling functions
# *******************************************************************************

# Clean prodcom sheets
clean_prodcom <- function(df) {
    df %>% drop_na(1) %>%
    clean_names() %>%
    rename("Variable" = 1) %>%
    # filter(!grepl('Note', Variable)) %>%
    filter(!grepl("type change",Variable)) %>%
    filter(Variable != c("SIC Totals and Non Production Headings"))
    
}

#Get first date in the time series
first_date <- function(x){
  a <- floor(min(x, na.rm = TRUE))
}

#Get latest date in the time series by specifying data frame and column e.g. RMC$Date
latest_date <- function(x){
  a <- ceiling(max(x, na.rm = TRUE))
}

#Get penultimate date in the time series by specifying data frame and column e.g. RMC$Date
penultimate_date <- function(x){
  a <- ceiling(max(x, na.rm = TRUE)-1)
}

#Get value in column of choice associated with latest date in time series (a = dataset e.g. RMC, x = column name for value of interest e.g. Quantity, b = date column)
latest_value <- function(a, x, b){
  e <- with(a, x[which.max(b)])
}

#Get penultimate value in column of choice associated with latest date in time series (a = dataset e.g. RMC, x = column name for value of interest e.g. Quantity, b = date column)
penultimate_value <- function(a, x, b){
  a <- with(a, x[which.max(b)-1])
}

# Shorten chart units
addUnits <- function(n) 
{
  labels <- ifelse(n < 1000, n,  # less than thousands
                   ifelse(n < 1e6, paste0(round(n/1e3), 'k'),  # in thousands
                          ifelse(n < 1e9, paste0(round(n/1e6), 'M'),  # in millions
                                 ifelse(n < 1e12, paste0(round(n/1e6), 'M'), # in billions
                                 ))))
  return(labels)
}
