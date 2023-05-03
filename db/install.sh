#!/usr/bin/bash

cd $(dirname "$0")/..

sudo apt-get -qq update
sudo apt-get -qq install mysql-server -y
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

. db/reset.sh
node db/create_test_user.js
