const Excel = require("exceljs");
const _ = require("lodash");
const moment = require("moment");

const getProkerData = async () => {
  let workbook = new Excel.Workbook();
  await workbook.xlsx.readFile("./data.xlsx");
  let prokerSheet = workbook.getWorksheet("Proker");
  let prokerData = {};
  let curMhs, curProkerName, curProkerCnt, curKegiatanCnt, curKegiatanName;
  const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
  ];

  for (let i = 4; i < prokerSheet.rowCount; i++) {
    let row = prokerSheet.getRow(i);
    if (!row.getCell(3).value) break;

    if (row.getCell(1).value != curMhs) {
      curMhs = row.getCell(1).value;
      curProkerCnt = 0;
    }
    if (row.getCell(2).value != curProkerName) {
      curProkerName = row.getCell(2).value;
      curProkerCnt += 1;
      curKegiatanCnt = 0;
    }
    curKegiatanName = row.getCell(3).value;
    prokerData = {
      ...prokerData,
      [curMhs]: {
        ...prokerData[curMhs],
        [`${curProkerCnt}${alphabet[curKegiatanCnt]}`]: {
          proker_name: curProkerName,
          kegiatan_name: curKegiatanName,
        },
      },
    };
    curKegiatanCnt++;
  }

  return prokerData;
};

const getScheduleByDate = async (date) => {
  const prokerData = await getProkerData();
  const diff = date.diff(moment("2021-07-14"), "days");
  let workbook = new Excel.Workbook();
  await workbook.xlsx.readFile("./data.xlsx");
  let workSheet = workbook.getWorksheet("Timeline");

  // Get name and color correspondence
  let dbCol = workSheet.getColumn(1);
  const colorCode = {};
  const mahasiswaList = [];
  dbCol.eachCell({ includeEmpty: true }, function (cell) {
    let color = _.get(cell, "style.fill.fgColor.argb", null);
    let value = cell.value;
    if (!!color && !!value) {
      colorCode[color] = value;
      if (!mahasiswaList.includes(value)) {
        mahasiswaList.push(value);
      }
    }
  });

  // Get schedule
  const colStart = 3;
  let schedule = {
    pagi: {},
    siang: {},
    malam: {},
  };
  dbCol = workSheet.getColumn(colStart + diff);
  dbCol.eachCell({ includeEmpty: true }, function (cell, rowNumber) {
    let color = _.get(cell, "style.fill.fgColor.argb", null);
    let value = cell.value;
    let pic, proker;
    let bantu = [];
    if (!!color && !!value) {
      // Get PIC, bantu, and proker data
      pic = colorCode[color];
      if (value.toLowerCase().includes("bantu")) {
        bantu.push(mahasiswaList[(rowNumber - 3) % mahasiswaList.length]);
      }
      proker = prokerData[pic][value.split(" ")[0]];

      // Formatting schedule
      if (Math.floor((rowNumber - 3) / mahasiswaList.length) == 0) {
        schedule = {
          ...schedule,
          pagi: {
            ...schedule.pagi,
            [pic]: {
              ...proker,
              bantu: _.get(schedule, `pagi.${pic}.bantu`, []).concat(bantu),
            },
          },
        };
      } else if (Math.floor((rowNumber - 3) / mahasiswaList.length) == 1) {
        schedule = {
          ...schedule,
          siang: {
            ...schedule.siang,
            [pic]: {
              ...proker,
              bantu: _.get(schedule, `siang.${pic}.bantu`, []).concat(bantu),
            },
          },
        };
      } else if (Math.floor((rowNumber - 3) / mahasiswaList.length) == 2) {
        schedule = {
          ...schedule,
          malam: {
            ...schedule.malam,
            [pic]: {
              ...proker,
              bantu: _.get(schedule, `malam.${pic}.bantu`, []).concat(bantu),
            },
          },
        };
      }
    }
  });
  return schedule;
};

module.exports = { getProkerData, getScheduleByDate };
