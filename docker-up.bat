@echo off
rem Change to the directory containing docker-compose.yml
pushd "%~dp0Project-FullAi"
docker compose up -d
popd

