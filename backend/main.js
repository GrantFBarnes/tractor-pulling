const database = require("./database.js");

const id_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

////////////////////////////////////////////////////////////////////////////////
// Seasons

function getSeasons() {
  return new Promise((resolve) => {
    database
      .run(
        `
        SELECT * FROM seasons;
        `
      )
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
      .run(
        `
        SELECT * FROM pulls;
        `
      )
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT * FROM pulls WHERE season = '${id}';
        `
      )
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
      .run(
        `
        SELECT * FROM classes;
        `
      )
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT * FROM classes WHERE pull = '${id}';
        `
      )
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT c.* FROM classes c
          INNER JOIN pulls p ON c.pull = p.id
            WHERE p.season = '${id}';
        `
      )
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
      .run(
        `
        SELECT * FROM hooks;
        `
      )
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

function getHooksOfWinners() {
  return new Promise((resolve) => {
    database
      .run(
        `
        SELECT * FROM hooks WHERE position = 1;
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to get hooks of winners" });
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT * FROM hooks WHERE class = '${id}';
        `
      )
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT h.* FROM hooks h
          INNER JOIN classes c ON h.class = c.id
            WHERE c.pull = '${id}';
        `
      )
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT h.* FROM hooks h
          INNER JOIN classes c ON h.class = c.id
          INNER JOIN pulls p ON c.pull = p.id
            WHERE p.season = '${id}';
        `
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

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT h.* FROM hooks h
          INNER JOIN classes c ON h.class = c.id
          INNER JOIN pulls p ON c.pull = p.id
            WHERE p.season = '${id}'
            AND h.position = 1;
        `
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
      .run(
        `
        SELECT * FROM pullers;
        `
      )
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

function getPullersByClass(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT pullers.* FROM pullers
          INNER JOIN hooks h ON pullers.id = h.puller
            WHERE h.class = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get pullers for class: " + id,
        });
        return;
      });
  });
}

function getPullersByPull(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT pullers.* FROM pullers
          INNER JOIN hooks h ON pullers.id = h.puller
          INNER JOIN classes c ON h.class = c.id
            WHERE c.pull = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get pullers for pull: " + id,
        });
        return;
      });
  });
}

function getPullersBySeason(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT pullers.* FROM pullers
          INNER JOIN hooks h ON pullers.id = h.puller
          INNER JOIN classes c ON h.class = c.id
          INNER JOIN pulls p ON c.pull = p.id
            WHERE p.season = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get pullers for season: " + id,
        });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Tractors

function getTractors() {
  return new Promise((resolve) => {
    database
      .run(
        `
        SELECT * FROM tractors;
        `
      )
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

function getTractorsByClass(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT tractors.* FROM tractors
          INNER JOIN hooks h ON tractors.id = h.tractor
            WHERE h.class = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get tractors for class: " + id,
        });
        return;
      });
  });
}

function getTractorsByPull(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT tractors.* FROM tractors
          INNER JOIN hooks h ON tractors.id = h.tractor
          INNER JOIN classes c ON h.class = c.id
            WHERE c.pull = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get tractors for pull: " + id,
        });
        return;
      });
  });
}

function getTractorsBySeason(id) {
  return new Promise((resolve) => {
    if (!id) {
      resolve({ statusCode: 500, data: "id not provided" });
      return;
    }

    if (!id_regex.test(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT tractors.* FROM tractors
          INNER JOIN hooks h ON tractors.id = h.tractor
          INNER JOIN classes c ON h.class = c.id
          INNER JOIN pulls p ON c.pull = p.id
            WHERE p.season = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({
          statusCode: 400,
          data: "failed to get tractors for season: " + id,
        });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Locations

function getLocations() {
  return new Promise((resolve) => {
    database
      .run(
        `
        SELECT * FROM locations;
        `
      )
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

module.exports.getSeasons = getSeasons;

module.exports.getPulls = getPulls;
module.exports.getPullsBySeason = getPullsBySeason;

module.exports.getClasses = getClasses;
module.exports.getClassesByPull = getClassesByPull;
module.exports.getClassesBySeason = getClassesBySeason;

module.exports.getHooks = getHooks;
module.exports.getHooksOfWinners = getHooksOfWinners;
module.exports.getHooksByClass = getHooksByClass;
module.exports.getHooksByPull = getHooksByPull;
module.exports.getHooksBySeason = getHooksBySeason;
module.exports.getHooksBySeasonOfWinners = getHooksBySeasonOfWinners;

module.exports.getPullers = getPullers;
module.exports.getPullersByClass = getPullersByClass;
module.exports.getPullersByPull = getPullersByPull;
module.exports.getPullersBySeason = getPullersBySeason;

module.exports.getTractors = getTractors;
module.exports.getTractorsByClass = getTractorsByClass;
module.exports.getTractorsByPull = getTractorsByPull;
module.exports.getTractorsBySeason = getTractorsBySeason;

module.exports.getLocations = getLocations;
