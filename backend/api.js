const express = require("express");

const authentication = require("../../home-page/backend/authentication.js");
const main = require("./main.js");

const router = express.Router();

function returnSuccess(response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.write(JSON.stringify({ status: "ok" }));
  response.end();
}

function rejectUnauthorized(response) {
  authentication.removeTokenCookie(response);
  response.writeHead(401, { "Content-Type": "application/json" });
  response.write(JSON.stringify({ status: "unauthorized" }));
  response.end();
}

function returnResponse(response, result) {
  response.writeHead(result.statusCode, { "Content-Type": "application/json" });
  response.write(JSON.stringify(result.data));
  response.end();
}

function returnPromiseResponse(response, promise) {
  promise
    .then((result) => {
      response.writeHead(result.statusCode, {
        "Content-Type": "application/json",
      });
      response.write(JSON.stringify(result.data));
      response.end();
    })
    .catch(() => {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.write("error");
      response.end();
    });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// APIs defined here

////////////////////////////////////////////////////////////////////////////////
// Seasons

// Get all seasons
router.get("/api/pulling/seasons", (request, response) => {
  returnPromiseResponse(response, main.getSeasons());
});

// Update season with new values
router.put("/api/pulling/seasons", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updateSeason(request.body));
});

// Create new season
router.post("/api/pulling/seasons", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createSeason(request.body));
});

// Delete season by id
router.delete("/api/pulling/seasons/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deleteSeason(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
// Pulls

// Get all pulls
router.get("/api/pulling/pulls", (request, response) => {
  returnPromiseResponse(response, main.getPulls());
});

// Get pulls by season
router.get("/api/pulling/pulls/season/:id", (request, response) => {
  returnPromiseResponse(response, main.getPullsBySeason(request.params.id));
});

// Update pull with new values
router.put("/api/pulling/pulls", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updatePull(request.body));
});

// Create new pull
router.post("/api/pulling/pulls", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createPull(request.body));
});

// Delete pull by id
router.delete("/api/pulling/pulls/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deletePull(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
// Classes

// Get all classes
router.get("/api/pulling/classes", (request, response) => {
  returnPromiseResponse(response, main.getClasses());
});

// Get classes by pull
router.get("/api/pulling/classes/pull/:id", (request, response) => {
  returnPromiseResponse(response, main.getClassesByPull(request.params.id));
});

// Get classes by season
router.get("/api/pulling/classes/season/:id", (request, response) => {
  returnPromiseResponse(response, main.getClassesBySeason(request.params.id));
});

// Update class with new values
router.put("/api/pulling/classes", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updateClass(request.body));
});

// Create new class
router.post("/api/pulling/classes", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createClass(request.body));
});

// Delete class by id
router.delete("/api/pulling/classes/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deleteClass(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
// Hooks

// Get all hooks
router.get("/api/pulling/hooks", (request, response) => {
  returnPromiseResponse(response, main.getHooks());
});

// Get all hooks of winners
router.get("/api/pulling/hooks/winners", (request, response) => {
  returnPromiseResponse(response, main.getHooksOfWinners(request.params.id));
});

// Get hooks by class
router.get("/api/pulling/hooks/class/:id", (request, response) => {
  returnPromiseResponse(response, main.getHooksByClass(request.params.id));
});

// Get hooks by pull
router.get("/api/pulling/hooks/pull/:id", (request, response) => {
  returnPromiseResponse(response, main.getHooksByPull(request.params.id));
});

// Get hooks by season
router.get("/api/pulling/hooks/season/:id", (request, response) => {
  returnPromiseResponse(response, main.getHooksBySeason(request.params.id));
});

// Get hooks by season of winners
router.get("/api/pulling/hooks/season/:id/winners", (request, response) => {
  returnPromiseResponse(
    response,
    main.getHooksBySeasonOfWinners(request.params.id)
  );
});

// Update hook with new values
router.put("/api/pulling/hooks", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updateHook(request.body));
});

// Create new hook
router.post("/api/pulling/hooks", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createHook(request.body));
});

// Delete hook by id
router.delete("/api/pulling/hooks/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deleteHook(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
// Pullers

// Get all pullers
router.get("/api/pulling/pullers", (request, response) => {
  returnPromiseResponse(response, main.getPullers());
});

// Get pullers by class
router.get("/api/pulling/pullers/class/:id", (request, response) => {
  returnPromiseResponse(response, main.getPullersByClass(request.params.id));
});

// Get pullers by pull
router.get("/api/pulling/pullers/pull/:id", (request, response) => {
  returnPromiseResponse(response, main.getPullersByPull(request.params.id));
});

// Get pullers by season
router.get("/api/pulling/pullers/season/:id", (request, response) => {
  returnPromiseResponse(response, main.getPullersBySeason(request.params.id));
});

// Update puller with new values
router.put("/api/pulling/pullers", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updatePuller(request.body));
});

// Create new puller
router.post("/api/pulling/pullers", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createPuller(request.body));
});

// Delete puller by id
router.delete("/api/pulling/pullers/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deletePuller(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
// Tractors

// Get all tractors
router.get("/api/pulling/tractors", (request, response) => {
  returnPromiseResponse(response, main.getTractors());
});

// Get tractors by class
router.get("/api/pulling/tractors/class/:id", (request, response) => {
  returnPromiseResponse(response, main.getTractorsByClass(request.params.id));
});

// Get tractors by pull
router.get("/api/pulling/tractors/pull/:id", (request, response) => {
  returnPromiseResponse(response, main.getTractorsByPull(request.params.id));
});

// Get tractors by season
router.get("/api/pulling/tractors/season/:id", (request, response) => {
  returnPromiseResponse(response, main.getTractorsBySeason(request.params.id));
});

// Update tractor with new values
router.put("/api/pulling/tractors", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updateTractor(request.body));
});

// Create new tractor
router.post("/api/pulling/tractors", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createTractor(request.body));
});

// Delete tractor by id
router.delete("/api/pulling/tractors/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deleteTractor(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
// Locations

// Get all locations
router.get("/api/pulling/locations", (request, response) => {
  returnPromiseResponse(response, main.getLocations());
});

// Update location with new values
router.put("/api/pulling/locations", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.updateLocation(request.body));
});

// Create new location
router.post("/api/pulling/locations", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.createLocation(request.body));
});

// Delete location by id
router.delete("/api/pulling/locations/:id", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.deleteLocation(request.params.id));
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = router;
