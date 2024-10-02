import os
import pysd
import pandas as pd
import numpy as np
import fileinput
import functools as ft
import sys
import shutil

# Ways to speed up the script
# Multi-processing within scripts

# Specify the directory where your CSV files are located
# directory = r'/Users/oliverlysaght/Desktop/backend_2/ce-observatory-backend/src/python/ree-model/EV'
# Load the saved stock data CSV file or create an empty DataFrame
# baseline_data = pd.read_csv('EVs baseline use stock.csv')
# Assume each entry in the 'Time' column represents one month, starting from January 1986
# Convert the 'Time' column to years by averaging data over each year
# baseline_data['Year'] = (baseline_data['Time'] // 12) + 1986
# Now group by the 'Year' column and average the 'Use stock' for each year to smooth
# yearly_data = baseline_data.groupby('Year')['Use stock'].mean().reset_index()

# Import first dataset
df1 = pd.read_csv('EVs Extraction demand_shifted.csv')

# Define a function to update models and the plot
def update_models():
    # Get the current slider values
    try:
        recycling = float(sys.argv[1])
        refurbish = float(sys.argv[2])
        remanufacture = float(sys.argv[3])
        resale = float(sys.argv[4])
        mining = float(sys.argv[5])
        time_in_stock_7 = float(sys.argv[6])
    except IndexError:
        recycling = 1
        refurbish = 0
        remanufacture = 0
        resale = 0
        mining = 0
        time_in_stock_7 = 14
        
    # Load your models (model1, model1_1, model2, model2_1, model3, model3_1)
    model1 = pysd.read_vensim('Final simple1.mdl', data_files=["EVs Extraction demand_shifted.csv"])
    model1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    ###Define the mapping of old column names to new column names
    columns = [
        "minus_extract_20a",
        "minus_extract_19a",
        "minus_extract_18a",
        "minus_extract_17a",
        "minus_extract_16a",
    ]
    for col in columns:
        output_filename = f"{col}.csv"
        model1.run(
            params=None,
            return_columns=[col],
            return_timestamps=None,
            final_time=670,
            output_file=output_filename,
        )
    # Define the mapping of old column names to new column names
    column_mapping = {
        "minus_extract_20a": "Minus extract 20",
        "minus_extract_19a": "Minus extract 19",
        "minus_extract_18a": "Minus extract 18",
        "minus_extract_17a": "Minus extract 17",
        "minus_extract_16a": "Minus extract 16",
    }
    for old_col, new_col in column_mapping.items():
        # Construct the filename
        output_filename = f"{old_col}.csv"
        # Read the CSV file into a DataFrame
        dfminus1 = pd.read_csv(output_filename)
        # Rename the column
        dfminus1.rename(columns={old_col: new_col}, inplace=True)
        # Save the updated DataFrame back to the CSV file
        dfminus1.to_csv(output_filename, index=False)
    # Load the data from a CSV file
    dfminus16 = pd.read_csv("minus_extract_16a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    dfminus16["Minus extract 16"] = dfminus16["Minus extract 16"].shift(-42)
    # Fill the last 6 rows with zeros
    dfminus16["Minus extract 16"] = dfminus16["Minus extract 16"].fillna(0)
    # Save the modified data to a new CSV file
    dfminus16.to_csv("minus_extract_16a_shifted.csv", index=False)
    # Load the data from a CSV file
    dfminus17 = pd.read_csv("minus_extract_17a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    dfminus17["Minus extract 17"] = dfminus17["Minus extract 17"].shift(-39)
    # Fill the last 6 rows with zeros
    dfminus17["Minus extract 17"] = dfminus17["Minus extract 17"].fillna(0)
    # Save the modified data to a new CSV file
    dfminus17.to_csv("minus_extract_17a_shifted.csv", index=False)
    # Load the data from a CSV file
    dfminus18 = pd.read_csv("minus_extract_18a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    dfminus18["Minus extract 18"] = dfminus18["Minus extract 18"].shift(-36)
    # Fill the last 6 rows with zeros
    dfminus18["Minus extract 18"] = dfminus18["Minus extract 18"].fillna(0)
    # Save the modified data to a new CSV file
    dfminus18.to_csv("minus_extract_18a_shifted.csv", index=False)
    # Load the data from a CSV file
    dfminus19 = pd.read_csv("minus_extract_19a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    dfminus19["Minus extract 19"] = dfminus19["Minus extract 19"].shift(-24)
    # Fill the last 6 rows with zeros
    dfminus19["Minus extract 19"] = dfminus19["Minus extract 19"].fillna(0)
    # Save the modified data to a new CSV file
    dfminus19.to_csv("minus_extract_19a_shifted.csv", index=False)
    #Load the data from a CSV file
    dfminus20 = pd.read_csv('minus_extract_20a.csv')
    #Shift the 'Extraction demand' column 6 periods back
    dfminus20['Minus extract 20'] = dfminus20['Minus extract 20'].shift(-12)
    #Fill the last 6 rows with zeros
    dfminus20['Minus extract 20'] = dfminus20['Minus extract 20'].fillna(0)
    #Save the modified data to a new CSV file
    dfminus20.to_csv('minus_extract_20a_shifted.csv', index=False)
    model1_1 = pysd.read_vensim("Final simple1-1.mdl", data_files=[
    "EVs Extraction demand_shifted.csv",
    "minus_extract_16a_shifted.csv",
    "minus_extract_17a_shifted.csv",
    "minus_extract_18a_shifted.csv",
    "minus_extract_19a_shifted.csv",
    "minus_extract_20a_shifted.csv",   
    ],)
    model1_1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    
    model1_1.run(
        params=None,
        return_columns=["Tobeinput1"],
        return_timestamps=None,
        final_time=670,
        output_file="Input1.csv",
    )
    file_name = "Input1.csv"
    # Specify the old variable name and the new variable name
    old_variable_name = "Tobeinput1"
    new_variable_name = "Input1"
    # Open the file in read mode
    with fileinput.FileInput(file_name, inplace=True) as file:
        # Iterate over the lines in the file
        for line in file:
            # Replace the old variable name with the new variable name
            line = line.replace(old_variable_name, new_variable_name)
            # Print the modified line to the file
            print(line, end="")
    # Load the data from the tab file into a DataFrame
    df2 = pd.read_csv("Input1.csv")
    # Load the data from a CSV file
    df2 = pd.read_csv("Input1.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df2["Input1"] = df2["Input1"].shift(-45)
    # Fill the last 6 rows with zeros
    df2["Input1"] = df2["Input1"].fillna(0)
    # Save the modified data to a new CSV file
    df2.to_csv("Input1_shifted.csv", index=False)
    # Read the CSV file with the "Time" and "Input1" columns
    df2 = pd.read_csv("Input1_shifted.csv")
    # Convert the relevant columns to numpy arrays
    time = df2["Time"].to_numpy()
    input1 = df2["Input1"].to_numpy()
    # Step 2: Merge the two DataFrames based on the 'Time' column
    merged_df1 = pd.merge(df1, df2, on="Time", how="outer")
    # Step 4: Create a new column 'Extraction demand' that is the sum of 'Input1' and 'Extraction demand'
    merged_df1["Extraction demand"] = (
        merged_df1["Input1"] + merged_df1["Extraction demand"]
    ).round(9)
    # Step 5: Create a new DataFrame with only the 'Time' and 'Extraction demand' columns
    result_df1 = merged_df1[["Time", "Extraction demand"]]
    # Step 6: Save the resulting DataFrame to a new CSV file
    result_df1.to_csv(
        "combined1_data.csv", index=False
    )  # 'combined_data.csv' is the output file
    model2 = pysd.read_vensim("Final simple2.mdl", data_files=["combined1_data.csv"])
    model2.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    
    columns = [
        "minus2_extract_20a",
        "minus2_extract_19a",
        "minus2_extract_18a",
        "minus2_extract_17a",
        "minus2_extract_16a",
    ]
    for col in columns:
        output_filename = f"{col}.csv"
        model2.run(
            params=None,
            return_columns=[col],
            return_timestamps=None,
            final_time=670,
            output_file=output_filename,
        )
    # Define the mapping of old column names to new column names
    column_mapping = {
        "minus2_extract_20a": "Minus2 extract 20",
        "minus2_extract_19a": "Minus2 extract 19",
        "minus2_extract_18a": "Minus2 extract 18",
        "minus2_extract_17a": "Minus2 extract 17",
        "minus2_extract_16a": "Minus2 extract 16",
    }
    for old_col, new_col in column_mapping.items():
        # Construct the filename
        output_filename = f"{old_col}.csv"
        # Read the CSV file into a DataFrame
        dfminus2 = pd.read_csv(output_filename)
        # Rename the column
        dfminus2.rename(columns={old_col: new_col}, inplace=True)
        # Save the updated DataFrame back to the CSV file
        dfminus2.to_csv(output_filename, index=False)
    # Load the data from a CSV file
    df2minus16 = pd.read_csv("minus2_extract_16a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df2minus16["Minus2 extract 16"] = df2minus16["Minus2 extract 16"].shift(-42)
    # Fill the last 6 rows with zeros
    df2minus16["Minus2 extract 16"] = df2minus16["Minus2 extract 16"].fillna(0)
    # Save the modified data to a new CSV file
    df2minus16.to_csv("minus2_extract_16a_shifted.csv", index=False)
    # Load the data from a CSV file
    df2minus17 = pd.read_csv("minus2_extract_17a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df2minus17["Minus2 extract 17"] = df2minus17["Minus2 extract 17"].shift(-39)
    # Fill the last 6 rows with zeros
    df2minus17["Minus2 extract 17"] = df2minus17["Minus2 extract 17"].fillna(0)
    # Save the modified data to a new CSV file
    df2minus17.to_csv("minus2_extract_17a_shifted.csv", index=False)
    # Load the data from a CSV file
    df2minus18 = pd.read_csv("minus2_extract_18a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df2minus18["Minus2 extract 18"] = df2minus18["Minus2 extract 18"].shift(-36)
    # Fill the last 6 rows with zeros
    df2minus18["Minus2 extract 18"] = df2minus18["Minus2 extract 18"].fillna(0)
    # Save the modified data to a new CSV file
    df2minus18.to_csv("minus2_extract_18a_shifted.csv", index=False)
    # Load the data from a CSV file
    df2minus19 = pd.read_csv("minus2_extract_19a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df2minus19["Minus2 extract 19"] = df2minus19["Minus2 extract 19"].shift(-24)
    # Fill the last 6 rows with zeros
    df2minus19["Minus2 extract 19"] = df2minus19["Minus2 extract 19"].fillna(0)
    # Save the modified data to a new CSV file
    df2minus19.to_csv("minus2_extract_19a_shifted.csv", index=False)
    # Load the data from a CSV file
    df2minus20 = pd.read_csv('minus2_extract_20a.csv')
    #Shift the 'Extraction demand' column 6 periods back
    df2minus20['Minus2 extract 20'] = df2minus20['Minus2 extract 20'].shift(-12)
    #Fill the last 6 rows with zeros
    df2minus20['Minus2 extract 20'] = df2minus20['Minus2 extract 20'].fillna(0)
    #Save the modified data to a new CSV file
    df2minus20.to_csv('minus2_extract_20a_shifted.csv', index=False)
    model2_1 = pysd.read_vensim(
    "Final simple2-1.mdl",
    data_files=[
        "combined1_data.csv",
        "minus2_extract_16a_shifted.csv",
        "minus2_extract_17a_shifted.csv",
        "minus2_extract_18a_shifted.csv",
        "minus2_extract_19a_shifted.csv",
        "minus2_extract_20a_shifted.csv",    
    ],
    )
    model2_1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    model2_1.run(
        params=None,
        return_columns=["Tobeinput2"],
        return_timestamps=None,
        final_time=670,
        output_file="Input2.csv",
    )
    file_name = "Input2.csv"
    # Specify the old variable name and the new variable name
    old_variable_name = "Tobeinput2"
    new_variable_name = "Input2"
    # Open the file in read mode
    with fileinput.FileInput(file_name, inplace=True) as file:
        # Iterate over the lines in the file
        for line in file:
            # Replace the old variable name with the new variable name
            line = line.replace(old_variable_name, new_variable_name)
            # Print the modified line to the file
            print(line, end="")
    # Load the data from the tab file into a DataFrame
    df3 = pd.read_csv("Input2.csv")
    # Load the data from a CSV file
    df4 = pd.read_csv("Input2.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df4["Input2"] = df4["Input2"].shift(-45)
    # Fill the last 6 rows with zeros
    df4["Input2"] = df4["Input2"].fillna(0)
    # Save the modified data to a new CSV file
    df4.to_csv("Input2_shifted.csv", index=False)
    # Load the data from your CSV file
    df4 = pd.read_csv("Input2_shifted.csv")
    # Convert the data to NumPy arrays before plotting
    time = df4["Time"].to_numpy()
    input2 = df4["Input2"].to_numpy()
    # Step 2: Merge the two DataFrames based on the 'Time' column
    merged_df2 = pd.merge(df1, df4, on="Time", how="outer")
    # Step 4: Create a new column 'Extraction demand' that is the sum of 'Input1' and 'Extraction demand'
    merged_df2["Extraction demand"] = (
        merged_df2["Input2"] + merged_df2["Extraction demand"]
    ).round(9)
    # Step 5: Create a new DataFrame with only the 'Time' and 'Extraction demand' columns
    result_df2 = merged_df2[["Time", "Extraction demand"]]
    # Step 6: Save the resulting DataFrame to a new CSV file
    result_df2.to_csv(
        "combined2_data.csv", index=False
    )  # 'combined_data.csv' is the output file
    model3 = pysd.read_vensim("Final simple3.mdl", data_files=["combined2_data.csv"])
    model3.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    columns = [
        "minus3_extract_20a",
        "minus3_extract_19a",
        "minus3_extract_18a",
        "minus3_extract_17a",
        "minus3_extract_16a",
    ]
    for col in columns:
        output_filename = f"{col}.csv"
        model3.run(
            params=None,
            return_columns=[col],
            return_timestamps=None,
            final_time=670,
            output_file=output_filename,
        )
    # Define the mapping of old column names to new column names
    column_mapping = {
        "minus3_extract_20a": "Minus3 extract 20",
        "minus3_extract_19a": "Minus3 extract 19",
        "minus3_extract_18a": "Minus3 extract 18",
        "minus3_extract_17a": "Minus3 extract 17",
        "minus3_extract_16a": "Minus3 extract 16",
    }
    for old_col, new_col in column_mapping.items():
        # Construct the filename
        output_filename = f"{old_col}.csv"
        # Read the CSV file into a DataFrame
        dfminus3 = pd.read_csv(output_filename)
        # Rename the column
        dfminus3.rename(columns={old_col: new_col}, inplace=True)
        # Save the updated DataFrame back to the CSV file
        dfminus3.to_csv(output_filename, index=False)
    # Load the data from a CSV file
    df3minus16 = pd.read_csv("minus3_extract_16a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df3minus16["Minus3 extract 16"] = df3minus16["Minus3 extract 16"].shift(-42)
    # Fill the last 6 rows with zeros
    df3minus16["Minus3 extract 16"] = df3minus16["Minus3 extract 16"].fillna(0)
    # Save the modified data to a new CSV file
    df3minus16.to_csv("minus3_extract_16a_shifted.csv", index=False)
    # Load the data from a CSV file
    df3minus17 = pd.read_csv("minus3_extract_17a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df3minus17["Minus3 extract 17"] = df3minus17["Minus3 extract 17"].shift(-39)
    # Fill the last 6 rows with zeros
    df3minus17["Minus3 extract 17"] = df3minus17["Minus3 extract 17"].fillna(0)
    # Save the modified data to a new CSV file
    df3minus17.to_csv("minus3_extract_17a_shifted.csv", index=False)
    # Load the data from a CSV file
    df3minus18 = pd.read_csv("minus3_extract_18a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df3minus18["Minus3 extract 18"] = df3minus18["Minus3 extract 18"].shift(-36)
    # Fill the last 6 rows with zeros
    df3minus18["Minus3 extract 18"] = df3minus18["Minus3 extract 18"].fillna(0)
    # Save the modified data to a new CSV file
    df3minus18.to_csv("minus3_extract_18a_shifted.csv", index=False)
    # Load the data from a CSV file
    df3minus19 = pd.read_csv("minus3_extract_19a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df3minus19["Minus3 extract 19"] = df3minus19["Minus3 extract 19"].shift(-24)
    # Fill the last 6 rows with zeros
    df3minus19["Minus3 extract 19"] = df3minus19["Minus3 extract 19"].fillna(0)
    # Save the modified data to a new CSV file
    df3minus19.to_csv("minus3_extract_19a_shifted.csv", index=False)
    #Load the data from a CSV file
    df3minus20 = pd.read_csv('minus3_extract_20a.csv')
    #Shift the 'Extraction demand' column 6 periods back
    df3minus20['Minus3 extract 20'] = df3minus20['Minus3 extract 20'].shift(-12)
    #Fill the last 6 rows with zeros
    df3minus20['Minus3 extract 20'] = df3minus20['Minus3 extract 20'].fillna(0)
    #Save the modified data to a new CSV file
    df3minus20.to_csv('minus3_extract_20a_shifted.csv', index=False)  
    model3_1 = pysd.read_vensim(
    "Final simple3-1.mdl",
    data_files=[
        "combined2_data.csv",
        "minus3_extract_16a_shifted.csv",
        "minus3_extract_17a_shifted.csv",
        "minus3_extract_18a_shifted.csv",
        "minus3_extract_19a_shifted.csv",
        "minus3_extract_20a_shifted.csv",
    ],
    )
    model3_1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    model3_1.run(
        params=None,
        return_columns=["Tobeinput3"],
        return_timestamps=None,
        final_time=670,
        output_file="Input3.csv",
    )
    file_name = "Input3.csv"
    # Specify the old variable name and the new variable name
    old_variable_name = "Tobeinput3"
    new_variable_name = "Input3"
    # Open the file in read mode
    with fileinput.FileInput(file_name, inplace=True) as file:
        # Iterate over the lines in the file
        for line in file:
            # Replace the old variable name with the new variable name
            line = line.replace(old_variable_name, new_variable_name)
            # Print the modified line to the file
            print(line, end="")
    # Load the data from the tab file into a DataFrame
    df5 = pd.read_csv("Input3.csv")
    # Load the data from a CSV file
    df6 = pd.read_csv("Input3.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df6["Input3"] = df6["Input3"].shift(-45)
    # Fill the last 6 rows with zeros
    df6["Input3"] = df6["Input3"].fillna(0)
    # Save the modified data to a new CSV file
    df6.to_csv("Input3_shifted.csv", index=False)
    # Load the data from your CSV file
    df6 = pd.read_csv("Input3_shifted.csv")
    # Convert the data to NumPy arrays before plotting
    time = df6["Time"].to_numpy()
    input3 = df6["Input3"].to_numpy()
    # Step 2: Merge the two DataFrames based on the 'Time' column
    merged_df3 = pd.merge(df1, df6, on="Time", how="outer")
    # Step 4: Create a new column 'Extraction demand' that is the sum of 'Input1' and 'Extraction demand'
    merged_df3["Extraction demand"] = (
        merged_df3["Input3"] + merged_df3["Extraction demand"]
    ).round(9)
    # Step 5: Create a new DataFrame with only the 'Time' and 'Extraction demand' columns
    result_df3 = merged_df3[["Time", "Extraction demand"]]
    # Step 6: Save the resulting DataFrame to a new CSV file
    result_df3.to_csv(
        "combined3_data.csv", index=False
    )  # 'combined_data.csv' is the output file
    
    model4 = pysd.read_vensim("Final simple4.mdl", data_files=["combined3_data.csv"])
    model4.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    columns = [
        "minus4_extract_20a",
        "minus4_extract_19a",
        "minus4_extract_18a",
        "minus4_extract_17a",
        "minus4_extract_16a",
    ]
    for col in columns:
        output_filename = f"{col}.csv"
        model4.run(
            params=None,
            return_columns=[col],
            return_timestamps=None,
            final_time=670,
            output_file=output_filename,
        )
    # Define the mapping of old column names to new column names
    column_mapping = {
        "minus4_extract_20a": "Minus4 extract 20",
        "minus4_extract_19a": "Minus4 extract 19",
        "minus4_extract_18a": "Minus4 extract 18",
        "minus4_extract_17a": "Minus4 extract 17",
        "minus4_extract_16a": "Minus4 extract 16",
    }
    for old_col, new_col in column_mapping.items():
        # Construct the filename
        output_filename = f"{old_col}.csv"
        # Read the CSV file into a DataFrame
        dfminus4 = pd.read_csv(output_filename)
        # Rename the column
        dfminus4.rename(columns={old_col: new_col}, inplace=True)
        # Save the updated DataFrame back to the CSV file
        dfminus4.to_csv(output_filename, index=False)
    # Load the data from a CSV file
    df4minus16 = pd.read_csv("minus4_extract_16a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df4minus16["Minus4 extract 16"] = df4minus16["Minus4 extract 16"].shift(-42)
    # Fill the last 6 rows with zeros
    df4minus16["Minus4 extract 16"] = df4minus16["Minus4 extract 16"].fillna(0)
    # Save the modified data to a new CSV file
    df4minus16.to_csv("minus4_extract_16a_shifted.csv", index=False)
    # Load the data from a CSV file
    df4minus17 = pd.read_csv("minus4_extract_17a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df4minus17["Minus4 extract 17"] = df4minus17["Minus4 extract 17"].shift(-39)
    # Fill the last 6 rows with zeros
    df4minus17["Minus4 extract 17"] = df4minus17["Minus4 extract 17"].fillna(0)
    # Save the modified data to a new CSV file
    df4minus17.to_csv("minus4_extract_17a_shifted.csv", index=False)
    # Load the data from a CSV file
    df4minus18 = pd.read_csv("minus4_extract_18a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df4minus18["Minus4 extract 18"] = df4minus18["Minus4 extract 18"].shift(-36)
    # Fill the last 6 rows with zeros
    df4minus18["Minus4 extract 18"] = df4minus18["Minus4 extract 18"].fillna(0)
    # Save the modified data to a new CSV file
    df4minus18.to_csv("minus4_extract_18a_shifted.csv", index=False)
    # Load the data from a CSV file
    df4minus19 = pd.read_csv("minus4_extract_19a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df4minus19["Minus4 extract 19"] = df4minus19["Minus4 extract 19"].shift(-24)
    # Fill the last 6 rows with zeros
    df4minus19["Minus4 extract 19"] = df4minus19["Minus4 extract 19"].fillna(0)
    # Save the modified data to a new CSV file
    df4minus19.to_csv("minus4_extract_19a_shifted.csv", index=False)
    #Load the data from a CSV file
    df4minus20 = pd.read_csv('minus4_extract_20a.csv')
    #Shift the 'Extraction demand' column 6 periods back
    df4minus20['Minus4 extract 20'] = df4minus20['Minus4 extract 20'].shift(-12)
    #Fill the last 6 rows with zeros
    df4minus20['Minus4 extract 20'] = df4minus20['Minus4 extract 20'].fillna(0)
    #Save the modified data to a new CSV file
    df4minus20.to_csv('minus4_extract_20a_shifted.csv', index=False)  
    model4_1 = pysd.read_vensim(
    "Final simple4-1.mdl",
    data_files=[
        "combined3_data.csv",
        "minus4_extract_16a_shifted.csv",
        "minus4_extract_17a_shifted.csv",
        "minus4_extract_18a_shifted.csv",
        "minus4_extract_19a_shifted.csv",
        "minus4_extract_20a_shifted.csv",
    ],
    )
    model4_1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    model4_1.run(
        params=None,
        return_columns=["Tobeinput4"],
        return_timestamps=None,
        final_time=670,
        output_file="Input4.csv",
    )
    file_name = "Input4.csv"
    # Specify the old variable name and the new variable name
    old_variable_name = "Tobeinput4"
    new_variable_name = "Input4"
    # Open the file in read mode
    with fileinput.FileInput(file_name, inplace=True) as file:
        # Iterate over the lines in the file
        for line in file:
            # Replace the old variable name with the new variable name
            line = line.replace(old_variable_name, new_variable_name)
            # Print the modified line to the file
            print(line, end="")
    # Load the data from the tab file into a DataFrame
    df7 = pd.read_csv("Input4.csv")
    # Load the data from a CSV file
    df8 = pd.read_csv("Input4.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df8["Input4"] = df8["Input4"].shift(-45)
    # Fill the last 6 rows with zeros
    df8["Input4"] = df8["Input4"].fillna(0)
    # Save the modified data to a new CSV file
    df8.to_csv("Input4_shifted.csv", index=False)
    # Load the data from your CSV file
    df8 = pd.read_csv("Input4_shifted.csv")
    # Convert the data to NumPy arrays before plotting
    time = df8["Time"].to_numpy()
    input4 = df8["Input4"].to_numpy()
    # Step 2: Merge the two DataFrames based on the 'Time' column
    merged_df4 = pd.merge(df1, df8, on="Time", how="outer")
    # Step 4: Create a new column 'Extraction demand' that is the sum of 'Input1' and 'Extraction demand'
    merged_df4["Extraction demand"] = (
        merged_df4["Input4"] + merged_df4["Extraction demand"]
    ).round(9)
    # Step 5: Create a new DataFrame with only the 'Time' and 'Extraction demand' columns
    result_df4 = merged_df4[["Time", "Extraction demand"]]
    # Step 6: Save the resulting DataFrame to a new CSV file
    result_df4.to_csv(
        "combined4_data.csv", index=False
    )  # 'combined_data.csv' is the output file
    
    model5 = pysd.read_vensim("Final simple5.mdl", data_files=["combined4_data.csv"])
    model5.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    columns = [
        "minus5_extract_20a",
        "minus5_extract_19a",
        "minus5_extract_18a",
        "minus5_extract_17a",
        "minus5_extract_16a",
    ]
    for col in columns:
        output_filename = f"{col}.csv"
        model5.run(
            params=None,
            return_columns=[col],
            return_timestamps=None,
            final_time=670,
            output_file=output_filename,
        )
    # Define the mapping of old column names to new column names
    column_mapping = {
        "minus5_extract_20a": "Minus5 extract 20",
        "minus5_extract_19a": "Minus5 extract 19",
        "minus5_extract_18a": "Minus5 extract 18",
        "minus5_extract_17a": "Minus5 extract 17",
        "minus5_extract_16a": "Minus5 extract 16",
    }
    for old_col, new_col in column_mapping.items():
        # Construct the filename
        output_filename = f"{old_col}.csv"
        # Read the CSV file into a DataFrame
        dfminus5 = pd.read_csv(output_filename)
        # Rename the column
        dfminus5.rename(columns={old_col: new_col}, inplace=True)
        # Save the updated DataFrame back to the CSV file
        dfminus5.to_csv(output_filename, index=False)
    # Load the data from a CSV file
    df5minus16 = pd.read_csv("minus5_extract_16a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df5minus16["Minus5 extract 16"] = df5minus16["Minus5 extract 16"].shift(-42)
    # Fill the last 6 rows with zeros
    df5minus16["Minus5 extract 16"] = df5minus16["Minus5 extract 16"].fillna(0)
    # Save the modified data to a new CSV file
    df5minus16.to_csv("minus5_extract_16a_shifted.csv", index=False)
    # Load the data from a CSV file
    df5minus17 = pd.read_csv("minus5_extract_17a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df5minus17["Minus5 extract 17"] = df5minus17["Minus5 extract 17"].shift(-39)
    # Fill the last 6 rows with zeros
    df5minus17["Minus5 extract 17"] = df5minus17["Minus5 extract 17"].fillna(0)
    # Save the modified data to a new CSV file
    df5minus17.to_csv("minus5_extract_17a_shifted.csv", index=False)
    # Load the data from a CSV file
    df5minus18 = pd.read_csv("minus5_extract_18a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df5minus18["Minus5 extract 18"] = df5minus18["Minus5 extract 18"].shift(-36)
    # Fill the last 6 rows with zeros
    df5minus18["Minus5 extract 18"] = df5minus18["Minus5 extract 18"].fillna(0)
    # Save the modified data to a new CSV file
    df5minus18.to_csv("minus5_extract_18a_shifted.csv", index=False)
    # Load the data from a CSV file
    df5minus19 = pd.read_csv("minus5_extract_19a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df5minus19["Minus5 extract 19"] = df5minus19["Minus5 extract 19"].shift(-24)
    # Fill the last 6 rows with zeros
    df5minus19["Minus5 extract 19"] = df5minus19["Minus5 extract 19"].fillna(0)
    # Save the modified data to a new CSV file
    df5minus19.to_csv("minus5_extract_19a_shifted.csv", index=False)
    #Load the data from a CSV file
    df5minus20 = pd.read_csv('minus5_extract_20a.csv')
    #Shift the 'Extraction demand' column 6 periods back
    df5minus20['Minus5 extract 20'] = df5minus20['Minus5 extract 20'].shift(-12)
    #Fill the last 6 rows with zeros
    df5minus20['Minus5 extract 20'] = df5minus20['Minus5 extract 20'].fillna(0)
    #Save the modified data to a new CSV file
    df5minus20.to_csv('minus5_extract_20a_shifted.csv', index=False)  
    model5_1 = pysd.read_vensim(
    "Final simple5-1.mdl",
    data_files=[
        "combined4_data.csv",
        "minus5_extract_16a_shifted.csv",
        "minus5_extract_17a_shifted.csv",
        "minus5_extract_18a_shifted.csv",
        "minus5_extract_19a_shifted.csv",
        "minus5_extract_20a_shifted.csv",
    ],
    )
    model5_1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    model5_1.run(
        params=None,
        return_columns=["Tobeinput5"],
        return_timestamps=None,
        final_time=670,
        output_file="Input5.csv",
    )
    file_name = "Input5.csv"
    # Specify the old variable name and the new variable name
    old_variable_name = "Tobeinput5"
    new_variable_name = "Input5"
    # Open the file in read mode
    with fileinput.FileInput(file_name, inplace=True) as file:
        # Iterate over the lines in the file
        for line in file:
            # Replace the old variable name with the new variable name
            line = line.replace(old_variable_name, new_variable_name)
            # Print the modified line to the file
            print(line, end="")
    # Load the data from the tab file into a DataFrame
    df9 = pd.read_csv("Input5.csv")
    # Load the data from a CSV file
    df10 = pd.read_csv("Input5.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df10["Input5"] = df10["Input5"].shift(-45)
    # Fill the last 6 rows with zeros
    df10["Input5"] = df10["Input5"].fillna(0)
    # Save the modified data to a new CSV file
    df10.to_csv("Input5_shifted.csv", index=False)
    # Load the data from your CSV file
    df10 = pd.read_csv("Input5_shifted.csv")
    # Convert the data to NumPy arrays before plotting
    time = df10["Time"].to_numpy()
    input5 = df10["Input5"].to_numpy()
    # Step 2: Merge the two DataFrames based on the 'Time' column
    merged_df5 = pd.merge(df1, df10, on="Time", how="outer")
    # Step 4: Create a new column 'Extraction demand' that is the sum of 'Input1' and 'Extraction demand'
    merged_df5["Extraction demand"] = (
        merged_df5["Input5"] + merged_df5["Extraction demand"]
    ).round(9)
    # Step 5: Create a new DataFrame with only the 'Time' and 'Extraction demand' columns
    result_df5 = merged_df5[["Time", "Extraction demand"]]
    # Step 6: Save the resulting DataFrame to a new CSV file
    result_df5.to_csv(
        "combined5_data.csv", index=False
    )  # 'combined_data.csv' is the output file
    
    model6 = pysd.read_vensim("Final simple6.mdl", data_files=["combined5_data.csv"])
    model6.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    columns = [
        "minus6_extract_20a",
        "minus6_extract_19a",
        "minus6_extract_18a",
        "minus6_extract_17a",
        "minus6_extract_16a",
    ]
    for col in columns:
        output_filename = f"{col}.csv"
        model6.run(
            params=None,
            return_columns=[col],
            return_timestamps=None,
            final_time=670,
            output_file=output_filename,
        )
    # Define the mapping of old column names to new column names
    column_mapping = {
        "minus6_extract_20a": "Minus6 extract 20",
        "minus6_extract_19a": "Minus6 extract 19",
        "minus6_extract_18a": "Minus6 extract 18",
        "minus6_extract_17a": "Minus6 extract 17",
        "minus6_extract_16a": "Minus6 extract 16",
    }
    for old_col, new_col in column_mapping.items():
        # Construct the filename
        output_filename = f"{old_col}.csv"
        # Read the CSV file into a DataFrame
        dfminus6 = pd.read_csv(output_filename)
        # Rename the column
        dfminus6.rename(columns={old_col: new_col}, inplace=True)
        # Save the updated DataFrame back to the CSV file
        dfminus6.to_csv(output_filename, index=False)
    # Load the data from a CSV file
    df6minus16 = pd.read_csv("minus6_extract_16a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df6minus16["Minus6 extract 16"] = df6minus16["Minus6 extract 16"].shift(-42)
    # Fill the last 6 rows with zeros
    df6minus16["Minus6 extract 16"] = df6minus16["Minus6 extract 16"].fillna(0)
    # Save the modified data to a new CSV file
    df6minus16.to_csv("minus6_extract_16a_shifted.csv", index=False)
    # Load the data from a CSV file
    df6minus17 = pd.read_csv("minus6_extract_17a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df6minus17["Minus6 extract 17"] = df6minus17["Minus6 extract 17"].shift(-39)
    # Fill the last 6 rows with zeros
    df6minus17["Minus6 extract 17"] = df6minus17["Minus6 extract 17"].fillna(0)
    # Save the modified data to a new CSV file
    df6minus17.to_csv("minus6_extract_17a_shifted.csv", index=False)
    # Load the data from a CSV file
    df6minus18 = pd.read_csv("minus6_extract_18a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df6minus18["Minus6 extract 18"] = df6minus18["Minus6 extract 18"].shift(-36)
    # Fill the last 6 rows with zeros
    df6minus18["Minus6 extract 18"] = df6minus18["Minus6 extract 18"].fillna(0)
    # Save the modified data to a new CSV file
    df6minus18.to_csv("minus6_extract_18a_shifted.csv", index=False)
    # Load the data from a CSV file
    df6minus19 = pd.read_csv("minus6_extract_19a.csv")
    # Shift the 'Extraction demand' column 6 periods back
    df6minus19["Minus6 extract 19"] = df6minus19["Minus6 extract 19"].shift(-24)
    # Fill the last 6 rows with zeros
    df6minus19["Minus6 extract 19"] = df6minus19["Minus6 extract 19"].fillna(0)
    # Save the modified data to a new CSV file
    df6minus19.to_csv("minus6_extract_19a_shifted.csv", index=False)
    #Load the data from a CSV file
    df6minus20 = pd.read_csv('minus6_extract_20a.csv')
    #Shift the 'Extraction demand' column 6 periods back
    df6minus20['Minus6 extract 20'] = df6minus20['Minus6 extract 20'].shift(-12)
    #Fill the last 6 rows with zeros
    df6minus20['Minus6 extract 20'] = df6minus20['Minus6 extract 20'].fillna(0)
    #Save the modified data to a new CSV file
    df6minus20.to_csv('minus6_extract_20a_shifted.csv', index=False)  
    model6_1 = pysd.read_vensim(
    "Final simple6-1.mdl",
    data_files=[
        "combined5_data.csv",
        "minus6_extract_16a_shifted.csv",
        "minus6_extract_17a_shifted.csv",
        "minus6_extract_18a_shifted.csv",
        "minus6_extract_19a_shifted.csv",
        "minus6_extract_20a_shifted.csv",
    ],
    )
    model6_1.set_components({
        'refurbish_circularity_rate_': refurbish,
        'material_recycling_circularity_rate_': recycling,
        'remanufacture_circualrity_rate_': remanufacture,
        'urban_mining_circularity_rate_': mining,
        'resalereuse_circualrity_rate_': resale,
    })
    # Run the model and get the results DataFrame
    results = model6_1.run(
    return_columns=["Use stock", "Total circulated", "release_rate_6", "release_rate_7", "virgin_material_6",
                    "release_rate_1", "release_rate_2", "release_rate_3", "release_rate_4", "release_rate_5",
                    "release_rate_8", "release_rate_10", "release_rate_11", "release_rate_12", "release_rate_13",
                    "release_rate_14", "release_rate_16", "release_rate_17", "release_rate_18",
                    "release_rate_19", "release_rate_20"],
    return_timestamps=None,
    final_time=670
    )
    # Save the data to CSV files
    results[['Use stock']].to_csv("UseStockOutput.csv", index=False)
    results[['Total circulated']].to_csv("TotalCirculatedOutput.csv", index=False)
    results[['release_rate_6']].to_csv("release_rate_6.csv", index=False)
    results[['release_rate_7']].to_csv("release_rate_7.csv", index=False)
    results[['virgin_material_6']].to_csv("virgin_material_6.csv", index=False)

    # Read back the saved CSV files into separate DataFrames
    updated_data = pd.read_csv('UseStockOutput.csv')
    circulated_data = pd.read_csv('TotalCirculatedOutput.csv')
    release_rate_6_data = pd.read_csv('release_rate_6.csv')
    release_rate_7_data = pd.read_csv('release_rate_7.csv')
    virgin_material_6_data = pd.read_csv('virgin_material_6.csv')
       
    # Assume each row in updated_data and circulated_data represents one month, starting from January 1986
    # We create a 'Year' series by taking the row index, dividing by 12, and adding 1986
    # We use the np.arange to create an array with the same length as the DataFrame
    months = np.arange(len(updated_data))
    years = months // 12 + 1986
    # Update the DataFrame with the 'Year' series
    updated_data['Year'] = years
    circulated_data['Year'] = years
    release_rate_6_data['Year'] = years
    release_rate_7_data['Year'] = years
    virgin_material_6_data['Year'] = years
    
    # Aggregate the data by year using mean to smooth out the plot
    stock_annual = updated_data.groupby('Year').mean().reset_index()
    inflow_secondary_annual = circulated_data.groupby('Year').mean().reset_index()
    inflow_virgin_annual = virgin_material_6_data.groupby('Year').mean().reset_index()
    inflow_total_annual = release_rate_6_data.groupby('Year').mean().reset_index()
    outflow_annual = release_rate_7_data.groupby('Year').mean().reset_index()
    
    # Create a list of the dataframes and combine the list
    dfs1 = [stock_annual,
        inflow_secondary_annual,
        inflow_virgin_annual,
        inflow_total_annual,
        outflow_annual]
    
    df_combined1 = ft.reduce(lambda left, right: pd.merge(left, right, on='Year'), dfs1)
    # Rename the columns
    df_combined1 = df_combined1.rename(columns={"Use stock": "Stock", 
                                "Total circulated": "Inflow secondary",
                                "virgin_material_6": "Inflow virgin",
                                "release_rate_6": "Inflow total",
                                "release_rate_7": "Outflow",
                                "Year": "year"})
    # Pivot to long form
    df_combined1 = pd.melt(df_combined1, id_vars='year', value_vars=['Stock', 
                'Inflow secondary', 
                'Inflow virgin',
                'Inflow total',
                'Outflow'])
    # Add columns matching the baseline data structure
    df_combined1["product"] = "BEV"
    df_combined1["material"] = "Neodymium"
    df_combined1["scenario"] = "custom"
    # Exclude inflow secondary rows
    df_combined1 = df_combined1.loc[df_combined1['variable'] != "Inflow secondary"]
    # Add filter column based on if else
    df_combined1['filter'] = np.where(df_combined1['variable']!= 'Inflow virgin', 'Total', 'Virgin')
    # Convert inflow rows in variable column to all inflows
    df_combined1['variable'] = df_combined1['variable'].replace({'Inflow total': 'Inflow', 'Inflow virgin': 'Inflow'})
    # Multiply value column by 12 where value is not stock (to be updated)
    df_combined1['value'] = np.where(df_combined1['variable']!= 'Stock', df_combined1.value * 12, df_combined1.value)
    # Round
    df_combined1.value = df_combined1.value.div(1000).round(2)
    # Filter years
    df_combined1 = df_combined1[df_combined1['year'] > 1989]
    df_combined1 = df_combined1[df_combined1['year'] < 2041]
    # Output to JSON
    df_combined1.to_json('ev_chart_area.json', index=False)
    df_combined1.to_csv('ev_chart_area.csv', index=False)
    # Create the bubble chart mass values by filtering the df_combined to inflows only
    chart_bubble = df_combined1[df_combined1['variable'].str.contains("Inflow")]
    chart_bubble = chart_bubble.drop('variable', axis=1)
    # Rename column
    chart_bubble = chart_bubble.rename(columns={"value": "mass"})
    # Import the lifespan inputs from sys
    chart_bubble["mean_lifespan"] = time_in_stock_7
    # Take the percentages from the sliders, get the difference from 1 for the non-reverse outflow
    disposal = 1 - resale - refurbish - remanufacture - recycling - mining
    # Import the weights and outflow percentages
    weighted = {'route': ['Resale', 'Refurbish', 'Remanufacture', 'Recycle', 'Urban_mining', 'Disposal'],
        'score': [10, 8, 4, 2, 1, -5],
        'outflow_percentage': [resale, refurbish, remanufacture, recycling, mining, disposal]}
    # Make into a dataframe
    weighted = pd.DataFrame(weighted)
    # Multiply the percentage score by the weight
    weighted["ce_score"] = weighted.score * weighted.outflow_percentage
    # Get the sum of the weighted values
    total = weighted['ce_score'].sum()
    # Add the sum to the chart bubble
    chart_bubble["ce_score"] = total

    chart_bubble = chart_bubble[chart_bubble['year'] > 1989]
    chart_bubble = chart_bubble[chart_bubble['year'] < 2041]

    # Output chart bubble to CSV
    chart_bubble.to_json('ev_chart_bubble.json', index=False)
    chart_bubble.to_csv('ev_chart_bubble.csv', index=False)

    # First, ensure that the 'Year' column is created in the results DataFrame
    if 'Year' not in results.columns:
        results['Year'] = 1986 + (results.index // 12)

    # Then, proceed with aggregating monthly data to annual data for each release rate
    annual_aggregates = {}
    for i in range(1, 21):  # Assuming 20 release rates
        release_rate_col = f'release_rate_{i}'
        if release_rate_col in results.columns:
            # Sum every 12 rows (months) to represent annual data
            annual_aggregates[f'aggregated_{release_rate_col}'] = results.groupby('Year')[release_rate_col].sum()

    # Define the mapping of aggregated release rates to their Source, Target for the Sankey diagram
    flow_mapping = {
    'aggregated_release_rate_1': ('Extraction', 'Refinement', 'release_rate_1'),
    'aggregated_release_rate_2': ('Refinement', 'Material formulation', 'release_rate_2'),
    'aggregated_release_rate_3': ('Material formulation', 'Component manufacture', 'release_rate_3'),
    'aggregated_release_rate_4': ('Component manufacture', 'Product assembly', 'release_rate_4'),
    'aggregated_release_rate_5': ('Product assembly', 'Retail', 'release_rate_5'),
    'aggregated_release_rate_6': ('Retail', 'Use', 'release_rate_6'),
    'aggregated_release_rate_7': ('Use', 'Collect', 'release_rate_7'),
    'aggregated_release_rate_8': ('Collect', 'Dispose', 'release_rate_8'),
    'aggregated_release_rate_10': ('Collect', 'Resale', 'release_rate_10'),
    'aggregated_release_rate_11': ('Collect', 'Refurbish', 'release_rate_11'),
    'aggregated_release_rate_12': ('Collect', 'Remanufacture', 'release_rate_12'),
    'aggregated_release_rate_13': ('Collect', 'Recycling', 'release_rate_13'),
    'aggregated_release_rate_14': ('Collect', 'Urban mining', 'release_rate_14'),
    'aggregated_release_rate_16': ('Resale', 'Retail', 'release_rate_16'),
    'aggregated_release_rate_17': ('Refurbish', 'Product assembly', 'release_rate_17'),
    'aggregated_release_rate_18': ('Remanufacture', 'Component manufacture', 'release_rate_18'),
    'aggregated_release_rate_19': ('Recycling', 'Material formulation', 'release_rate_19'),
    'aggregated_release_rate_20': ('Urban mining', 'Refinement', 'release_rate_20'),
    }

    # Initialize a list to store data for the Sankey diagram
    sankey_data = []

    # Iterate through each year and each release rate to append data to sankey_data
    for year in results['Year'].unique():
        for agg_rate, (source, target, rate_name) in flow_mapping.items():
            value = annual_aggregates.get(agg_rate, {}).get(year, 0)
            sankey_data.append({'year': year, 'source': source, 'target': target, 'value': value, 'Rate Name': rate_name})

    # Convert sankey_data list of dictionaries into a DataFrame
    sankey_df = pd.DataFrame(sankey_data)

    # Convert the 'Rate Name' to a numeric value for sorting
    sankey_df['Rate Number'] = sankey_df['Rate Name'].str.extract('(\d+)').astype(int)

    # Sort the DataFrame based on 'Rate Number' and then by 'Year'
    sankey_df_sorted = sankey_df.sort_values(by=['Rate Number', 'year'])

    # Drop the 'Rate Number' column as it is no longer needed after sorting
    sankey_df_sorted = sankey_df_sorted.drop('Rate Number', axis=1)
    sankey_df_sorted = sankey_df_sorted.drop('Rate Name', axis=1)

    # Add columns matching the baseline data structure
    sankey_df_sorted["product"] = "BEV"
    sankey_df_sorted["material"] = "Neodymium"
    sankey_df_sorted["scenario"] = "custom"
    sankey_df_sorted["color"] = "rgba(101, 221, 253, 0.8)"

    sankey_df_sorted.value = sankey_df_sorted.value.div(1000).round(2)
    sankey_df_sorted['value'] = sankey_df_sorted['value'].abs()
    sankey_df_sorted.value = sankey_df_sorted.value.round(2)
    sankey_df_sorted = sankey_df_sorted[sankey_df_sorted['year'] > 1989]
    sankey_df_sorted = sankey_df_sorted[sankey_df_sorted['year'] < 2041]

    # Optionally, save this sorted DataFrame to a CSV file for Sankey diagram visualization
    sankey_df_sorted.to_json('ev_chart_sankey.json', index=False)
    sankey_df_sorted.to_csv('ev_chart_sankey.csv', index=False)

update_models()

# Clear all non-relevant CSV files - having to remove pycache due to permissions issues
folder_path = '__pycache__'
shutil.rmtree(folder_path)

# Specify the names of the files you want to keep
retain = ['EVs Extraction demand_shifted.csv', 
              'EVs baseline use stock.csv', 
              'Final simple1.mdl', 
              'Final simple1-1.mdl',
              'Final simple2.mdl',
              'Final simple2-1.mdl',
              'Final simple3.mdl',
              'Final simple3-1.mdl',
              'Final simple4.mdl',
              'Final simple4-1.mdl',
              'Final simple5.mdl',
              'Final simple5-1.mdl',
              'Final simple6.mdl',
              'Final simple6-1.mdl',
              'DashEV1.py',
              'ev_chart_area.json',
              'ev_chart_bubble.json',
              'ev_chart_sankey.json',
              'ev_chart_sankey.csv',
              'ev_chart_bubble.csv',
              'ev_chart_area.csv']
files_in_directory = os.listdir()
# Loop through the files and delete files except those you want to keep
for item in files_in_directory:
    if item not in retain:  # If it isn't in the list for retaining
        os.remove(item)  # Remove the item
