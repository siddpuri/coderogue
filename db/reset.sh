#!/bin/bash
mysql -u game -pgame <<EOF

DROP DATABASE IF EXISTS game;
CREATE DATABASE game;
USE game;
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    period INT NOT NULL,
    handle INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    UNIQUE (handle)
);

EOF