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
////////////////////////////////////////////////////////////////////////////////

module.exports = router;
