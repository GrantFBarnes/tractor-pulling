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
// Generic

// Heartbeat to make sure server is running
router.get("/api/pulling/heartbeat", (request, response) => {
  returnSuccess(response);
});

// Get all data from table
router.get("/api/pulling/dump/:table", (request, response) => {
  if (!authentication.isAuthorized(request)) {
    rejectUnauthorized(response);
    return;
  }
  returnPromiseResponse(response, main.getDataDump(request.params.table));
});

////////////////////////////////////////////////////////////////////////////////
// Authorization

// Check if user is authenticated
router.get("/api/pulling/authenticated", (request, response) => {
  if (authentication.isAuthorized(request)) {
    returnSuccess(response);
  } else {
    rejectUnauthorized(response);
  }
});

// Get edit token if body is correct
router.post("/api/pulling/token", (request, response) => {
  if (authentication.requestToken(request.body)) {
    authentication.setTokenCookie(response);
    returnSuccess(response);
  } else {
    rejectUnauthorized(response);
  }
});

////////////////////////////////////////////////////////////////////////////////
// Seasons

// Get all seasons
router.get("/api/pulling/seasons", (request, response) => {
  returnPromiseResponse(response, main.getSeasons());
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

////////////////////////////////////////////////////////////////////////////////
// Hooks

// Get all hooks
router.get("/api/pulling/hooks", (request, response) => {
  returnPromiseResponse(response, main.getHooks());
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

////////////////////////////////////////////////////////////////////////////////
// Pullers

// Get all pullers
router.get("/api/pulling/pullers", (request, response) => {
  returnPromiseResponse(response, main.getPullers());
});

////////////////////////////////////////////////////////////////////////////////
// Tractors

// Get all tractors
router.get("/api/pulling/tractors", (request, response) => {
  returnPromiseResponse(response, main.getTractors());
});

////////////////////////////////////////////////////////////////////////////////
// Locations

// Get all locations
router.get("/api/pulling/locations", (request, response) => {
  returnPromiseResponse(response, main.getLocations());
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = router;
