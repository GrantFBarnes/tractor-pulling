-- Run to create db
-- mariadb -u grant -p < setup.sql
-- mariadb-dump tractor_pulling > backup.sql

DROP DATABASE IF EXISTS tractor_pulling;
CREATE DATABASE tractor_pulling;
USE tractor_pulling;

CREATE TABLE tractors (
    id CHAR(36) NOT NULL,
    brand VARCHAR(50) DEFAULT "",
    model VARCHAR(50) DEFAULT "",
    PRIMARY KEY (id),
    CONSTRAINT tractor_unique UNIQUE (brand, model)
);

CREATE TABLE pullers (
    id CHAR(36) NOT NULL,
    first_name VARCHAR(50) DEFAULT "",
    last_name VARCHAR(50) DEFAULT "",
    PRIMARY KEY (id),
    CONSTRAINT puller_unique UNIQUE (first_name, last_name)
);

CREATE TABLE locations (
    id CHAR(36) NOT NULL,
    town VARCHAR(20) DEFAULT "",
    state CHAR(2) DEFAULT "",
    PRIMARY KEY (id),
    CONSTRAINT location_unique UNIQUE (town, state)
);

CREATE TABLE seasons (
    id CHAR(36) NOT NULL,
    year CHAR(4) DEFAULT "",
    PRIMARY KEY (id),
    CONSTRAINT season_unique UNIQUE (year)
);

CREATE TABLE pulls (
    id CHAR(36) NOT NULL,
    season CHAR(36) NOT NULL,
    location CHAR(36) NOT NULL,
    date DATE DEFAULT NOW(),
    youtube CHAR(11) DEFAULT "",
    PRIMARY KEY (id),
    FOREIGN KEY (season) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (location) REFERENCES locations(id),
    CONSTRAINT pull_unique UNIQUE (season, location, date)
);

CREATE TABLE classes (
    id CHAR(36) NOT NULL,
    pull CHAR(36) NOT NULL,
    category VARCHAR(16) DEFAULT "",
    weight INT DEFAULT 0,
    speed INT DEFAULT 3,
    PRIMARY KEY (id),
    FOREIGN KEY (pull) REFERENCES pulls(id) ON DELETE CASCADE,
    CONSTRAINT class_unique UNIQUE (pull, category, weight, speed)
);

CREATE TABLE hooks (
    id CHAR(36) NOT NULL,
    class CHAR(36) NOT NULL,
    puller CHAR(36) NOT NULL,
    tractor CHAR(36) NOT NULL,
    distance FLOAT(5, 2) DEFAULT 0.00,
    position INT DEFAULT 0,
    distance_percentile INT DEFAULT 0,
    position_percentile INT DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (class) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (puller) REFERENCES pullers(id),
    FOREIGN KEY (tractor) REFERENCES tractors(id),
    CONSTRAINT hook_unique UNIQUE (class, puller, tractor, distance)
);
