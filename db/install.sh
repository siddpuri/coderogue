#!/usr/bin/bash

sudo apt-get update
sudo apt-get install mysql-server -y
sudo service mysql start
sudo chmod go+rx /var/run/mysqld

sudo mysql <<EOF

    DROP DATABASE IF EXISTS game;
    CREATE DATABASE game;
    DROP USER IF EXISTS 'game'@'localhost';
    CREATE USER 'game'@'localhost' IDENTIFIED WITH mysql_native_password BY 'game';
    GRANT ALL PRIVILEGES ON game.* TO 'game'@'localhost';
    GRANT CREATE, DROP on *.* to 'game'@'localhost';
    FLUSH PRIVILEGES;

EOF
