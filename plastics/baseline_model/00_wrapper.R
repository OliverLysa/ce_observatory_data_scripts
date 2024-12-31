# Files are organised below to be ran sequentially
# These can be ran from the command line/terminal using the following line:
# Rscript wrapper.R

source(
  "/Users/oliverlysaght/Desktop/ce_observatory_data_scripts/plastics/baseline_model/01_placed_on_market.R"
)
source(
  "/Users/oliverlysaght/Desktop/ce_observatory_data_scripts/plastics/baseline_model/02_stock_outflow.R"
)
source(
  "/Users/oliverlysaght/Desktop/ce_observatory_data_scripts/plastics/baseline_model/03_collection_eol.R"
)
source(
  "/Users/oliverlysaght/Desktop/ce_observatory_data_scripts/plastics/baseline_model/04_packaging_sankey_outturn.R"
)
