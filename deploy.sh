#!/bin/sh

case "$1" in
    "packages")
    cd api
    npm i
    cd ../client
    npm i
    ;;
    "psql")
    psql $2 < api/initDB/init.sql
    psql $2 -tc "SELECT 1 FROM pg_database WHERE datname = $3" | grep -q 1 | psql $2 -c "CREATE DATABASE $3"
    psql $2 < api/initDB/createTables.sql
    psql $2 < api/initDB/addUsers.sql
    psql $2 < api/initDB/updateUsers.sql
    ;;
    "run")
    cd api
    npm run dev
    ;;
    "docker")
    docker-compose up
    ;;
    *)
    echo "Usage:"
    echo "sh deploy.sh packages - install npm packages for node js and react"
    echo "sh deploy.sh psql YOUR_DATABASE_ACCOUNT YOUR_DATABASE_NAME - deploy database"
    echo "sh deploy.sh run - run servers"
    echo "sh deploy.sh docker - deploy project in docker"
esac
