const path = require("path");
const fs = require("fs");
const {
  saveArrayToJsonFile,
  runPythonScript,
  readJsonFile,
  dataInsert,
  client,
  listFiles,
} = require("./functions");
const xlsx = require("xlsx");

const directory = "./raw_data/NPWD_downloads";
const pomFilesPdfs = listFiles(directory, "Consolidated.+pdf");
const pythonScriptPath = path.join(__dirname, "script.py");

async function extractor() {
  try {
    await client.connect();

    //Pdf Extraction Start
    const data = await Promise.all(
      pomFilesPdfs.map(async (pdf) => {
        const pdfPath = path.join(__dirname, directory, pdf);
        const jsonOutputPath = path.join(
          __dirname,
          `./python_data/${pdf.split(".")[0]}.json`
        );
        await runPythonScript(pythonScriptPath, pdfPath, jsonOutputPath);
        const jsonData = await readJsonFile(jsonOutputPath);
        return jsonData;
      })
    );

    const finalPdfData = data
      .map((pdf) => {
        const year = +Object.values(pdf["Page_1"][0][3])[1];
        const arr = Object.values(pdf).flat().flat();
        const step1 = arr
          .slice(8)
          .slice(
            0,
            arr
              .slice(10)
              .findIndex((itm) =>
                JSON.stringify(itm).includes("PACKAGING HANDLED")
              ) + 2
          );
        const materials = Object.values(step1[1])
          .filter((mat) => mat)
          .map((mat) => mat.trim());
        const step2 = step1.filter(
          (obj) => !JSON.stringify(obj).includes("Activity Totals")
        );

        let table = "";

        return step2.map((obj, i) => {
          if (JSON.stringify(obj).includes("Table")) {
            const name = Object.values(obj)[1];
            table = name.includes("Packaging Supplied")
              ? "Packaging Supplied"
              : name;
            return null;
          }
          if (Object.values(obj)[0] === "") {
            return null;
          }
          const [variable, ...rest] = Object.values(obj);
          return materials.map((material, i) => {
            return {
              year,
              table,
              variable,
              material,
              value: Number(rest[i].split(",").join("")),
            };
          });
        });
      })
      .flat()
      .flat()
      .filter((itm) => itm);

    //Pdf Extraction End

    // XLS Extraction Start

    const pomFilesXls = listFiles(directory, "Consolidated.+xls");
    let pomData = [];

    pomFilesXls.forEach((file) => {
      const filePath = path.join(directory, file);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      pomData.push(sheetData);
    });

    const finalXlsData = pomData
      .map((arr) => {
        const year = Object.values(arr[3])[1];
        const step1 = arr
          .slice(9)
          .slice(
            0,
            arr
              .slice(10)
              .findIndex((itm) =>
                JSON.stringify(itm).includes("PACKAGING HANDLED")
              ) + 1
          );
        const materials = Object.values(step1[1]);
        const step2 = step1.filter(
          (obj) =>
            (!JSON.stringify(obj).includes("Activity Totals") &&
              Object.values(obj).length > 7) ||
            Object.values(obj).length < 4
        );
        let table = "";
        return step2.map((obj) => {
          if (Object.values(obj).length < 4) {
            table = Object.values(obj)[1];
            return null;
          }
          const [variable, ...rest] = Object.values(obj);
          return materials.map((material, i) => {
            return {
              year,
              table,
              variable,
              material,
              value: rest[i],
            };
          });
        });
      })
      .flat()
      .flat()
      .filter((obj) => obj);

    // XLS Extraction End

    //Merge and save Data
    const packaging_POM_NPWD = "packaging_POM_NPWD";
    const combinedData = [...finalPdfData, ...finalXlsData];
    await dataInsert(packaging_POM_NPWD, combinedData);
    saveArrayToJsonFile(
      combinedData,
      `./cleaned_data/${packaging_POM_NPWD}.json`
    );
    await client.end();
  } catch (err) {
    await client.end();
    console.log("err", err);
  }
}

extractor();
