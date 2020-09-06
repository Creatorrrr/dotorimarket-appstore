#!/bin/bash

export DOCKER_COMPOSE_PATH="${PWD}/docker-compose.yml"

build() {
  cd ./frontend
  npm ci
  npm run build
  cd ..
}

start() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" up -d --build
}

start_web() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" up -d --build web
}

start_db() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" up -d --build db
}

restart_web() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" restart web
}

restart_db() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" restart web
}

down() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" down
}

log() {
  docker-compose -f "$DOCKER_COMPOSE_PATH" logs -f
}

case "$1" in
  start)
    down
    build
    start
    log
    ;;
  reload_web)
    build
    start_web
    log
    ;;
  reload_db)
    start_db
    log
    ;;
  restart_web)
    restart_web
    log
    ;;
  restart_db)
    restart_db
    log
    ;;
  stop)
    down
    ;;
esac