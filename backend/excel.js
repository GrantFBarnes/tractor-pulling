const excel4node = require("excel4node");
const xlsx = require("xlsx");

////////////////////////////////////////////////////////////////////////////////
// Create xlsx

function normalizeValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (!value) return "-";
  if (Array.isArray(value)) return value.toString();
  if (typeof value !== "string") return JSON.stringify(value);
  return value;
}

function populateCell(wb, sheet, value, row, col, color, row2, col2) {
  value = normalizeValue(value);

  if (row2 && col2) {
    sheet.cell(row, col, row2, col2, true).string(value);
  } else {
    sheet.cell(row, col).string(value);
  }

  const styleJSON = { alignment: { horizontal: "center" } };
  if (color) {
    styleJSON.fill = { type: "pattern", patternType: "solid", fgColor: color };
  }
  sheet.cell(row, col).style(wb.createStyle(styleJSON));
}

function createClassSection(wb, sheet, data, startingRow) {
  let row = startingRow;
  populateCell(wb, sheet, data.name, row, 1, "#67e3e1");
  for (let c in data.hooks) {
    const hook = data.hooks[c];
    populateCell(wb, sheet, hook.position, row, 2);
    populateCell(wb, sheet, hook.puller, row, 3);
    populateCell(wb, sheet, hook.tractor, row, 4);
    populateCell(wb, sheet, hook.distance, row, 5);
    row++;
  }
  return row + 1;
}

function createExcel(json) {
  let wb = new excel4node.Workbook();
  let sheet = wb.addWorksheet(json.name);

  let row = 1;
  let col = 1;
  const headers = { Class: 22, Pos: 5, Puller: 20, Tractor: 20, Distance: 8 };
  const headerCount = Object.keys(headers).length;
  populateCell(wb, sheet, json.name, row, col, "#67e3e1", row, headerCount);
  row++;

  for (let header in headers) {
    populateCell(wb, sheet, header, row, col, "#b8b8b8");
    sheet.column(col).setWidth(headers[header]);
    col++;
  }
  row++;

  for (let c in json.classes) {
    row = createClassSection(wb, sheet, json.classes[c], row);
  }

  // writeToBuffer is a promise, caller must wait
  return wb.writeToBuffer();
}

////////////////////////////////////////////////////////////////////////////////

module.exports.createExcel = createExcel;
