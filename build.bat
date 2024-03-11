@echo off
set RUSTFLAGS=-A warnings
@REM call npm config set proxy http://localhost:7890
@REM call npm config set https-proxy http://localhost:7890
call npm run tauri build
@REM call npm config delete proxy
@REM call npm config delete https-proxy