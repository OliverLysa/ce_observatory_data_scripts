# *******************************************************************************
# Require packages
# *******************************************************************************

# Package names
packages <- c(
  "magrittr",
  "writexl",
  "readxl",
  "dplyr",
  "tidyverse",
  "readODS",
  "data.table",
  "janitor",
  "xlsx",
  "tabulizer",
  "docxtractr",
  "campfin",
  "deSolve",
  "gridextra",
  "plyr",
  "gridExtra"
)

# Install packages not yet installed
installed_packages <- packages %in% rownames(installed.packages())
if (any(installed_packages == FALSE)) {
  install.packages(packages[!installed_packages])
}

# Packages loading
invisible(lapply(packages, library, character.only = TRUE))

# Set time period and step
START <- 2015
FINISH <- 2030
STEP <- 0.25
simtime <- seq(START, FINISH, by = STEP)

# Set stock capacity, growth and decline rates
stocks <- c(sCustomers = 10000)
auxs <- c(aGrowthFraction = 0.08, aDeclineFraction = 0.03)

# Create the function and returns a list
model <- function(time, stocks, auxs){
  with(as.list(c(stocks, auxs)), {
    fRecruits <- sCustomers * aGrowthFraction
    fLosses <- sCustomers * aDeclineFraction
    dC_dt <- fRecruits - fLosses
    return (list(c(dC_dt),
                 Recruits = fRecruits, Losses = fLosses,
                 GF = aGrowthFraction, DF = aDeclineFraction))
  }) 
}

# Create the data frame using the `ode` function
o <- data.frame(ode(y = stocks, times = simtime, func = model,
                    parms = auxs, method = "euler"))

head(o)

# Set the time period and step. Define the stocks and auxiliaries.
START <- 0
FINISH <- 100
STEP <- 0.25
simtime <- seq(START, FINISH, by = STEP)
stocks <- c(sStock = 100)
auxs <- c(aCapacity = 10000, 
          aRef.Availability = 1,
          aRef.GrowthRate = 0.10)

# Create the function
model <- function(time, stocks, auxs){
  with(as.list(c(stocks, auxs)),{
    aAvailability <- 1 - sStock / aCapacity
    aEffect <- aAvailability / aRef.Availability
    aGrowth.Rate <- aRef.GrowthRate * aEffect
    fNet.Flow <- sStock * aGrowth.Rate
    dS_dt <- fNet.Flow
    return(list(c(dS_dt), NetFlow = fNet.Flow,
                GrowthRate = aGrowth.Rate, 
                Effect = aEffect,
                Availability = aAvailability))
  })
}

# Create the data frame
sModel <- data.frame(ode(y = stocks, times = simtime, func = model,
                         parms = auxs, method = "euler"))

head(sModel)