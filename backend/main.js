const { v4: uuidv4 } = require("uuid");

const database = require("./database.js");
const excel = require("./excel.js");

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

function getIdFromData(data, field) {
  if (data && data[field] && id_regex.test(data[field])) {
    return data[field];
  }
  return "";
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

function createSeason(data) {
  return new Promise((resolve) => {
    database
      .run(
        `
        INSERT INTO seasons
        (id, year)
        VALUES
        ('${uuidv4()}', '')
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create season" });
        return;
      });
  });
}

function deleteSeason(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM seasons WHERE id = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete season: " + id });
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

function createPull(data) {
  return new Promise((resolve) => {
    const date = new Date().getFullYear() + "-01-01";

    database
      .run(
        `
        INSERT INTO pulls
        (id, season, location, date, youtube)
        VALUES
        (
          '${uuidv4()}',
          '${getIdFromData(data, "season")}',
          '${getIdFromData(data, "location")}',
          '${date}',
          ''
        )
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create pull" });
        return;
      });
  });
}

function deletePull(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM pulls WHERE id = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete pull: " + id });
        return;
      });
  });
}

function downloadExcel(json) {
  return new Promise((resolve) => {
    if (!json || !json.name || !json.classes) {
      resolve({ statusCode: 500, data: "json not valid" });
      return;
    }

    excel.createExcel(json).then((buffer) => {
      resolve({ statusCode: 200, data: buffer.toString("base64") });
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

function createClass(data) {
  return new Promise((resolve) => {
    database
      .run(
        `
        INSERT INTO classes
        (id, pull, category, weight, speed)
        VALUES
        ('${uuidv4()}', '${getIdFromData(data, "pull")}', '', 0, 3)
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create class" });
        return;
      });
  });
}

function deleteClass(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM classes WHERE id = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete class: " + id });
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

function updateHookPositions() {
  return new Promise((resolve) => {
    database
      .run(
        `
        UPDATE hooks
        INNER JOIN (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY class ORDER BY distance DESC) AS new_position FROM hooks
        ) AS new_hooks
        ON hooks.id = new_hooks.id
        SET hooks.position = new_hooks.new_position;
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update hook positions" });
        return;
      });
  });
}

function updateHookPositionsOfClass(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        UPDATE hooks
        INNER JOIN (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY class ORDER BY distance DESC) AS new_position FROM hooks WHERE class = '${id}'
        ) AS new_hooks
        ON hooks.id = new_hooks.id
        SET hooks.position = new_hooks.new_position;
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update hook positions" });
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
        updateHookPositionsOfClass(data.class);
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update hook" });
        return;
      });
  });
}

function createHook(data) {
  return new Promise((resolve) => {
    const cl = getIdFromData(data, "class");
    database
      .run(
        `
        INSERT INTO hooks
        (id, class, puller, tractor, distance)
        VALUES
        (
          '${uuidv4()}',
          '${cl}',
          '${getIdFromData(data, "puller")}',
          '${getIdFromData(data, "tractor")}',
          0
        )
        `
      )
      .then((result) => {
        updateHookPositionsOfClass(cl);
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create hook" });
        return;
      });
  });
}

function deleteHook(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM hooks WHERE id = '${id}';
        `
      )
      .then((result) => {
        updateHookPositions();
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete hook: " + id });
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

function createPuller(data) {
  return new Promise((resolve) => {
    database
      .run(
        `
        INSERT INTO pullers
        (id, first_name, last_name)
        VALUES
        ('${uuidv4()}', '', '')
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create puller" });
        return;
      });
  });
}

function deletePuller(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM pullers WHERE id = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete puller: " + id });
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

function createTractor(data) {
  return new Promise((resolve) => {
    database
      .run(
        `
        INSERT INTO tractors
        (id, brand, model)
        VALUES
        ('${uuidv4()}', '', '')
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create tractor" });
        return;
      });
  });
}

function deleteTractor(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM tractors WHERE id = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete tractor: " + id });
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

function createLocation(data) {
  return new Promise((resolve) => {
    database
      .run(
        `
        INSERT INTO locations
        (id, town, state)
        VALUES
        ('${uuidv4()}', '', '')
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to create location" });
        return;
      });
  });
}

function deleteLocation(id) {
  return new Promise((resolve) => {
    if (!idIsValid(id)) {
      resolve({ statusCode: 500, data: "id not valid" });
      return;
    }

    database
      .run(
        `
        DELETE FROM locations WHERE id = '${id}';
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to delete location: " + id });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////

module.exports.getSeasons = getSeasons;
module.exports.updateSeason = updateSeason;
module.exports.createSeason = createSeason;
module.exports.deleteSeason = deleteSeason;

module.exports.getPulls = getPulls;
module.exports.getPullsBySeason = getPullsBySeason;
module.exports.updatePull = updatePull;
module.exports.createPull = createPull;
module.exports.deletePull = deletePull;
module.exports.downloadExcel = downloadExcel;

module.exports.getClasses = getClasses;
module.exports.getClassesByPull = getClassesByPull;
module.exports.getClassesBySeason = getClassesBySeason;
module.exports.updateClass = updateClass;
module.exports.createClass = createClass;
module.exports.deleteClass = deleteClass;

module.exports.getHooks = getHooks;
module.exports.getHooksOfWinners = getHooksOfWinners;
module.exports.getHooksByClass = getHooksByClass;
module.exports.getHooksByPull = getHooksByPull;
module.exports.getHooksBySeason = getHooksBySeason;
module.exports.getHooksBySeasonOfWinners = getHooksBySeasonOfWinners;
module.exports.updateHook = updateHook;
module.exports.createHook = createHook;
module.exports.deleteHook = deleteHook;

module.exports.getPullers = getPullers;
module.exports.getPullersByClass = getPullersByClass;
module.exports.getPullersByPull = getPullersByPull;
module.exports.getPullersBySeason = getPullersBySeason;
module.exports.updatePuller = updatePuller;
module.exports.createPuller = createPuller;
module.exports.deletePuller = deletePuller;

module.exports.getTractors = getTractors;
module.exports.getTractorsByClass = getTractorsByClass;
module.exports.getTractorsByPull = getTractorsByPull;
module.exports.getTractorsBySeason = getTractorsBySeason;
module.exports.updateTractor = updateTractor;
module.exports.createTractor = createTractor;
module.exports.deleteTractor = deleteTractor;

module.exports.getLocations = getLocations;
module.exports.updateLocation = updateLocation;
module.exports.createLocation = createLocation;
module.exports.deleteLocation = deleteLocation;
