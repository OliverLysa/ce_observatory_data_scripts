# R Stan

# *******************************************************************************
# Require packages
# *******************************************************************************

# Install C++ toolchain
remotes::install_github("coatless-mac/macrtools")
macrtools::macos_rtools_install()

# Install R stan
install.packages("rstan", repos = c('https://stan-dev.r-universe.dev', getOption("repos")))

dotR <- file.path(Sys.getenv("HOME"), ".R")
if (!file.exists(dotR)) dir.create(dotR)
M <- file.path(dotR, "Makevars")
if (!file.exists(M)) file.create(M)
arch <- ifelse(R.version$arch == "aarch64", "arm64", "x86_64")
cat(paste("\nCXX17FLAGS += -O3 -mtune=native -arch", arch, "-ftemplate-depth-256"),
    file = M, sep = "\n", append = FALSE)

library("rstan") # observe startup messages

options(mc.cores = parallel::detectCores())

rstan_options(auto_write = TRUE)

