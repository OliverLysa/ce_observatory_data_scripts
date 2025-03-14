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

    //Extracting data for packaging_recovery_recycling_detail_alt
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

    const variables = [
      {
        name: "Gross received",
        index: 0,
      },
      {
        name: "Gross exported",
        index: 1,
      },
      {
        name: "Net received",
        index: 3,
      },
      {
        name: "Net exported",
        index: 4,
      },
    ];

    const finalDetailData = quarterlyRecyclingData
      .map((arr) => {
        const startIndex = arr.findIndex((obj) =>
          Object.values(obj).some((val) =>
            typeof val === "string" ? val.includes("Table 2") : false
          )
        );
        const endIndex = arr.findIndex((obj) =>
          Object.values(obj).some((val) => val === "Total Recovery")
        );
        const finalArr = arr.slice(startIndex, endIndex);
        const year = yearMatch(arr[2]["__EMPTY_1"]);
        let mainMat = "";

        return finalArr
          .filter((obj) => !Object.values(obj)[0].includes("Total"))
          .map((obj) => {
            const values = Object.values(obj);
            const firstVal = values[0];
            const secondVal = values[1];
            const isMain = materials.includes(firstVal);
            const numbers = values.slice(-6);

            if (isMain) {
              mainMat = values[0];
            }

            return variables
              .map((variable) => {
                return {
                  year,
                  mat1: mainMat,
                  mat2: isMain
                    ? `${firstVal.trim()}-${
                        secondVal.includes("Other") && secondVal.includes("-")
                          ? secondVal.split("-")[1].trim()
                          : secondVal.includes("Other")
                          ? "Other"
                          : secondVal.trim()
                      }`
                    : `${mainMat.trim()}-${
                        firstVal.includes("Other") && firstVal.includes("-")
                          ? firstVal.split("-")[1].trim()
                          : firstVal.includes("Other")
                          ? "Other"
                          : firstVal.trim()
                      }`,
                  variable: variable.name,
                  unit: variable.name.split(" ")[0],
                  value: numbers[variable.index],
                };
              })
              .filter((obj) => typeof obj.value === "number");
          });
      })
      .flat()
      .flat();

    const resizeDetailedData = finalDetailData.reduce((acc, cur) => {
      if (
        !acc[
          `${cur.year}@@@${cur.variable}@@@${cur.mat1}@@@${cur.mat2}@@@${cur.unit}`
        ]
      ) {
        acc[
          `${cur.year}@@@${cur.variable}@@@${cur.mat1}@@@${cur.mat2}@@@${cur.unit}`
        ] = 0;
      }
      acc[
        `${cur.year}@@@${cur.variable}@@@${cur.mat1}@@@${cur.mat2}@@@${cur.unit}`
      ] += cur.value;

      return acc;
    }, {});

    const finalAltData = Object.entries(resizeDetailedData).map(
      ([key, value]) => {
        const [year, variable, mat1, mat2, unit] = key.split("@@@");
        return {
          year: +year,
          mat1,
          mat2,
          variable,
          unit,
          value,
        };
      }
    );

    const packaging_recovery_recycling_detail_alt =
      "packaging_recovery_recycling_detail_alt";
    // await dataInsert(packaging_recovery_recycling_detail_alt, finalAltData);
    // saveArrayToJsonFile(
    //   finalAltData,
    //   `./cleaned_data/${packaging_recovery_recycling_detail_alt}.json`
    // );

    await client.end();
  } catch (err) {
    await client.end();
    console.log("err", err);
  }
}

extractor();
