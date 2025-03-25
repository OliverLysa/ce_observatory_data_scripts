import pysd
import sys
import pandas as pd
import os
import json

# Ensure model file exists
model_path = 'Policy1and2_V8.mdl'
if not os.path.exists(model_path):
    print("Error: Model file not found.")
    sys.exit(1)

# Ensure rates file exists
rates_file = 'rates.csv'
if not os.path.exists(rates_file):
    print("Error: Rates file not found.")
    sys.exit(1)

# Ensure time-series data files exist
time_series_file = 'projection_detailed_total_vensim_input.csv'
transfer_rates_file = 'transferrates.csv'
if not os.path.exists(time_series_file):
    print("Error: Time-series file not found.")
    sys.exit(1)
if not os.path.exists(transfer_rates_file):
    print("Error: Transfer rates file not found.")
    sys.exit(1)

# Read rates.csv to extract parameter values
rates_df = pd.read_csv(rates_file)
rates_df.columns = rates_df.columns.str.lower()

# Ensure required columns exist
required_columns = {'policy', 'variablename', 'level', 'material', 'application', 'value'}
if not required_columns.issubset(rates_df.columns):
    print(f"Error: rates.csv must contain {required_columns} columns.")
    sys.exit(1)

# Define scenarios
scenarios = ['low', 'central', 'high']

# Run model for each scenario
all_results = []
for scenario in scenarios:
    scenario_df = rates_df[rates_df['level'] == scenario].copy()
    
    # Construct variable names in the correct format: policy variablename level material application
    scenario_df['full_variable_name'] = (
        scenario_df['policy'] + " " +
        scenario_df['variablename'] + " " +
        scenario_df['level'] + " " +
        scenario_df['material'] + " " +
        scenario_df['application']
    )
    
    # Convert rates file to dictionary
    rates_dict = dict(zip(scenario_df['full_variable_name'], scenario_df['value']))
    
    
    # Define initial values for specific variables
    
    
    initial_values = {
        "policy1 introduction time": 2027,
        "policy2 introduction time": 2043,
        "policy3 introduction time": 2043,
        "policy4 introduction time": 2043
    }

    # Merge initial values with rates_dict
    rates_dict = {**initial_values, **rates_dict}

        
        
        
        
    
    
    #### Calling the Front End Parameters.......
    
    
    
    
    
    
    # Import the model
    model = pysd.read_vensim(model_path)
    
    # Read time-series data
    time_series_df = pd.read_csv(time_series_file)
    time_series_df = time_series_df[["variable", "material", "application", "year", "total"]]
    
    # Construct model variable names
    time_series_df["model_variable"] = (
        time_series_df["variable"] + " " +
        time_series_df["material"] + " " +
        time_series_df["application"]
    )
    
    # Convert time-series data to a dictionary
    time_series_dict = {
        name: pd.Series(data=group["total"].tolist(), index=group["year"].tolist())
        for name, group in time_series_df.groupby("model_variable")
    }
    
    # Read transfer rates data
    transfer_rates_df = pd.read_csv(transfer_rates_file)
    transfer_rates_df = transfer_rates_df[["variable", "material", "application", "year", "value"]]
    
    # Construct model variable names
    transfer_rates_df["model_variable"] = (
        transfer_rates_df["variable"] + " " +
        transfer_rates_df["material"] + " " +
        transfer_rates_df["application"]
    )
    
    # Convert transfer rates data to a dictionary
    transfer_rates_dict = {
        name: pd.Series(data=group["value"].tolist(), index=group["year"].tolist())
        for name, group in transfer_rates_df.groupby("model_variable")
    }
    
    # Merge both time-series data dictionaries
    time_series_dict.update(transfer_rates_dict)
    
    # Set time-series components in the model
    model.set_components(time_series_dict)
    
    # Run the model
    model = model.run(params=rates_dict)
    
    # Process output
    model = model.drop(model.columns[:5], axis=1)
    model = model.reset_index()
    
    # Rename time column
    if 'index' in model.columns:
        model.rename(columns={'index': 'Time'}, inplace=True)
    elif 'time' in model.columns:
        model.rename(columns={'time': 'Time'}, inplace=True)
    
    # Convert to long-format
    model = model.melt(id_vars='Time', var_name='variable', value_name='value')
    
    # Rename time column
    model.rename(columns={'Time': 'year'}, inplace=True)
    
    # Extract variable, material, and application columns from variable names
    #model[['variable', 'material', 'application']] = model['variable'].str.rsplit(n=3, expand=True).iloc[:, 1:]
    model[['variable', 'material', 'application']] = model['variable'].str.rsplit(n=2, expand=True)
    
    
 

    # Assign scenario label
    model['level'] = scenario

    # Replacements
    model['material'] = model['material'].replace({'pe': 'PE', 'ps': 'PS', 'idpe': 'LDPE', 'pvc': 'PVC', 'ldpe': 'LDPE', 'other': 'Other', 'pet': 'PET', 'Pet': 'PET', 'pp': 'PP', 'hdpe': 'HDPE'})
    model['application'] = model['application'].replace({'ptt': 'PTT','bottle': 'Bottle','film': 'Film','other': 'Other'})
    model['level'] = model['level'].replace({'low': 'Low','central': 'Central','high': 'High'})
    
    

    # Keep only required columns
    model = model[['year', 'variable', 'material', 'application', 'level', 'value']]



    
    
    # Append to results
    all_results.append(model)

# Combine all results
total_model_output = pd.concat(all_results, ignore_index=True)



# Filter data: Remove rows where 'variable' or 'application' contains "introduction" or "time" .. this are the 
# unwanted rows in the dataset for exportting
total_model_output = total_model_output[
    ~total_model_output['variable'].str.contains('introduction|time', case=False, na=False) &
    ~total_model_output['application'].str.contains('introduction|time', case=False, na=False)
]

## We can comment out this latter when we want to export all variables again

# Define the list of wanted variables

string_list = ['Total POM', 'littering','Mechanical recycling']
# Filter data to include only variables in the string_list
total_model_output = total_model_output[total_model_output['variable'].isin(string_list)]

total_model_output['variable'] = total_model_output['variable'].replace({'Total POM': 'Placed on market'})
    
# Save output
if not total_model_output.empty:
    total_model_output.to_csv('model_output.csv', index=False)
    print("\nCSV Exported Successfully.")
else:
    print("\nNo data to export. Check filtering conditions.")