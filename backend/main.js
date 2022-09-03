const { v4: uuidv4 } = require("uuid");

const database = require("./database.js");
const excel = require("./excel.js");
const prediction = require("./prediction.js");

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
      columns = ["id", "class", "puller", "tractor", "distance"];
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

function getSeasonIdFromValues(year) {
  return new Promise((resolve, reject) => {
    database
      .run(
        `
        SELECT id FROM seasons WHERE year = '${year}';
        `
      )
      .then((result) => {
        resolve(result);
        return;
      })
      .catch(() => {
        reject("failed to get season id");
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

function getPullIdFromValues(season, location, date) {
  return new Promise((resolve, reject) => {
    database
      .run(
        `
        SELECT id FROM pulls
        WHERE season = '${season}'
          AND location = '${location}'
          AND date = '${date}';
        `
      )
      .then((result) => {
        resolve(result);
        return;
      })
      .catch(() => {
        reject("failed to get pull id");
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

function updateClassStats() {
  return new Promise((resolve) => {
    database
      .run(
        `
        UPDATE classes
        INNER JOIN (
            SELECT classes.id, COUNT(*) AS hook_count
            FROM classes
                INNER JOIN hooks ON hooks.class = classes.id
            GROUP BY classes.id
        ) AS new_classes
        ON classes.id = new_classes.id
        SET classes.hook_count = new_classes.hook_count;
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update class stats" });
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
        (
          '${data.id ? data.id : uuidv4()}',
          '${getIdFromData(data, "pull")}',
          '${data.category ? data.category : ""}',
          ${data.weight ? data.weight : 0},
          ${data.speed ? data.speed : 3}
        )
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

function updateHookStats() {
  return new Promise((resolve) => {
    database
      .run(
        `
        UPDATE hooks
        INNER JOIN (
            SELECT hooks.id,
                ROW_NUMBER() OVER (PARTITION BY class ORDER BY distance DESC) AS position,
                CAST(
                    (hooks.distance / calculated.max_distance) * 100.0 AS INT
                ) AS distance_percentile,
                CAST(
                    ((calculated.hook_count - hooks.position) / calculated.hook_count) * 100.0 AS INT
                ) AS position_percentile
            FROM classes
                INNER JOIN hooks ON hooks.class = classes.id
                INNER JOIN (
                    SELECT classes.id, COUNT(*) AS hook_count, MAX(hooks.distance) AS max_distance
                    FROM classes
                        INNER JOIN hooks ON hooks.class = classes.id
                    GROUP BY classes.id
                ) AS calculated
                ON classes.id = calculated.id
        ) AS new_hooks
        ON hooks.id = new_hooks.id
        SET hooks.position = new_hooks.position,
            hooks.distance_percentile = new_hooks.distance_percentile,
            hooks.position_percentile = new_hooks.position_percentile;
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update hook stats" });
        return;
      });
  });
}

function updateHookStatsOfClass(id) {
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
            SELECT hooks.id,
                ROW_NUMBER() OVER (PARTITION BY class ORDER BY distance DESC) AS position,
                CAST(
                    (hooks.distance / calculated.max_distance) * 100.0 AS INT
                ) AS distance_percentile,
                CAST(
                    ((calculated.hook_count - hooks.position) / calculated.hook_count) * 100.0 AS INT
                ) AS position_percentile
            FROM classes
                INNER JOIN hooks ON hooks.class = classes.id
                INNER JOIN (
                    SELECT classes.id, COUNT(*) AS hook_count, MAX(hooks.distance) AS max_distance
                    FROM classes
                        INNER JOIN hooks ON hooks.class = classes.id
                    WHERE classes.id = '${id}'
                    GROUP BY classes.id
                ) AS calculated
                ON classes.id = calculated.id
        ) AS new_hooks
        ON hooks.id = new_hooks.id
        SET hooks.position = new_hooks.position,
            hooks.distance_percentile = new_hooks.distance_percentile,
            hooks.position_percentile = new_hooks.position_percentile;
        `
      )
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 400, data: "failed to update hook stats" });
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
        updateClassStats();
        updateHookStatsOfClass(data.class);
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
          ${data.distance ? data.distance : 0}
        )
        `
      )
      .then((result) => {
        updateClassStats();
        updateHookStatsOfClass(cl);
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
        updateClassStats();
        updateHookStats();
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

function getLocationIdFromValues(town, state) {
  return new Promise((resolve, reject) => {
    database
      .run(
        `
        SELECT id FROM locations
        WHERE town = '${town}'
          AND state = '${state}';
        `
      )
      .then((result) => {
        resolve(result);
        return;
      })
      .catch(() => {
        reject("failed to get location id");
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
// Excel

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

function getIdFromTableValues(table, values) {
  return new Promise((resolve, reject) => {
    switch (table) {
      case "season":
        getSeasonIdFromValues(values.year)
          .then((result) => {
            if (!result || !result.length) {
              console.log("Invalid Season (Must be created before)");
              console.log(values);
              reject("season not valid");
              return;
            }
            resolve(result[0].id);
            return;
          })
          .catch(() => {
            reject("failed to upload");
            return;
          });
        break;

      case "pull":
        getPullIdFromValues(values.season, values.location, values.date)
          .then((result) => {
            if (!result || !result.length) {
              console.log("Invalid Pull (Must be created before)");
              console.log(values);
              reject("pull not valid");
              return;
            }
            resolve(result[0].id);
            return;
          })
          .catch(() => {
            reject("failed to upload");
            return;
          });
        break;

      case "location":
        getLocationIdFromValues(values.town, values.state)
          .then((result) => {
            if (!result || !result.length) {
              console.log("Invalid Location (Must be created before)");
              console.log(values);
              reject("location not valid");
              return;
            }
            resolve(result[0].id);
            return;
          })
          .catch(() => {
            reject("failed to upload");
            return;
          });
        break;

      default:
        reject("table not valid");
        break;
    }
  });
}

function getHookIdsFromExcel(data) {
  return new Promise((resolve, reject) => {
    getPullers()
      .then((puller_rows) => {
        let pullers = {};
        for (let i in puller_rows.data) {
          const puller = puller_rows.data[i];
          pullers[puller.first_name + puller.last_name] = puller.id;
        }

        getTractors()
          .then((tractor_rows) => {
            let tractors = {};
            for (let i in tractor_rows.data) {
              const tractor = tractor_rows.data[i];
              tractors[tractor.brand + tractor.model] = tractor.id;
            }

            for (let r in data.rows) {
              const row = data.rows[r];

              if (!pullers[row.first_name + row.last_name]) {
                console.log("Invalid Puller (Must be created before)");
                console.log(row);
                reject("puller not valid");
                return;
              }
              data.rows[r].puller = pullers[row.first_name + row.last_name];
              delete data.rows[r].first_name;
              delete data.rows[r].last_name;

              if (!tractors[row.brand + row.model]) {
                console.log("Invalid Tractor (Must be created before)");
                console.log(row);
                reject("tractor not valid");
                return;
              }
              data.rows[r].tractor = tractors[row.brand + row.model];
              delete data.rows[r].brand;
              delete data.rows[r].model;
            }

            resolve(data);
            return;
          })
          .catch(() => {
            reject("failed to get ids from excel");
            return;
          });
      })
      .catch(() => {
        reject("failed to get ids from excel");
        return;
      });
  });
}

function getIdsFromExcel(readResult) {
  return new Promise((resolve, reject) => {
    const data = readResult.data;
    const date = new Date(data.date);
    getIdFromTableValues("season", { year: date.getFullYear() })
      .then((season_id) => {
        data.season = season_id;

        getIdFromTableValues("location", { town: data.town, state: data.state })
          .then((location_id) => {
            data.location = location_id;

            getIdFromTableValues("pull", {
              season: data.season,
              location: data.location,
              date: data.date,
            })
              .then((pull_id) => {
                data.pull = pull_id;

                getHookIdsFromExcel(data)
                  .then((hook_results) => {
                    resolve(hook_results);
                    return;
                  })
                  .catch(() => {
                    reject("failed to get ids from excel");
                    return;
                  });
              })
              .catch(() => {
                reject("failed to get ids from excel");
                return;
              });
          })
          .catch(() => {
            reject("failed to get ids from excel");
            return;
          });
      })
      .catch(() => {
        reject("failed to get ids from excel");
        return;
      });
  });
}

function processExcel(readResult) {
  return new Promise((resolve, reject) => {
    let data = {};
    getIdsFromExcel(readResult)
      .then((id_results) => {
        data = id_results;

        let newClasses = {};
        for (let i in data.rows) {
          const hook = data.rows[i];
          const classKey = hook.weight + hook.category + hook.speed;
          if (!newClasses[classKey]) {
            newClasses[classKey] = {
              id: uuidv4(),
              pull: data.pull,
              weight: hook.weight,
              category: hook.category,
              speed: hook.speed,
              hooks: [],
            };
          }
          newClasses[classKey].hooks.push({
            class: newClasses[classKey].id,
            puller: hook.puller,
            tractor: hook.tractor,
            distance: hook.distance,
          });
        }

        for (let i in newClasses) {
          createClass(newClasses[i]).then(() => {
            for (let h in newClasses[i].hooks) {
              createHook(newClasses[i].hooks[h]);
            }
          });
        }

        resolve("done");
        return;
      })
      .catch(() => {
        reject("failed to process excel");
        return;
      });
  });
}

function uploadExcel(json) {
  return new Promise((resolve) => {
    if (!json || !json.file_binary) {
      resolve({ statusCode: 400, data: "json not valid" });
      return;
    }

    const readResult = excel.readExcel(json.file_binary);
    if (readResult.statusCode !== 200) {
      console.log(readResult);
      resolve(readResult);
      return;
    }

    processExcel(readResult)
      .then(() => {
        resolve(readResult);
        return;
      })
      .catch(() => {
        resolve({ statusCode: 500, data: "failed to upload" });
        return;
      });
  });
}

////////////////////////////////////////////////////////////////////////////////
// Prediction

function predictWinChance(json) {
  return new Promise((resolve) => {
    if (
      !json ||
      !json.year ||
      !json.month ||
      !json.location ||
      !json.puller ||
      !json.tractor ||
      !json.category ||
      !json.weight ||
      !json.speed ||
      !json.hook_count
    ) {
      resolve({ statusCode: 500, data: "json not valid" });
      return;
    }

    prediction
      .predictWinChance(json)
      .then((result) => {
        resolve({ statusCode: 200, data: result });
        return;
      })
      .catch(() => {
        resolve({ statusCode: 500, data: "failed to get prediction" });
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

module.exports.downloadExcel = downloadExcel;
module.exports.uploadExcel = uploadExcel;

module.exports.predictWinChance = predictWinChance;
