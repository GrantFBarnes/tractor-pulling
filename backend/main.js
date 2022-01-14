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
// Seasons

function getSeasons() {
  return new Promise((resolve) => {
    database
      .select("*", "seasons", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get seasons" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Pulls

function getPulls() {
  return new Promise((resolve) => {
    database
      .select("*", "pulls", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get pulls" });
        return;
      });
  });
}

function getPullsBySeason(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .select("*", "pulls", "season", [id])
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get pulls for season: " + id,
        });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Classes

function getClasses() {
  return new Promise((resolve) => {
    database
      .select("*", "classes", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get classes" });
        return;
      });
  });
}

function getClassesByPull(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .select("*", "classes", "pull", [id])
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get classes for pull: " + id,
        });
        return;
      });
  });
}

function getClassesBySeason(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .selectChain(["classes", "pulls"], ["pull", "season"], [id])
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get classes for season: " + id,
        });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Hooks

function getHooks() {
  return new Promise((resolve) => {
    database
      .select("*", "hooks", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get hooks" });
        return;
      });
  });
}

function getHooksByClass(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .select("*", "hooks", "class", [id])
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get hooks for class: " + id,
        });
        return;
      });
  });
}

function getHooksByPull(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .selectChain(["hooks", "classes"], ["class", "pull"], [id])
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get hooks for pull: " + id,
        });
        return;
      });
  });
}

function getHooksBySeason(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .selectChain(
        ["hooks", "classes", "pulls"],
        ["class", "pull", "season"],
        [id]
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get hooks for season: " + id,
        });
        return;
      });
  });
}

function getHooksBySeasonOfWinners(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    database
      .selectChain(
        ["hooks", "classes", "pulls"],
        ["class", "pull", "season"],
        [id],
        "position",
        1
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get hooks of winners for season: " + id,
        });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Pullers

function getPullers() {
  return new Promise((resolve) => {
    database
      .select("*", "pullers", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get pullers" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Tractors

function getTractors() {
  return new Promise((resolve) => {
    database
      .select("*", "tractors", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get tractors" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Locations

function getLocations() {
  return new Promise((resolve) => {
    database
      .select("*", "locations", null, null)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get locations" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////

module.exports.getDataDump = getDataDump;

module.exports.getSeasons = getSeasons;

module.exports.getPulls = getPulls;
module.exports.getPullsBySeason = getPullsBySeason;

module.exports.getClasses = getClasses;
module.exports.getClassesByPull = getClassesByPull;
module.exports.getClassesBySeason = getClassesBySeason;

module.exports.getHooks = getHooks;
module.exports.getHooksByClass = getHooksByClass;
module.exports.getHooksByPull = getHooksByPull;
module.exports.getHooksBySeason = getHooksBySeason;
module.exports.getHooksBySeasonOfWinners = getHooksBySeasonOfWinners;

module.exports.getPullers = getPullers;

module.exports.getTractors = getTractors;

module.exports.getLocations = getLocations;
