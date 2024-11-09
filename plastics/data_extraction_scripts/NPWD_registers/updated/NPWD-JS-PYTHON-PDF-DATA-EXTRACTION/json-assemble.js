const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const filename = "Public Register 2024";
const pythonScriptPath = path.join(__dirname, "data-extraction.py");
const pdfPath = path.join(__dirname, `./pdf/${filename}.pdf`);
const jsonOutputPath = path.join(
  __dirname,
  `./chunk/python_output_data_${filename}.json`
);
const textOutputPath = path.join(
  __dirname,
  `./chunk/python_output_text_${filename}.json`
);
const assembled_json = path.join(
  __dirname,
  `./json/final_json_${filename}.json`
);
const assembled_csv = path.join(__dirname, `./csv/final_json_${filename}.csv`);

function runPythonScript(pdfPath, jsonOutputPath) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      pythonScriptPath,
      pdfPath,
      jsonOutputPath,
      textOutputPath,
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

function makeArrayOfObject(keys, data) {
  const arrayOfObjects = data.map((entry) => {
    return keys.reduce((obj, key, index) => {
      obj[`${key}`.split(" ").join("_").toLowerCase()] = entry[index];
      return obj;
    }, {});
  });
  return arrayOfObjects;
}

function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 4), "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function writeCsvStringToFile(filePath, csvString) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, csvString, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function arrayToCsv(arr) {
  const headers = Object.keys(arr[0]);

  function escapeCSV(value) {
    if (typeof value === "string") {
      const replaced = value.replaceAll('"', "'");
      value = `"${replaced}"`;
    }
    return value;
  }

  const csv = [
    headers.join(","),
    ...arr.map((obj) => headers.map((key) => escapeCSV(obj[key])).join(",")),
  ].join("\n");
  return csv;
}

async function main() {
  try {
    await runPythonScript(pdfPath, jsonOutputPath);

    const jsonData = await readJsonFile(jsonOutputPath);
    const jsonText = await readJsonFile(textOutputPath);

    const tableDataHeader = Object.values(jsonData?.["Page_1"]?.[0]?.[1]).map(
      (val) => val.replace(/\/\n|\n/g, " ")
    );
    const pagesInJson = Object.keys(jsonData);
    const tablesDataMapping = [];

    for (var i = 0; i < pagesInJson.length; i++) {
      if (pagesInJson[i] === "Page_1") {
        tablesDataMapping.push(
          jsonData?.[pagesInJson[i]]?.[1].map((itm) => Object.values(itm))
        );
      } else {
        if (
          JSON.stringify(jsonData?.[pagesInJson[i]]).includes("End of List")
        ) {
          tablesDataMapping.push(
            jsonData?.[pagesInJson[i]]
              ?.map((arr) =>
                arr
                  .map((itm) => Object.values(itm))
                  .slice(1)
                  .slice(0, -2)
              )
              .flat()
          );
          break;
        } else {
          tablesDataMapping.push(
            jsonData?.[pagesInJson[i]]
              ?.map((arr, i) =>
                i === 0
                  ? arr.map((itm) => Object.values(itm)).slice(1)
                  : arr.map((itm) => Object.values(itm))
              )
              .flat()
          );
        }
      }
    }

    const stringData = jsonText
      ?.map((obj) => Object.values(obj))
      .flat()
      .map((val) => `${val}`.replaceAll("\n", " "))
      .join(" ");

    const AccreditedReprocessors = stringData
      .split("End of List")[0]
      .split("Accredited Reprocessors")[2]
      .split("Accredited Exporters")[0];
    const AccreditedExporters = stringData
      .split("End of List")[0]
      .split("Accredited Exporters")[1];

    const dataForDetails = stringData.split("End of List")[1];

    const finalTable = makeArrayOfObject(
      tableDataHeader,
      tablesDataMapping.flat()
    );

    const newJsonData = finalTable.map((obj) => {
      const afterAccNumber = dataForDetails?.split(
        obj["accreditation_number"]
      )?.[1];

      const site_address = afterAccNumber
        ?.split("Site Address")?.[1]
        ?.split("Contact Telephone")?.[0]
        ?.trim();

      const classification_of_operation = afterAccNumber
        ?.split("Classification of Operation")?.[1]
        ?.split("Accreditation Size")?.[0]
        ?.trim();

      return {
        ...obj,
        type: AccreditedReprocessors.includes(obj["accreditation_number"])
          ? "Accredited Reprocessors"
          : AccreditedExporters.includes(obj["accreditation_number"])
          ? "Accredited Exporters"
          : "",
        ["site_address"]: site_address,
        ["classification_of_operation"]: classification_of_operation,
      };
    });

    console.log("Item Extracted: ", newJsonData.length);

    await writeJsonFile(assembled_json, newJsonData);
    const csvData = arrayToCsv(newJsonData);
    await writeCsvStringToFile(assembled_csv, csvData);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
