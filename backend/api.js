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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = router;
