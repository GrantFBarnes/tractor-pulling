# Tractor Pulling

This is a website used to show results from the Community Antique Tractor Pulling Club.

## Technology

This website has a Node.js backend with an Angular frontend.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

You will need to install [Node.js](https://nodejs.org/en/download/) on your local machine.

You will first need to install all required node modules

```
npm i
```

Then you will need to build

```
npm run build
```

This is the same as running `ng build`. You can add the `--prod` flag for a production build.

## Backend

The backend server for this site is now in the [home-page](https://github.com/GrantFBarnes/home-page) repository.

Have both repositories cloned in the same directory on your system, and then you can run

```
node ../home-page/backend/server.js
```

Instructions to host in production can be found in the other `home-page` repository.

## Frontend

If UI development is planned, then in a new session (keep server running) start up the UI. This will auto refresh the page for each save made in a UI file.

```
npm run start
```

This is the same as running `ng serve`.

Open the page in your browser http://localhost:8080/, or if doing UI development use http://localhost:4200
