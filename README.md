# CraftPedia

Enciclopedia de Minecraft hecha para la evaluación de INF211. Permite leer, filtrar e insertar
datos en PostgreSQL desde la web.

**Tecnologías:** HTML, CSS, JavaScript, Bootstrap 5, Node.js, Express y PostgreSQL.

## Páginas

- **Inicio:** estadísticas, categorías y contenido destacado.
- **Ítems:** catálogo con filtros y formulario para agregar ítems.
- **Guías:** guías con filtros por dificultad, tema y texto.

## Instalación rápida (script)

Requisitos: Node.js 18 o superior y PostgreSQL 14 o superior instalados.

Los scripts revisan los requisitos, crean `backend/.env` con una clave aleatoria, crean el usuario y la base de
datos, cargan el dump, instalan las dependencias e inician la web en <http://localhost:3000>.
Se pueden ejecutar varias veces: si la base ya tiene datos, no la vuelven a cargar.

**Linux** (usa `sudo -u postgres` para crear la base):

```bash
git clone https://github.com/0xKroveth/prueba-html.git
cd prueba-html
./levantar.sh
```

**Windows:** al instalar PostgreSQL usa la clave `admin` para el usuario `postgres`. Después
doble clic en `levantar.bat` (o en PowerShell `.\levantar.ps1`). Si la clave es otra, el script la pide.

| Opción (Linux / Windows)         | Qué hace                                      |
| -------------------------------- | --------------------------------------------- |
| `--reiniciar` / `-Reiniciar`     | borra la base y la carga de nuevo desde el dump |
| `--sin-iniciar` / `-SinIniciar`  | prepara todo pero no inicia el servidor       |

Si el superusuario no es `postgres`, se indica con la variable `PG_ADMIN_USER`
(y en Windows `PG_ADMIN_PASSWORD` para no escribir la clave).

## Instalación manual

Requisitos: Node.js 18 o superior y PostgreSQL 14 o superior.

1. Descargar el proyecto e instalar las dependencias:

   ```bash
   git clone https://github.com/0xKroveth/prueba-html.git
   cd prueba-html/backend
   npm install
   cd ..
   ```

2. Crear el usuario y la base de datos (la clave la eliges tú):

   ```bash
   sudo -u postgres psql -c "CREATE ROLE craftpedia_user LOGIN PASSWORD 'tu_clave'"
   sudo -u postgres createdb -O craftpedia_user craftpedia
   ```

3. Cargar los datos:

   ```bash
   psql -h localhost -U craftpedia_user -d craftpedia -f database/dump.sql
   ```

4. Copiar la configuración y escribir la clave en `DB_PASSWORD` de `backend/.env`:

   ```bash
   cp backend/.env.example backend/.env
   ```

5. Iniciar el servidor y abrir <http://localhost:3000>:

   ```bash
   cd backend
   npm start
   ```

## Estructura

```text
frontend/   páginas HTML, estilos, JavaScript, Bootstrap e imágenes
backend/    servidor Node.js con Express, rutas de la API y package.json
database/   dump de PostgreSQL
levantar.*  scripts de instalación (Linux y Windows)
```
