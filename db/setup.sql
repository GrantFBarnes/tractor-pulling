-- Run to create db
-- mysql -u grant -p < setup.sql
-- mysqldump -u grant tractor_pulling > backup.sql

DROP DATABASE IF EXISTS tractor_pulling;
CREATE DATABASE tractor_pulling;
USE tractor_pulling;

CREATE TABLE tractors (
    id CHAR(36) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE pullers (
    id CHAR(36) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE locations (
    id CHAR(36) NOT NULL,
    town VARCHAR(20) NOT NULL,
    state CHAR(2) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE seasons (
    id CHAR(36) NOT NULL,
    year CHAR(4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE pulls (
    id CHAR(36) NOT NULL,
    season CHAR(36) NOT NULL,
    location CHAR(36) NOT NULL,
    date DATE,
    youtube CHAR(11),
    PRIMARY KEY (id),
    FOREIGN KEY (season) REFERENCES seasons(id),
    FOREIGN KEY (location) REFERENCES locations(id)
);

CREATE TABLE classes (
    id CHAR(36) NOT NULL,
    pull CHAR(36) NOT NULL,
    category VARCHAR(16),
    weight INT,
    speed INT,
    PRIMARY KEY (id),
    FOREIGN KEY (pull) REFERENCES pulls(id)
);

CREATE TABLE hooks (
    id CHAR(36) NOT NULL,
    class CHAR(36),
    puller CHAR(36),
    tractor CHAR(36),
    distance FLOAT(5, 2),
    position INT,
    PRIMARY KEY (id),
    FOREIGN KEY (class) REFERENCES classes(id),
    FOREIGN KEY (puller) REFERENCES pullers(id),
    FOREIGN KEY (tractor) REFERENCES tractors(id)
);
