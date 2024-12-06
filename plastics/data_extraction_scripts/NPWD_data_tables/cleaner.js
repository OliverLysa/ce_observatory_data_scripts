const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const {
  saveArrayToJsonFile,
  yearMatch,
  dataInsert,
  client,
  extractYear,
} = require("./functions");

(async () => {
  await client.connect();
})();

function listFiles(directory, pattern) {
  const regex = new RegExp(pattern, "i");
  return fs.readdirSync(directory).filter((file) => regex.test(file));
}

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
                ? `${firstVal}-${
                    secondVal.includes("Other") ? "Other" : secondVal
                  }`
                : `${mainMat}-${
                    firstVal.includes("Other") ? "Other" : firstVal
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

const finalResizeDetailedData = Object.entries(resizeDetailedData).map(
  ([key, value]) => {
    const [year, variable, mat1, mat2, unit] = key.split("@@@");
    return {
      year,
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

// Writing to database and json
// dataInsert(packaging_recovery_recycling_detail_alt, finalResizeDetailedData);
// saveArrayToJsonFile(
//   finalResizeDetailedData,
//   `./cleaned_data/${packaging_recovery_recycling_detail_alt}.json`
// );

//Extracting data for packaging_recovery_recycling_alt

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
  if (!acc[`${cur.year}@@@${cur.variable}@@@${cur.category}@@@${cur.unit}`]) {
    acc[`${cur.year}@@@${cur.variable}@@@${cur.category}@@@${cur.unit}`] = 0;
  }
  acc[`${cur.year}@@@${cur.variable}@@@${cur.category}@@@${cur.unit}`] +=
    cur.value;

  return acc;
}, {});

const finalResizeNonDetailedData = Object.entries(resizeNonDetailedData).map(
  ([key, value]) => {
    const [year, variable, category, unit] = key.split("@@@");
    return {
      year,
      variable,
      category,
      unit,
      value,
    };
  }
);

// Writing to database and json
// const packaging_recovery_recycling_alt = "packaging_recovery_recycling_alt";
// dataInsert(packaging_recovery_recycling_alt, finalResizeNonDetailedData);
// saveArrayToJsonFile(
//   finalResizeNonDetailedData,
//   `./cleaned_data/${packaging_recovery_recycling_alt}.json`
// );

//Extracting data for packaging_revenue_data

const prnFileListAll = listFiles(directory, "PRN.+xls");
let prnData = [];

prnFileListAll.forEach((file) => {
  const filePath = path.join(directory, file);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    blankrows: false,
  });
  prnData.push(sheetData);
});

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

const finalPRNData = prnData
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
    const year = +extractYear(prnFileListAll[i]);

    return finalArr.map((arr) => {
      const items = arr.filter(
        ([name]) =>
          !name.includes("Material") &&
          !name.includes("Accreditation") &&
          !name.includes("Total")
      );
      const fullMaterial = arr[0][1].replaceAll("*", "");

      if (
        fullMaterial.toLowerCase().includes("Paper Composting".toLowerCase())
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
        material,
        accreditation_type: _accreditation_type,
        item,
        value,
      }));
    });
    //   const material = (obj["Material "] || obj["Material Type"]).split(" ")[0];
    //   const _accreditation_type =
    //     accreditation_type[
    //       (obj["Material "] || obj["Material Type"]).split(" ")[1]
    //     ];

    //   return Object.entries(obj)
    //     .slice(1)
    //     .slice(-1)
    //     .map(([key, value]) => ({
    //       year,
    //       item: key,
    //       material,
    //       accreditation_type: _accreditation_type,
    //       value,
    //     }));
    // });
  })
  .flat()
  .flat()
  .filter((itm) => itm);


// Writing to database and json
// const packaging_revenue_data = "packaging_revenue_data";
// dataInsert(packaging_revenue_data, finalPRNData);
// saveArrayToJsonFile(
//   finalPRNData,
//   `./cleaned_data/${packaging_revenue_data}.json`
// );

//Extracting Data for packaging_POM_NPWD

const pomFileListAll = listFiles(directory, "Consolidated.+xls");
let pomData = [];

pomFileListAll.forEach((file) => {
  const filePath = path.join(directory, file);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  pomData.push(sheetData);
});

let currentTable = "";

const finalPomData = pomData
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
        return null
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
  .flat().filter((obj) => obj);


// Writing to database and json
// const packaging_POM_NPWD = "packaging_POM_NPWD";
// dataInsert(packaging_POM_NPWD, finalPRNData);
// saveArrayToJsonFile(finalPomData, `./cleaned_data/${packaging_POM_NPWD}.json`);
