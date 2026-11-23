# CraftPedia

Enciclopedia de Minecraft hecha para la evaluación de INF211. Permite leer, filtrar e insertar
datos en PostgreSQL desde la web.

**Tecnologías:** HTML, CSS, JavaScript, Bootstrap 5, Node.js, Express y PostgreSQL.

## Páginas

- **Inicio:** estadísticas, categorías y contenido destacado.
- **Ítems:** catálogo con filtros y formulario para agregar ítems.
- **Guías:** guías con filtros por dificultad, tema y texto.

## Instalación

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
public/     páginas, estilos, JavaScript e imágenes
src/        servidor Express y rutas de la API
```
