import pdfplumber
import pandas as pd
import json
import sys

def extract_tables_from_pdf(pdf_path, output_json_path):
    data = {}
    
    # Open the PDF file
    with pdfplumber.open(pdf_path) as pdf:
        # Iterate through each page
        for page_number, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            page_data = []
            
            # Iterate through each table in the page
            for table in tables:
                # Convert the table into a pandas DataFrame for easier manipulation
                df = pd.DataFrame(table)
                
                # Convert DataFrame rows into list of dictionaries, separating each column
                table_rows = df.to_dict(orient='records')
                
                # Add table to page data
                page_data.append(table_rows)
            
            # Save page data in the final output
            data[f'Page_{page_number}'] = page_data
    
    # Save extracted data as JSON
    with open(output_json_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

    print(f"Tables extracted and saved to {output_json_path}")

def extract_text_from_pdf(pdf_path, output_text_path):
    text_data = []
    
    # Open the PDF file
    with pdfplumber.open(pdf_path) as pdf:
        # Iterate through each page to extract text
        for page_number, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text()
            
            # Save the text of each page in a list
            text_data.append({
                f'Page_{page_number}': page_text.strip() if page_text else ""
            })
    
    # Save extracted text as a JSON file or text file
    with open(output_text_path, 'w') as text_file:
        json.dump(text_data, text_file, indent=4)

    print(f"Text extracted and saved to {output_text_path}")

if __name__ == '__main__':
    pdf_path = sys.argv[1]
    json_output_path = sys.argv[2]
    text_output_path = sys.argv[3]
    
    # Extract tables
    extract_tables_from_pdf(pdf_path, json_output_path)
    
    # Extract text
    extract_text_from_pdf(pdf_path, text_output_path)
