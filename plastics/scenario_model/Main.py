import pysd

import sys

import pandas as pd

import os

import json


# Ensure model file exists

model_path = 'Policy1and2_V6.mdl'

if not os.path.exists(model_path):

    print("Error: Model file not found.")

    sys.exit(1)



# Ensure rates file exists

rates_file = 'rates.csv'

if not os.path.exists(rates_file):

    print("Error: Rates file not found.")

    sys.exit(1)



# Ensure time-series data file exists

time_series_file = 'projection_detailed_total_vensim_input.csv'

if not os.path.exists(time_series_file):

    print("Error: Time-series file not found.")

    sys.exit(1)



# Read rates.csv to extract parameter values

rates_df = pd.read_csv(rates_file)

rates_df.columns = rates_df.columns.str.lower()



# Ensure required columns exist

if 'variablename' not in rates_df.columns or 'value' not in rates_df.columns:

    print("Error: rates.csv must contain 'variablename' and 'value' columns.")

    sys.exit(1)



try:
    frontend_params = sys.argv[1] 
    frontend_params = json.loads(frontend_params) 
    
    for key, value in frontend_params.items():
        if isinstance(value, str) and value.isdigit():
            frontend_params[key] = int(value)
        elif isinstance(value, str):
            try:
                frontend_params[key] = float(value)
            except ValueError:
                pass 

except (IndexError, json.JSONDecodeError) as e:
    print("Error parsing input, using default values:", e)
    frontend_params = { "policy1 introduction time": 2040, "policy2 introduction time": 2027 }



# Convert rates file to dictionary

rates_dict = dict(zip(rates_df['variablename'], rates_df['value']))

merged_params = { **rates_dict, **frontend_params }

print("merged_params", merged_params)


# Import the model

model = pysd.read_vensim(model_path)



# Get all available model parameters

model_doc = model.doc

if isinstance(model_doc, pd.DataFrame):

    model_params = model_doc["Real Name"].tolist()

else:

    model_params = list(model_doc.keys())



# Filter valid parameters

valid_params = {var: val for var, val in merged_params.items() if var in model_params}

invalid_params = {var: val for var, val in merged_params.items() if var not in model_params}



if invalid_params:

    print("\nWarning: The following parameters were found in rates.csv but do not exist in the model:")

    for var in invalid_params:

        print(f"  - {var}")



# Read time-series data from projection_detailed_total_vensim_input.csv

time_series_df = pd.read_csv(time_series_file)

time_series_df = time_series_df[["variable", "material", "application", "year", "total"]]



time_series_df["model_variable"] = (

    time_series_df["variable"].str.replace(" ", "_") + "_" +

    time_series_df["material"].str.replace(" ", "_") + "_" +

    time_series_df["application"].str.replace(" ", "_")

)



time_series_dict = {}

for name, group in time_series_df.groupby("model_variable"):

    years = group["year"].tolist()

    values = group["total"].tolist()

    time_series_dict[name] = pd.Series(data=values, index=years)



# Set time-series components in the model

model.set_components(time_series_dict)



# Run the model with the valid parameters

model = model.run(params=valid_params)



# Drop the first five columns safely

model = model.drop(model.columns[:5], axis=1)



# Reset index to bring it as a column

model = model.reset_index()



# Rename 'index' column if necessary

if 'index' in model.columns:

    model.rename(columns={'index': 'Time'}, inplace=True)

elif 'time' in model.columns:

    model.rename(columns={'time': 'Time'}, inplace=True)



# Convert to long-format

model = model.melt(id_vars='Time', var_name='variable', value_name='value')



# Rename time column

model.rename(columns={'Time': 'year'}, inplace=True)



# Make an application column

model['application'] = model['variable'].str.rsplit(' ', n=2).str[2]



# Make a material column

model['material'] = model['variable'].str.rsplit(' ', n=2).str[1]



# Delete everything after 2nd space from the right in the variable column

model['variable'] = model['variable'].str.rsplit(' ', n=2).str.get(0)



# Make material column uppercase

model['material'] = model['material'].str.upper()



# Make application column a sentence with an uppercase first letter

model['application'] = model['application'].str.capitalize() 



# Replacements

model['material'] = model['material'].str.replace('PT','PP')

model['material'] = model['material'].str.replace('OTHER','Other')

model['material'] = model['material'].str.replace('IDPE','LDPE')

model['application'] = model['application'].str.replace('Ptt','PTT')



# Delete



model = model[~model['application'].str.contains('Time')]



# Update variable names



model['variable'] = model['variable'].str.replace('Total pom','Placed on market')



model['variable'] = model['variable'].str.replace('Total POM','Placed on market')



model.rename(columns={'material': 'material_sub_type'}, inplace=True)



string_list = ['Placed on market', 'littering', 'Mechanical recycling']



model = model[model['variable'].isin(string_list)]



model["scenario"] = "custom"



# Save to CSV

model.to_csv('model_output.csv', index=False)

print("\nScript Done")
