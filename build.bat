@echo off
set RUSTFLAGS=-A warnings
call npm config set proxy http://localhost:7890
call npm config set https-proxy http://localhost:7890
call npm run tauri build
call npm config delete proxy
call npm config delete https-proxy