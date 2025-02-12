import pysd
import sys
import pandas as pd
import json

try:
    obj = sys.argv[1] 
    obj = json.loads(obj) 
    
    for key, value in obj.items():
        if isinstance(value, str) and value.isdigit():
            obj[key] = int(value)
        elif isinstance(value, str):
            try:
                obj[key] = float(value)
            except ValueError:
                pass 

except (IndexError, json.JSONDecodeError) as e:
    print("Error parsing input, using default values:", e)
    obj = { "policy1 introduction time": 2027, "policy2 introduction time": 2027 }


# Import the model
model = pysd.read_vensim('All_Materials_V8.mdl')

# Define input parameters for the scenario - taken as constant here
model = model.run(params=obj)

# Drop unnecessary columns by index

model = model.drop(columns=model.columns[[0, 1, 2, 3, 4]])



# Reset index to bring it as a column

model = model.reset_index()



# Rename the time column if it exists

if 'time' in model.columns:

    model.rename(columns={'time': 'Time'}, inplace=True)



# Convert to long-format (OL PC)

model = model.melt(id_vars='Time', var_name='variable', value_name='value')



# Rename column name (OL PC)

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



# Save the result to a CSV file

model.to_csv('model_output.csv', index=False)



print("Script Done")
