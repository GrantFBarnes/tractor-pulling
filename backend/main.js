const database = require("./database.js");

////////////////////////////////////////////////////////////////////////////////
// Generic

function getDataDump(table) {
  return new Promise((resolve) => {
    if (!table) {
      resolve({ statusCode: 500, data: "table not provided" });
      return;
    }

    const tables = new Set([
      "tractors",
      "pullers",
      "locations",
      "seasons",
      "pulls",
      "classes",
      "hooks",
    ]);
    if (!tables.has(table)) {
      resolve({ statusCode: 500, data: "table not valid" });
      return;
    }

    database
      .select("*", table, null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get data" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////

module.exports.getDataDump = getDataDump;
