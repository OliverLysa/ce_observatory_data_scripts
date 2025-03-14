const path = require("path");
const {
  saveArrayToJsonFile,
  dataInsert,
  client,
  listFiles,
  yearMatch,
} = require("./functions");
const xlsx = require("xlsx");

async function extractor() {
  try {
    await client.connect();

    const directory = "./raw_data/NPWD_downloads";

    const quarterlyRecyclingFileList = listFiles(
      directory,
      "Recycling_Summary.+xls"
    );
    let quarterlyRecyclingFileList2 = listFiles(directory, "_RRS.+xls");
    quarterlyRecyclingFileList2 = quarterlyRecyclingFileList2.filter(
      (file) => !/Monthly/i.test(file)
    );
    const quarterlyRecyclingFileList3 = listFiles(
      directory,
      "recovery_summary.+xls"
    );

    const quarterlyRecyclingFileListAll = [
      ...quarterlyRecyclingFileList,
      ...quarterlyRecyclingFileList2,
      ...quarterlyRecyclingFileList3,
    ];

    let quarterlyRecyclingData = [];

    quarterlyRecyclingFileListAll.forEach((file) => {
      const filePath = path.join(directory, file);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        blankrows: false,
      });
      quarterlyRecyclingData.push(sheetData);
    });

    const variablesNonDetail = [
      {
        name: "UK reprocessing",
        unit: "Tonnages",
        index: 0,
      },
      {
        name: "Overseas reprocessing",
        unit: "Tonnages",
        index: 1,
      },
      {
        name: "PRNs issued",
        unit: "PRNs (Number)",
        index: 3,
      },
    ];

    const finalNonDetailedData = quarterlyRecyclingData
      .map((arr) => {
        const startIndex = arr.findIndex((obj) =>
          Object.values(obj).some((val) =>
            typeof val === "string" ? val.includes("Table 1") : false
          )
        );
        const endIndex = arr.findIndex((obj) =>
          Object.values(obj).some((val) =>
            JSON.stringify(arr).includes("TOTAL RECOVERY")
              ? val === "TOTAL RECOVERY"
              : val === "TOTAL RECYCLING"
          )
        );
        const finalArr = arr.slice(startIndex + 2, endIndex);
        const year = yearMatch(arr[2]["__EMPTY_1"]);

        return finalArr
          .filter((obj) => !Object.values(obj)[0].includes("TOTAL RECYCLING"))
          .map((obj) => {
            const values = Object.values(obj);
            const [material, ...numbers] = values.slice(0, 5);

            return variablesNonDetail
              .map((variable) => {
                return {
                  year,
                  category: material,
                  variable: variable.name,
                  unit: variable.unit,
                  value: numbers[variable.index],
                };
              })
              .filter((obj) => typeof obj.value === "number");
          });
      })
      .flat()
      .flat();

    const resizeNonDetailedData = finalNonDetailedData.reduce((acc, cur) => {
      if (
        !acc[`${cur.year}@@@${cur.variable}@@@${cur.category}@@@${cur.unit}`]
      ) {
        acc[
          `${cur.year}@@@${cur.variable}@@@${cur.category}@@@${cur.unit}`
        ] = 0;
      }
      acc[`${cur.year}@@@${cur.variable}@@@${cur.category}@@@${cur.unit}`] +=
        cur.value;

      return acc;
    }, {});

    const finalResizeNonDetailedData = Object.entries(
      resizeNonDetailedData
    ).map(([key, value]) => {
      const [year, variable, category, unit] = key.split("@@@");
      return {
        year,
        variable,
        category,
        unit,
        value,
      };
    });

    // Writing to database and json
    const packaging_recovery_recycling = "packaging_recovery_recycling";

    // await dataInsert(packaging_recovery_recycling, finalResizeNonDetailedData);
    // saveArrayToJsonFile(
    //   finalResizeNonDetailedData,
    //   `./cleaned_data/${packaging_recovery_recycling}.json`
    // );

    await client.end();
  } catch (err) {
    await client.end();
    console.log("err", err);
  }
}

extractor();
