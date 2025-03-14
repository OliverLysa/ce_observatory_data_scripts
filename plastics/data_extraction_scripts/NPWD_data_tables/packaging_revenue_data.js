const path = require("path");
const fs = require("fs");
const {
  saveArrayToJsonFile,
  runPythonScript,
  readJsonFile,
  dataInsert,
  client,
  listFiles,
  extractYear,
} = require("./functions");
const xlsx = require("xlsx");

const directory = "./raw_data/NPWD_downloads";

const materials = [
  "Aluminium",
  "Paper/board",
  "Paper/Board",
  "Glass Re-melt",
  "Glass Remelt",
  "EfW",
  "Glass Other",
  "Plastic",
  "Steel",
  "Wood",
];

const prnFilesPdfs = listFiles(directory, "PRN.+pdf").filter(
  (name) =>
    !name.includes("2011") &&
    !name.includes("2010") &&
    !name.includes("2009") &&
    !name.includes("2008")
);
const pythonScriptPath = path.join(__dirname, "script.py");

const accreditation_type = {
  Rep: "Reprocessor",
  Exp: "Exporter",
  "Rep & Exp": "Reprocessor & Exporter",
};

const get_accreditation_type = (str) => {
  return str.toLowerCase().includes("exp") && str.toLowerCase().includes("rep")
    ? accreditation_type["Rep & Exp"]
    : str.toLowerCase().includes("rep")
    ? accreditation_type.Rep
    : str.toLowerCase().includes("exp")
    ? accreditation_type.Exp
    : accreditation_type.Rep;
};

async function extractor() {
  try {
    await client.connect();

    //Pdf Extraction Start
    const data = await Promise.all(
      prnFilesPdfs.map(async (pdf) => {
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
      .map((obj, i) => {
        const arr = obj["Page_1"][0];
        const items = Object.values(arr[0]).slice(
          1,
          Object.values(arr[0]).length - 1
        );
        const dataMaterials = arr.slice(1, arr.length - 1);
        const year = +extractYear(prnFilesPdfs[i]);

        return dataMaterials.map((obj) => {
          const [material, ...rest] = Object.values(obj);
          return items.map((item, i) => ({
            year,
            material: material.includes("Paper/")
              ? "Paper/Board"
              : material.split(" ")[0].trim(),
            accreditation_type: get_accreditation_type(material),
            item: item.replaceAll("\n", " "),
            value: Number(rest[i].replaceAll("£", "").replaceAll(",", "")),
          }));
        });
      })
      .flat()
      .flat()
      .filter((itm) => itm);

    //Pdf Extraction End

    //XLS Extraction Start

    const prnFilesXls = listFiles(directory, "PRN.+xls");
    let prnData = [];

    prnFilesXls.forEach((file) => {
      const filePath = path.join(directory, file);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        blankrows: false,
      });
      prnData.push(sheetData);
    });

    const finalXlsData = prnData
      .map((arr, i) => {
        const firstIndex = 0;
        const endIndex = arr.findIndex((obj) =>
          Object.values(obj).some((val) =>
            typeof val === "string" ? val.trim() === "Total" : false
          )
        );
        const filteredArr = arr
          .slice(firstIndex, endIndex)
          .filter((obj) => JSON.stringify(obj).includes("Material"));

        const finalArr = filteredArr.map((obj) =>
          Object.entries(obj).map(([key, val]) => [
            key.trim(),
            typeof val === "string" ? val.trim() : val,
          ])
        );

        const year = +extractYear(prnFilesXls[i]);

        return finalArr.map((arr) => {
          const items = arr.filter(
            ([name]) =>
              !name.includes("Material") &&
              !name.includes("Accreditation") &&
              !name.includes("Total")
          );
          const fullMaterial = arr[0][1].replaceAll("*", "");

          if (
            fullMaterial
              .toLowerCase()
              .includes("Paper Composting".toLowerCase())
          ) {
            return null;
          }

          const material = materials.filter((mat) => {
            return fullMaterial
              .replaceAll("*", "")
              .toLowerCase()
              .includes(mat.toLowerCase()) || fullMaterial.includes("Alum")
              ? "Aluminium"
              : "";
          })[0];
          const _accreditation_type = arr.some(([name]) =>
            name.includes("Accreditation")
          )
            ? get_accreditation_type(arr[1][1])
            : get_accreditation_type(fullMaterial || "rep");

          return items.map(([item, value]) => ({
            year,
            material: material.includes("Paper/") ? "Paper/Board" : material,
            accreditation_type: _accreditation_type,
            item,
            value,
          }));
        });
      })
      .flat()
      .flat()
      .filter((itm) => itm);


    //XLS Extraction End

    //Merge and save Data
    const packaging_revenue_data = "packaging_revenue_data";
    const combinedData = [...finalPdfData, ...finalXlsData];
    await dataInsert(packaging_revenue_data, combinedData);
    saveArrayToJsonFile(
      combinedData,
      `./cleaned_data/${packaging_revenue_data}.json`
    );
    await client.end();
  } catch (err) {
    await client.end();
    console.log("err", err);
  }
}

extractor();
