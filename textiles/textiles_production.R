
# Read in the codes of interest
codes <- 
  read_xlsx("./classifications/textiles/textiles_classification.xlsx", 
            sheet = 3) %>%
  # Get first column
  select(1) %>%
  # Remove NAs
  na.omit() %>%
  rename(codes = 1) %>%
  # Add column showing SIC Section
  mutate(section=ifelse(grepl("Manufacturing|Wholesale|Services",codes), codes, NA)) %>%
  fill(section, .direction = "down") %>%
  # Filter out rows without codes in code column
  filter(! codes %in% c("Manufacturing",
                        "Wholesale",
                        "Services")) %>%
  # Construct 4 digit
  separate(codes, into = paste0("SIC4"), c(4), remove = FALSE)

# Get unique SIC4s
SIC4_unique <- codes %>%
  select(SIC4) %>%
  unique()

# Read in the GVA data and filter
GVA <- 
  read_xlsx("./cleaned_data/ABS_all.xlsx") %>%
  filter(code %in% SIC4_unique$SIC4)

write_xlsx(GVA,
           "./cleaned_data/ABS_textiles.xlsx")
           