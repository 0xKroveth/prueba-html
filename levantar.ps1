# Levanta CraftPedia en Windows: base de datos PostgreSQL + servidor web.
#
# Uso (desde PowerShell, en la carpeta del proyecto):
#   .\levantar.ps1               prepara todo (si falta) e inicia la web
#   .\levantar.ps1 -Reiniciar    borra la base y la vuelve a cargar desde el dump
#   .\levantar.ps1 -SinIniciar   prepara todo pero no inicia el servidor
#
# O con doble clic en levantar.bat.
#
# Usa la clave "inf211" para el superusuario "postgres" (la que se pone al instalar PostgreSQL).
# Si esa no sirve la pide. También se puede definir PG_ADMIN_PASSWORD (y PG_ADMIN_USER).

param(
  [switch]$Reiniciar,
  [switch]$SinIniciar
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PGCLIENTENCODING = "UTF8"

function Paso($texto) { Write-Host ""; Write-Host "==> $texto" -ForegroundColor Green }
function Aviso($texto) { Write-Host "[aviso] $texto" -ForegroundColor Yellow }
function Fallar($texto) {
  Write-Host "[error] $texto" -ForegroundColor Red
  exit 1
}

# lee una variable del .env
function Leer-Env($nombre, $porDefecto) {
  $linea = Get-Content backend/.env | Where-Object { $_ -match "^$nombre=" } | Select-Object -Last 1
  if (-not $linea) { return $porDefecto }
  $valor = ($linea -split "=", 2)[1].Trim().Trim('"')
  if ($valor -eq "") { return $porDefecto }
  return $valor
}

# busca un programa de postgresql en el PATH o en la carpeta de instalación
function Buscar-Postgres($programa) {
  $comando = Get-Command $programa -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($comando) { return $comando.Source }

  $candidatos = Get-ChildItem -Path "$env:ProgramFiles\PostgreSQL\*\bin\$programa.exe" -ErrorAction SilentlyContinue |
    Sort-Object { [int]($_.Directory.Parent.Name -replace "\D", "") } -Descending
  if ($candidatos) { return $candidatos[0].FullName }

  return $null
}

# 1. requisitos
Paso "Revisando requisitos"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fallar "No se encontró Node.js. Instala Node.js 18 o superior desde https://nodejs.org" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fallar "No se encontró npm." }

$versionNode = [int]((node -p "process.versions.node.split('.')[0]") | Out-String).Trim()
if ($versionNode -lt 18) { Fallar "Se necesita Node.js 18 o superior (tienes $(node -v))." }

$psql = Buscar-Postgres "psql"
$pgIsReady = Buscar-Postgres "pg_isready"
if (-not $psql) { Fallar "No se encontró psql. Instala PostgreSQL 14 o superior desde https://www.postgresql.org/download/windows/" }

Write-Host "Node.js $(node -v), $(& $psql --version)"

# 2. archivo .env
Paso "Configurando .env"

if (-not (Test-Path backend/.env)) {
  Copy-Item backend/.env.example backend/.env
  Write-Host "Se creó backend/.env a partir de .env.example."
}

$claveActual = Leer-Env "DB_PASSWORD" ""
if ($claveActual -eq "" -or $claveActual -eq "cambia_esta_clave") {
  $clave = [guid]::NewGuid().ToString("N").Substring(0, 20)
  $rutaEnv = Join-Path $PSScriptRoot "backend/.env"
  $contenido = [IO.File]::ReadAllText($rutaEnv)
  $contenido = [regex]::Replace($contenido, "(?m)^DB_PASSWORD=.*$", "DB_PASSWORD=$clave")
  [IO.File]::WriteAllText($rutaEnv, $contenido, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "Se generó una clave aleatoria para la base de datos en backend/.env."
}

$DB_HOST = Leer-Env "DB_HOST" "localhost"
$DB_PORT = Leer-Env "DB_PORT" "5432"
$DB_DATABASE = Leer-Env "DB_DATABASE" "craftpedia"
$DB_USER = Leer-Env "DB_USER" "craftpedia_user"
$DB_PASSWORD = Leer-Env "DB_PASSWORD" ""
$PORT = Leer-Env "PORT" "3000"

Write-Host "Base: $DB_DATABASE en ${DB_HOST}:$DB_PORT (usuario $DB_USER)"

# 3. servicio de postgresql
Paso "Revisando PostgreSQL"

function Postgres-Responde {
  # los avisos de programas externos no deben cortar el script (powershell 5.1)
  $ErrorActionPreference = "Continue"
  if (-not $pgIsReady) { return $true }
  & $pgIsReady -h $DB_HOST -p $DB_PORT -q | Out-Null
  return ($LASTEXITCODE -eq 0)
}

if (-not (Postgres-Responde)) {
  $servicio = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($servicio) {
    Aviso "PostgreSQL no responde, intentando iniciar el servicio $($servicio.Name)."
    try {
      Start-Service -Name $servicio.Name
      Start-Sleep -Seconds 3
    } catch {
      Aviso "No se pudo iniciar el servicio (ejecuta como administrador o inícialo en services.msc)."
    }
  }
  if (-not (Postgres-Responde)) { Fallar "PostgreSQL no responde en ${DB_HOST}:$DB_PORT. Inícialo y vuelve a ejecutar el script." }
}

Write-Host "PostgreSQL responde en ${DB_HOST}:$DB_PORT."

# 4. usuario y base de datos
Paso "Creando usuario y base de datos (si no existen)"

$adminUser = if ($env:PG_ADMIN_USER) { $env:PG_ADMIN_USER } else { "postgres" }
# clave del proyecto: al instalar postgresql se pone "inf211" al usuario postgres
$adminPass = if ($env:PG_ADMIN_PASSWORD) { $env:PG_ADMIN_PASSWORD } else { "inf211" }

# pruebo la clave, si no sirve se la pido al usuario
function Clave-Sirve {
  $ErrorActionPreference = "Continue"
  $env:PGPASSWORD = $adminPass
  & $psql -h $DB_HOST -p $DB_PORT -U $adminUser -d postgres -tAc "SELECT 1" 2>&1 | Out-Null
  $ok = ($LASTEXITCODE -eq 0)
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  return $ok
}

if (-not (Clave-Sirve)) {
  Aviso "La clave '$adminPass' no sirve para el usuario '$adminUser'."
  $segura = Read-Host "Escribe la clave del superusuario '$adminUser' de PostgreSQL" -AsSecureString
  $adminPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura))
}

# ejecuta un script sql como superusuario
function Admin-Sql($sql, [string[]]$variables) {
  # psql en windows avisa de la pagina de codigos, eso no es un error
  $ErrorActionPreference = "Continue"
  $archivo = [IO.Path]::GetTempFileName()
  [IO.File]::WriteAllText($archivo, $sql, (New-Object System.Text.UTF8Encoding($false)))
  $env:PGPASSWORD = $adminPass
  try {
    $argumentos = @("-h", $DB_HOST, "-p", $DB_PORT, "-U", $adminUser, "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q")
    foreach ($v in $variables) { $argumentos += @("-v", $v) }
    & $psql @argumentos -f $archivo
    if ($LASTEXITCODE -ne 0) { Fallar "Falló la consulta como '$adminUser'. Revisa la clave del superusuario." }
  } finally {
    Remove-Item $archivo -ErrorAction SilentlyContinue
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  }
}

# ejecuta psql como el usuario de la aplicacion
function App-Psql([string[]]$extra) {
  $ErrorActionPreference = "Continue"
  $env:PGPASSWORD = $DB_PASSWORD
  try {
    & $psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_DATABASE -v ON_ERROR_STOP=1 -q @extra
  } finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  }
}

if ($Reiniciar) {
  Aviso "Se borrará la base $DB_DATABASE para cargarla de nuevo."
  Admin-Sql "SELECT format('DROP DATABASE IF EXISTS %I WITH (FORCE)', :'db') \gexec" @("db=$DB_DATABASE")
}

$sqlCrear = @'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'usr', :'pass')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'usr') \gexec

SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'usr', :'pass') \gexec

SELECT format('CREATE DATABASE %I OWNER %I ENCODING %L TEMPLATE template0', :'db', :'usr', 'UTF8')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
'@

Admin-Sql $sqlCrear @("usr=$DB_USER", "pass=$DB_PASSWORD", "db=$DB_DATABASE")
Write-Host "Usuario $DB_USER y base $DB_DATABASE listos."

# 5. datos
Paso "Cargando datos"

$tieneTablas = App-Psql @("-tAc", "SELECT to_regclass('public.items') IS NOT NULL")
if ($LASTEXITCODE -ne 0) { Fallar "No se pudo entrar a la base con el usuario $DB_USER. Revisa DB_PASSWORD en backend/.env." }

if ("$tieneTablas".Trim() -eq "t") {
  Write-Host "La base ya tiene datos, no se vuelve a cargar (usa -Reiniciar para recargarla)."
} else {
  App-Psql @("-f", "database/dump.sql") | Out-Null
  if ($LASTEXITCODE -ne 0) { Fallar "No se pudo cargar database/dump.sql." }
  Write-Host "Dump cargado."
}

App-Psql @("-tAc", "SELECT 'items: ' || (SELECT count(*) FROM items) || ', guias: ' || (SELECT count(*) FROM guias) || ', categorias: ' || (SELECT count(*) FROM categorias)")

# 6. dependencias
Paso "Instalando dependencias"

# node y sus dependencias viven en backend
# desde aqui solo corren programas externos, reviso su codigo de salida a mano
$ErrorActionPreference = "Continue"
Set-Location -Path (Join-Path $PSScriptRoot "backend")

$marca = "node_modules/.package-lock.json"
if ((Test-Path $marca) -and ((Get-Item -Force $marca).LastWriteTime -gt (Get-Item package-lock.json).LastWriteTime)) {
  Write-Host "Las dependencias ya están instaladas."
} else {
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { Fallar "Falló npm install." }
}

# 7. servidor
if ($SinIniciar) {
  Paso "Listo. Inicia la web con: cd backend; npm start"
  exit 0
}

Paso "Iniciando CraftPedia en http://localhost:$PORT (Ctrl+C para detener)"
npm start
