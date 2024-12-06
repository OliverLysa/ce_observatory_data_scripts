const fs = require("fs");
const { Client } = require("pg");

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

const dataInsert = async (tableName, finalResizeData) => {
  const latestRow = await fetchLatestEntry(tableName, "year", client);
  if (latestRow === "not found" || latestRow === "no entry") {
    await writeToDatabase(tableName, finalResizeData, client);
  } else {
    const currentYear = new Date().getFullYear().toString();
    if (currentYear === latestRow.year) {
      const currentYearData = finalResizeData.filter(
        (obj) => obj.year === currentYear
      );
      await deleteRow(tableName, "year", currentYear, client);
      await writeToDatabase(tableName, currentYearData, client);
      return;
    }

    if (+currentYear > +latestRow.year) {
      const currentAndPreviousYearData = finalResizeData.filter(
        (obj) => obj.year === currentYear || obj.year === latestRow.year
      );
      await deleteRow(
        "packaging_recovery_recycling_detail_alt",
        "year",
        latestRow.year,
        client
      );
      await deleteRow(
        "packaging_recovery_recycling_detail_alt",
        "year",
        currentYear,
        client
      );
      await writeToDatabase(
        "packaging_recovery_recycling_detail_alt",
        currentAndPreviousYearData,
        client
      );
      return;
    }
  }
};

module.exports = {
  dataInsert,
  yearMatch,
  saveArrayToJsonFile,
  deleteRow,
  fetchLatestEntry,
  writeToDatabase,
  extractYear,
  client,
};
