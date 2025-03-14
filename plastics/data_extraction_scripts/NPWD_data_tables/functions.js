const fs = require("fs");
const { Client } = require("pg");
const { spawn } = require("child_process");
const csvParser = require("csv-parser");

const client = new Client({
  user: "postgres.qcgyyjjmwydekbxsjjbx",
  host: "aws-0-eu-west-2.pooler.supabase.com",
  database: "postgres",
  password: "ce-observatory123!",
  port: 6543,
});

const determineColumnType = (values) => {
  let hasText = false;
  let hasReal = false;
  let hasInteger = false;
  let hasBoolean = false;

  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "boolean") {
      hasBoolean = true;
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        hasInteger = true;
      } else {
        hasReal = true;
      }
    } else {
      hasText = true;
    }
  }

  if (hasText) return "TEXT";
  if (hasReal) return "REAL";
  if (hasInteger) return "INTEGER";
  if (hasBoolean) return "BOOLEAN";
  return "TEXT";
};

const writeToDatabase = async (tableName, data) => {
  if (!data || data.length === 0) {
    console.error("No data provided");
    return;
  }

  const columns = Object.keys(data[0]);
  const columnDataTypes = {};

  // Determine data types for each column
  for (const col of columns) {
    const columnValues = data.map((row) => row[col]);
    columnDataTypes[col] = determineColumnType(columnValues);
  }

  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ${columns.map((col) => `"${col}" ${columnDataTypes[col]}`).join(", ")}
      );
    `;

  try {
    await client.query(createTableQuery);
    console.log(`Table "${tableName}" ensured.`);

    const values = data.map(
      (row) =>
        `(${columns
          .map((col) => {
            const value = row[col];
            return value === null || value === undefined
              ? "NULL"
              : `'${value}'`;
          })
          .join(", ")})`
    );
    const insertQuery = `
        INSERT INTO "${tableName}" (${columns
      .map((col) => `"${col}"`)
      .join(", ")})
        VALUES ${values.join(", ")}
        ON CONFLICT (id) DO NOTHING;
      `;

    await client.query(insertQuery);
    console.log(`${data.length} rows inserted into ${tableName}`);
  } catch (error) {
    console.error("Error interacting with the database:", error);
  }
};

const fetchLatestEntry = async (tableName, sortColumn, client) => {
  try {
    const query = `
      SELECT * 
      FROM "${tableName}"
      ORDER BY "${sortColumn}" DESC 
      LIMIT 1;
    `;

    const result = await client.query(query);

    if (result.rows.length > 0) {
      console.log("Latest entry:", result.rows[0]);
      return result.rows[0];
    } else {
      console.log(`No entries found in table "${tableName}".`);
      return "no entry";
    }
  } catch (error) {
    console.error("Error fetching the latest entry:", error);
    if (error.code === "42P01") {
      return "not found";
    }
    return null;
  }
};

const deleteRow = async (tableName, columnName, columnValue, client) => {
  try {
    const query = `
    DELETE FROM "${tableName}" 
    WHERE "${columnName}" = $1;
  `;

    const result = await client.query(query, [columnValue]);

    if (result.rowCount > 0) {
      console.log(`${result.rowCount} row(s) deleted from "${tableName}".`);
    } else {
      console.log(
        `No matching row found in "${tableName}" for "${columnName}" = ${columnValue}.`
      );
    }

    return result.rowCount;
  } catch (error) {
    console.error("Error deleting row:", error);
    throw error;
  }
};

const saveArrayToJsonFile = (data, filePath) => {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("File saved successfully!");
    }
  });
};

const yearMatch = (str) => {
  const yearMatch = str.match(/\b\d{4}\b/);
  if (yearMatch) {
    const year = yearMatch[0];
    return year;
  } else {
    return 0;
  }
};

const extractYear = (str) => {
  const match = str.match(/(19|20)\d{2}/);
  return match ? match[0] : null;
};

const dataInsert = async (tableName, data) => {
  const latestRow = await fetchLatestEntry(tableName, "year", client);
  if (latestRow === "not found" || latestRow === "no entry") {
    await writeToDatabase(tableName, data, client);
  } else {
    const currentYear = new Date().getFullYear().toString();
    if (currentYear === latestRow.year) {
      const currentYearData = data.filter((obj) => obj.year === currentYear);
      await deleteRow(tableName, "year", currentYear, client);
      await writeToDatabase(tableName, currentYearData, client);
      return;
    }

    if (+currentYear > +latestRow.year) {
      const currentAndPreviousYearData = data.filter(
        (obj) => obj.year === currentYear || obj.year === latestRow.year
      );
      await deleteRow(tableName, "year", latestRow.year, client);
      await deleteRow(tableName, "year", currentYear, client);
      await writeToDatabase(tableName, currentAndPreviousYearData, client);
      return;
    }
  }
};

function runPythonScript(pythonScriptPath, pdfPath, jsonOutputPath) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      pythonScriptPath,
      pdfPath,
      jsonOutputPath,
    ]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(jsonOutputPath);
      } else {
        reject(`Python script exited with code ${code}`);
      }
    });
  });
}

function readJsonFile(jsonFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(jsonFilePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (jsonErr) {
          reject(jsonErr);
        }
      }
    });
  });
}

function readCsvToJson(filePath) {
  return new Promise((resolve, reject) => {
      const results = [];
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
          return reject(new Error(`File not found: ${filePath}`));
      }

      fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (row) => {
              results.push(row);
          })
          .on('end', () => {
              resolve(results);
          })
          .on('error', (error) => {
              reject(error);
          });
  });
}

function listFiles(directory, pattern) {
  const regex = new RegExp(pattern, "i");
  return fs.readdirSync(directory).filter((file) => regex.test(file));
}

module.exports = {
  dataInsert,
  yearMatch,
  saveArrayToJsonFile,
  deleteRow,
  fetchLatestEntry,
  writeToDatabase,
  extractYear,
  client,
  runPythonScript,
  readJsonFile,
  listFiles,
  readCsvToJson
};
