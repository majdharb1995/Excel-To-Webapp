# clean.py
import sys
import os
import pandas as pd


def sanitize_file(input_path, output_path):
    """
    Reads an Excel file, cleans it, and saves it to a new path.
    Cleaning includes:
    - Dropping fully empty rows
    - Stripping whitespace from string columns
    - Replacing NaN string representations with None
    """
    if not input_path.endswith(('.xlsx', '.xlsm', '.xls')):
        print("Error: Unsupported file format. Only .xlsx, .xlsm, .xls are allowed.")
        return False

    try:
        excel_reader = pd.ExcelFile(input_path)
        sheet_names = excel_reader.sheet_names

        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for sheet in sheet_names:
                df = pd.read_excel(excel_reader, sheet_name=sheet)

                # Drop fully empty rows
                df.dropna(how='all', inplace=True)

                # Drop fully empty columns
                df.dropna(axis=1, how='all', inplace=True)

                # Clean string columns
                for col in df.select_dtypes(include=['object']).columns:
                    df[col] = df[col].astype(str).str.strip()
                    df[col] = df[col].replace({'nan': None, 'NaN': None, 'NAN': None, 'None': None})

                # Clean numeric columns - replace inf with None
                for col in df.select_dtypes(include=['number']).columns:
                    import numpy as np
                    df[col] = df[col].replace([np.inf, -np.inf], None)

                df.to_excel(writer, sheet_name=sheet, index=False)

        print(f"Successfully cleaned and saved to: {output_path}")
        return True
    except FileNotFoundError:
        print(f"Error: Input file not found: {input_path}")
        return False
    except Exception as e:
        print(f"Error during sanitization: {str(e)}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python clean.py <input_file_path> <output_file_path>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    success = sanitize_file(input_file, output_file)
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
