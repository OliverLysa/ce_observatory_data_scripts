# CE observatory data processing

# Purpose

A collection of scripts to:

1.  extract raw data from public official and emerging sources (incl. via API, web scraping and programmatic download requests) starting from those identified through a [dataset review](https://docs.google.com/spreadsheets/d/11jO8kaYktQ1ueMY1iJoaCl1dJU8r6RDfyxICPB1wFqg/edit#gid=795733331);

2.  transform these through steps including: cleaning and reformatting; data validation, interpolation and extrapolation; and calculating key variables/metrics; and

3.  export cleaned data outputs to a PostGreSQL database.

Data outputs from these scripts are used to populate the ce data observatory - a dashboard providing, for specific resource-product-industry categories, a detailed description of current baseline material and monetary flows as well as wider impacts. Alongside, the means to make comparison with alternative circular economy configurations is provided for through systems dynamics modelling.

# How to use

## Software requirements and setup

Many scripts in this repository are written in the programming language R. Please see [here](https://rstudio-education.github.io/hopr/starting.html) for more information on running R scripts and software requirements. Files are packaged within an R Project with relative file paths used to call data inputs and functions. These can be most easily navigated and ran within the R Studio IDE. Download the whole repository for this, open the R Project within R Studio and run the scripts. 

The Python programming language has also been used as part of the project. Python scripts are in some cases presented within [Jupyter Notebooks](https://jupyter.org/install) - an open source IDE that requires installing the jupyter-notebook package in your Python environment, more information about which can be found [here](https://www.python.org/downloads/). In some cases, .py Python scripts are also used. These can be viewed and modified in a code editor such as Visual Studio Code and ran within the code editor or in the terminal/command line.

The javascript programming language has also been used for some scripts. With node installed (read more [here](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)), these can be ran from the terminal by, within the project folder, running 'node name of script.js'.

## Feedback

If you identify any issues, please contact: Oliver Lysaght (oliverlysaght\@icloud.com)
