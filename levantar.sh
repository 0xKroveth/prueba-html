#!/usr/bin/env bash
# Levanta CraftPedia en Linux: base de datos PostgreSQL + servidor web.
#
# Uso:
#   ./levantar.sh               prepara todo (si falta) e inicia la web
#   ./levantar.sh --reiniciar   borra la base y la vuelve a cargar desde el dump
#   ./levantar.sh --sin-iniciar prepara todo pero no inicia el servidor
#
# Por defecto usa "sudo -u postgres" para crear el usuario y la base.
# Si tu PostgreSQL usa otro superusuario, define PG_ADMIN_USER
# (y PGPASSWORD si pide clave), por ejemplo: PG_ADMIN_USER=postgres ./levantar.sh

set -euo pipefail

cd "$(dirname "$0")"

REINICIAR=0
INICIAR=1

for arg in "$@"; do
  case "$arg" in
    --reiniciar) REINICIAR=1 ;;
    --sin-iniciar) INICIAR=0 ;;
    -h | --help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Opción desconocida: $arg (usa --help)" >&2
      exit 1
      ;;
  esac
done

paso() { printf '\n\033[1;32m==>\033[0m %s\n' "$1"; }
aviso() { printf '\033[1;33m[aviso]\033[0m %s\n' "$1"; }
error() {
  printf '\033[1;31m[error]\033[0m %s\n' "$1" >&2
  exit 1
}

# lee una variable del .env (sin ejecutar el archivo)
leer_env() {
  local valor
  valor=$(grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- | tr -d '\r') || true
  valor="${valor%\"}"
  valor="${valor#\"}"
  echo "${valor:-$2}"
}

# 1. requisitos
paso "Revisando requisitos"

command -v node > /dev/null || error "No se encontró Node.js. Instala Node.js 18 o superior."
command -v npm > /dev/null || error "No se encontró npm."
command -v psql > /dev/null || error "No se encontró psql. Instala PostgreSQL 14 o superior."

VERSION_NODE=$(node -p 'process.versions.node.split(".")[0]')
[ "$VERSION_NODE" -ge 18 ] || error "Se necesita Node.js 18 o superior (tienes $(node -v))."

echo "Node.js $(node -v), $(psql --version)"

# 2. archivo .env
paso "Configurando .env"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Se creó .env a partir de .env.example."
fi

if [ "$(leer_env DB_PASSWORD '')" = "" ] || [ "$(leer_env DB_PASSWORD '')" = "cambia_esta_clave" ]; then
  CLAVE=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 20 || true)
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$CLAVE/" .env
  echo "Se generó una clave aleatoria para la base de datos en .env."
fi

DB_HOST=$(leer_env DB_HOST localhost)
DB_PORT=$(leer_env DB_PORT 5432)
DB_DATABASE=$(leer_env DB_DATABASE craftpedia)
DB_USER=$(leer_env DB_USER craftpedia_user)
DB_PASSWORD=$(leer_env DB_PASSWORD '')
PORT=$(leer_env PORT 3000)

echo "Base: $DB_DATABASE en $DB_HOST:$DB_PORT (usuario $DB_USER)"

# 3. servicio de postgresql
paso "Revisando PostgreSQL"

if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2> /dev/null; then
  if command -v systemctl > /dev/null; then
    aviso "PostgreSQL no responde, intentando iniciar el servicio (puede pedir tu clave)."
    sudo systemctl start postgresql || true
    sleep 2
  fi
  pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2> /dev/null ||
    error "PostgreSQL no responde en $DB_HOST:$DB_PORT. Inícialo y vuelve a ejecutar el script."
fi

echo "PostgreSQL responde en $DB_HOST:$DB_PORT."

# psql como superusuario
admin_psql() {
  if [ -n "${PG_ADMIN_USER:-}" ]; then
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$PG_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -q "$@"
  else
    (cd /tmp && sudo -u postgres psql -p "$DB_PORT" -d postgres -v ON_ERROR_STOP=1 -q "$@")
  fi
}

# psql como el usuario de la aplicacion
app_psql() {
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_DATABASE" \
    -v ON_ERROR_STOP=1 -q "$@"
}

# 4. usuario y base de datos
paso "Creando usuario y base de datos (si no existen)"

if [ -z "${PG_ADMIN_USER:-}" ]; then
  echo "Se usará sudo -u postgres (puede pedir tu clave de Linux)."
fi

if [ "$REINICIAR" -eq 1 ]; then
  aviso "Se borrará la base $DB_DATABASE para cargarla de nuevo."
  admin_psql -v db="$DB_DATABASE" << 'SQL'
SELECT format('DROP DATABASE IF EXISTS %I WITH (FORCE)', :'db') \gexec
SQL
fi

admin_psql -v usr="$DB_USER" -v pass="$DB_PASSWORD" -v db="$DB_DATABASE" << 'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'usr', :'pass')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'usr') \gexec

SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'usr', :'pass') \gexec

SELECT format('CREATE DATABASE %I OWNER %I ENCODING %L TEMPLATE template0', :'db', :'usr', 'UTF8')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
SQL

echo "Usuario $DB_USER y base $DB_DATABASE listos."

# 5. datos
paso "Cargando datos"

TIENE_TABLAS=$(app_psql -tAc "SELECT to_regclass('public.items') IS NOT NULL") ||
  error "No se pudo entrar a la base con el usuario $DB_USER. Revisa DB_PASSWORD en .env."

if [ "$TIENE_TABLAS" = "t" ]; then
  echo "La base ya tiene datos, no se vuelve a cargar (usa --reiniciar para recargarla)."
else
  app_psql -f database/dump.sql > /dev/null
  echo "Dump cargado."
fi

app_psql -tAc "SELECT 'items: ' || (SELECT count(*) FROM items) || ', guías: ' || (SELECT count(*) FROM guias) || ', categorías: ' || (SELECT count(*) FROM categorias)"

# 6. dependencias
paso "Instalando dependencias"

if [ -f node_modules/.package-lock.json ] && [ node_modules/.package-lock.json -nt package-lock.json ]; then
  echo "Las dependencias ya están instaladas."
else
  npm install --no-audit --no-fund
fi

# 7. servidor
if [ "$INICIAR" -eq 0 ]; then
  paso "Listo. Inicia la web con: npm start"
  exit 0
fi

paso "Iniciando CraftPedia en http://localhost:$PORT (Ctrl+C para detener)"
exec npm start
