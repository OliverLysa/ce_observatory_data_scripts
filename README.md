# CE observatory data processing

## WORK IN PROGRESS 🚀

# Purpose

A collection of scripts to:

1.  extract raw data from public official and emerging sources (incl. via API, web scraping and programmatic download requests) starting from those identified through a [dataset review](https://docs.google.com/spreadsheets/d/11jO8kaYktQ1ueMY1iJoaCl1dJU8r6RDfyxICPB1wFqg/edit#gid=795733331);

2.  transform these through steps including: cleaning and reformatting; grouping by classifications and summarising; data validation, interpolation and extrapolation; calculating key variables/metrics; and

3.  export cleaned data outputs to a PostGreSQL database (supabase) for storage.

Data outputs from these scripts are used to populate the ce-observatory - a dashboard providing for specific resource-product-industry categories, a detailed description using high-quality data of current baseline material and monetary flows as well as wider impacts and alongside the means to make comparison with alternative circular economy configurations.

# How to use

## Software requirements and setup

Scripts in this repository are largely written in the programming language R. Please see [here](https://rstudio-education.github.io/hopr/starting.html) for more information on running R scripts and computer software requirements. Files are packaged within an R Project with relative file paths used to call data inputs and functions. These can be most easily navigated and ran within the R Studio IDE, though this can also be done in the terminal/command line.

The Python programming language has also been used as part of the project in cases where it offers better performance or provides functions not otherwise available in R. Python scripts are largely presented within [Jupyter Notebooks](https://jupyter.org/install) - an open source IDE that requires installing the jupyter-notebook package in your Python environment, more information about which can be found [here](https://www.python.org/downloads/). In some cases, .py Python scripts are also used. These can be viewed and modified in a code editor such as Visual Studio Code and ran in the terminal/command line.

# Folder and file descriptions

## scripts

functions.R

A collection of custom functions regularly used throughout the data processing pipeline and not otherwise provided in R packages.

### Product-group specific scripts

[Electronics scripts readme](https://github.com/OliverLysa/ce_observatory_data_scripts/blob/main/electronics/electronics_readme.md)

# Updates

The observatory has been designed to incorporate new data as it becomes available to help with timely insight, trend assessment, monitoring and evaluation. Data are updated through scheduled extraction scripts.

## Feedback

*If you identify any issues, please contact*: Oliver Lysaght (oliverlysaght\@icloud.com)
