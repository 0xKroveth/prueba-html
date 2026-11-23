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

Los scripts revisan los requisitos, crean `.env` con una clave aleatoria, crean el usuario y la base de
datos, cargan el dump, instalan las dependencias e inician la web en <http://localhost:3000>.
Se pueden ejecutar varias veces: si la base ya tiene datos, no la vuelven a cargar.

**Linux** (usa `sudo -u postgres` para crear la base):

```bash
git clone https://github.com/0xKroveth/prueba-html.git
cd prueba-html
./levantar.sh
```

**Windows:** doble clic en `levantar.bat`, o en PowerShell `.\levantar.ps1`. Pide la clave del
usuario `postgres` que se eligió al instalar PostgreSQL.

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
   cd prueba-html
   npm install
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

4. Copiar la configuración y escribir la clave en `DB_PASSWORD`:

   ```bash
   cp .env.example .env
   ```

5. Iniciar el servidor y abrir <http://localhost:3000>:

   ```bash
   npm start
   ```

## Estructura

```text
database/   dump de la base de datos
levantar.*  scripts de instalación (Linux y Windows)
public/     páginas, estilos, JavaScript e imágenes
src/        servidor Express y rutas de la API
```
