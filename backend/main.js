const database = require("./database.js");

const id_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

////////////////////////////////////////////////////////////////////////////////
// Common

function idIsValid(id) {
  if (!id || !id_regex.test(id)) {
    return false;
  }
  return true;
}

function dataIsValid(table, data) {
  if (!data || !data.id || !id_regex.test(data.id)) {
    return false;
  }

  let columns = [];
  switch (table) {
    case "locations":
      columns = ["id", "town", "state"];
      break;

    case "pullers":
      columns = ["id", "first_name", "last_name"];
      break;

    case "tractors":
      columns = ["id", "brand", "model"];
      break;

    case "seasons":
      columns = ["id", "year"];
      break;

    case "pulls":
      columns = ["id", "season", "location", "date", "youtube"];
      break;

    case "classes":
      columns = ["id", "pull", "category", "weight", "speed"];
      break;

    case "hooks":
      columns = ["id", "class", "puller", "tractor", "distance", "position"];
      break;

    default:
      return false;
  }

  for (let field in data) {
    if (columns.indexOf(field) < 0) {
      return false;
    }
  }

  const keys = Object.keys(data);
  for (let column of columns) {
    if (keys.indexOf(column) < 0) {
      return false;
    }
  }

  return true;
}

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

function updateSeason(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("seasons", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE seasons
        SET
          year = '${data.year}'
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update season" });
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
    if (!idIsValid(id)) {
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

function updatePull(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("pulls", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE pulls
        SET
          season = '${data.season}',
          location = '${data.location}',
          date = '${data.date}',
          youtube = '${data.youtube}'
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update pull" });
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
    if (!idIsValid(id)) {
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT c.* FROM classes c
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

function updateClass(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("classes", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE classes
        SET
          pull = '${data.pull}',
          category = '${data.category}',
          weight = ${data.weight},
          speed = ${data.speed}
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update class" });
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
    if (!idIsValid(id)) {
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT h.* FROM hooks h
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT h.* FROM hooks h
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT h.* FROM hooks h
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

function updateHook(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("hooks", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE hooks
        SET
          class = '${data.class}',
          puller = '${data.puller}',
          tractor = '${data.tractor}',
          distance = ${data.distance}
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update hook" });
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT pullers.* FROM pullers
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT pullers.* FROM pullers
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT pullers.* FROM pullers
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

function updatePuller(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("pullers", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE pullers
        SET
          first_name = '${data.first_name}',
          last_name = '${data.last_name}'
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update puller" });
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT tractors.* FROM tractors
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT tractors.* FROM tractors
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
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        SELECT DISTINCT tractors.* FROM tractors
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

function updateTractor(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("tractors", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE tractors
        SET
          brand = '${data.brand}',
          model = '${data.model}'
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update tractor" });
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

function updateLocation(data) {
  return new Promise((resolve) => {
    if (!dataIsValid("locations", data)) {
      resolve({ statusCode: 500, data: "data not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE locations
        SET
          town = '${data.town}',
          state = '${data.state}'
        WHERE id = '${data.id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update location" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////

module.exports.getSeasons = getSeasons;
module.exports.updateSeason = updateSeason;

module.exports.getPulls = getPulls;
module.exports.getPullsBySeason = getPullsBySeason;
module.exports.updatePull = updatePull;

module.exports.getClasses = getClasses;
module.exports.getClassesByPull = getClassesByPull;
module.exports.getClassesBySeason = getClassesBySeason;
module.exports.updateClass = updateClass;

module.exports.getHooks = getHooks;
module.exports.getHooksOfWinners = getHooksOfWinners;
module.exports.getHooksByClass = getHooksByClass;
module.exports.getHooksByPull = getHooksByPull;
module.exports.getHooksBySeason = getHooksBySeason;
module.exports.getHooksBySeasonOfWinners = getHooksBySeasonOfWinners;
module.exports.updateHook = updateHook;

module.exports.getPullers = getPullers;
module.exports.getPullersByClass = getPullersByClass;
module.exports.getPullersByPull = getPullersByPull;
module.exports.getPullersBySeason = getPullersBySeason;
module.exports.updatePuller = updatePuller;

module.exports.getTractors = getTractors;
module.exports.getTractorsByClass = getTractorsByClass;
module.exports.getTractorsByPull = getTractorsByPull;
module.exports.getTractorsBySeason = getTractorsBySeason;
module.exports.updateTractor = updateTractor;

module.exports.getLocations = getLocations;
module.exports.updateLocation = updateLocation;
