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

# Plots and output
p1<-ggplot()+
  geom_line(data=o,aes(time,o$sCustomers,color="Customers"))+
  scale_y_continuous(labels = scales::comma)+
  ylab("Stock")+
  xlab("Year") +
  labs(color="")+
  theme(legend.position="none")

p2<-ggplot()+
  geom_line(data=o,aes(time,o$Losses,color="Losses"))+
  geom_line(data=o,aes(time,o$Recruits,color="Recruits"))+
  scale_y_continuous(labels = scales::comma)+
  ylab("Flows")+
  xlab("Year") +
  labs(color="")+
  theme(legend.position="none")

p3<-grid.arrange(p1, p2,nrow=2, ncol=1)
