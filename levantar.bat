@echo off
rem Levanta CraftPedia en Windows con doble clic (ejecuta levantar.ps1)
rem Opciones: levantar.bat -Reiniciar   o   levantar.bat -SinIniciar
setlocal
chcp 65001 >nul

rem me paro en la carpeta del proyecto, venga de donde venga el doble clic
cd /d "%~dp0"

rem uso PowerShell 7 si esta instalado, si no el que trae Windows
set "PS=powershell"
where pwsh >nul 2>nul && set "PS=pwsh"

%PS% -NoProfile -ExecutionPolicy Bypass -File "%~dp0levantar.ps1" %*

if errorlevel 1 (
  echo.
  echo No se pudo levantar CraftPedia, revisa el mensaje de arriba.
)
pause
