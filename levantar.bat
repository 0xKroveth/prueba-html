@echo off
rem Levanta CraftPedia en Windows (doble clic). Ejecuta levantar.ps1.
rem Opciones: levantar.bat -Reiniciar   o   levantar.bat -SinIniciar
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0levantar.ps1" %*
pause
