--
-- CraftPedia · Dump de la base de datos "craftpedia" (INF211)
-- Compatible con PostgreSQL 14 o superior.
--
-- Importación:
--   createdb -U craftpedia_user craftpedia
--   psql -U craftpedia_user -d craftpedia -f database/dump.sql
--
--
-- PostgreSQL database dump
--


-- Dumped from database version 18.7
-- Dumped by pg_dump version 18.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    categoria_id integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(200) NOT NULL,
    icono character varying(64) NOT NULL,
    slug character varying(40) NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categorias_categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorias_categoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorias_categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorias_categoria_id_seq OWNED BY public.categorias.categoria_id;


--
-- Name: guias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guias (
    guia_id integer NOT NULL,
    titulo character varying(120) NOT NULL,
    resumen character varying(300) NOT NULL,
    contenido text NOT NULL,
    tema character varying(40) NOT NULL,
    dificultad character varying(20) NOT NULL,
    version character varying(20) NOT NULL,
    duracion character varying(30) NOT NULL,
    icono character varying(16) DEFAULT '📖'::character varying NOT NULL,
    destacada boolean DEFAULT false NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT guias_dificultad_check CHECK (((dificultad)::text = ANY ((ARRAY['Principiante'::character varying, 'Intermedio'::character varying, 'Avanzado'::character varying])::text[])))
);


--
-- Name: guias_guia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.guias_guia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guias_guia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.guias_guia_id_seq OWNED BY public.guias.guia_id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    item_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(500) NOT NULL,
    obtencion character varying(300) NOT NULL,
    categoria_id integer NOT NULL,
    rareza character varying(20) NOT NULL,
    version character varying(20) NOT NULL,
    stack_max integer DEFAULT 64 NOT NULL,
    icono character varying(64) DEFAULT '🧱'::character varying NOT NULL,
    destacado boolean DEFAULT false NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT items_rareza_check CHECK (((rareza)::text = ANY ((ARRAY['Común'::character varying, 'Poco común'::character varying, 'Raro'::character varying, 'Épico'::character varying, 'Legendario'::character varying])::text[]))),
    CONSTRAINT items_stack_max_check CHECK (((stack_max >= 1) AND (stack_max <= 64)))
);


--
-- Name: items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_item_id_seq OWNED BY public.items.item_id;





--
-- Name: categorias categoria_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias ALTER COLUMN categoria_id SET DEFAULT nextval('public.categorias_categoria_id_seq'::regclass);


--
-- Name: guias guia_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guias ALTER COLUMN guia_id SET DEFAULT nextval('public.guias_guia_id_seq'::regclass);


--
-- Name: items item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN item_id SET DEFAULT nextval('public.items_item_id_seq'::regclass);



--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categorias (categoria_id, nombre, descripcion, icono, slug, creado_en) FROM stdin;
1	Bloques	Materiales de construcción, desde tierra hasta bloques legendarios.	grass_block	bloques	2026-11-22 19:31:35.507867+00
2	Herramientas	Picos, hachas, palas y espadas para cada aventura.	diamond_pickaxe	herramientas	2026-11-22 19:31:35.507867+00
3	Armaduras	Protección para sobrevivir al Nether, al End y a todo lo demás.	diamond_chestplate	armaduras	2026-11-22 19:31:35.507867+00
4	Comida	Alimentos para recuperar hambre y activar efectos especiales.	apple	comida	2026-11-22 19:31:35.507867+00
5	Redstone	Circuitos, pistones y automatización para tus granjas.	redstone	redstone	2026-11-22 19:31:35.507867+00
6	Mobs	Criaturas pacíficas, neutrales y hostiles del mundo.	creeper_face	mobs	2026-11-22 19:31:35.507867+00
\.


--
-- Data for Name: guias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guias (guia_id, titulo, resumen, contenido, tema, dificultad, version, duracion, icono, destacada, creado_en) FROM stdin;
1	Primera noche: sobrevive sin morir	Consigue madera, herramientas y un refugio antes de que caiga el sol.	1. Golpea árboles para conseguir madera y crea una mesa de crafteo.\n2. Fabrica un pico de madera y mina piedra para mejorar tus herramientas.\n3. Consigue carbón, crea antorchas y busca un lugar seguro.\n4. Construye un refugio pequeño y coloca una cama.\n5. Guarda comida y no salgas de noche hasta tener armadura.	Supervivencia	Principiante	1.21	30 min	apple	t	2026-11-22 19:31:35.512539+00
2	Dónde encontrar diamantes (sin morir)	Técnicas de minería por capas, branch mining y seguridad bajo tierra.	1. Lleva pico de hierro o mejor, antorchas, comida y bloques para tapar huecos.\n2. Baja hasta la capa -58, donde los diamantes son más comunes.\n3. Excava un túnel principal y ramas laterales cada 3 bloques.\n4. Coloca antorchas y sella las cuevas con bloques para evitar mobs.\n5. Usa un cubo de agua para protegerte de la lava.	Minería	Intermedio	1.21	45 min	diamond_pickaxe	t	2026-11-22 19:31:35.512539+00
3	Granja de hierro compacta	Diseño con aldeanos, camas y agua para generar hierro de forma automática.	1. Prepara una plataforma de 9x9 y delimita el área con bloques.\n2. Coloca tres aldeanos con camas y un zombi para asustarlos.\n3. Instala canales de agua que empujen al golem hacia un punto de recogida.\n4. Usa un embudo y un cofre para almacenar el hierro.\n5. Ilumina la zona y revisa que los aldeanos no puedan escapar.	Redstone	Avanzado	1.21	60 min	redstone	f	2026-11-22 19:31:35.512539+00
4	Explora el Nether con seguridad	Equipo mínimo, portal y ruta segura para tu primera incursión.	1. Construye un portal de obsidiana de 4x5 y enciéndelo con pedernal y acero.\n2. Lleva armadura de hierro, espada, comida y bloques de construcción.\n3. Anota las coordenadas del portal antes de avanzar.\n4. Construye un camino protegido y evita mirar a los endermans.\n5. Vuelve con blaze rods, cuarzo y netherite.	Nether	Intermedio	1.21	40 min	netherrack	f	2026-11-22 19:31:35.512539+00
5	Derrota al dragón del End	Preparación, crystals y estrategia para completar el juego.	1. Consigue armadura encantada, arco con Poder y flechas suficientes.\n2. Lleva bloques, comida, pociones y una cama para el combate final.\n3. Destruye los cristales del End con flechas o perlas de ender.\n4. Espera a que el dragón aterrice y ataca su cabeza con la espada.\n5. Evita el aliento del dragón y usa perlas para escapar si caes.	End	Avanzado	1.21	90 min	ender_eye	t	2026-11-22 19:31:35.512539+00
6	Domina la mesa de encantamientos	Cómo conseguir niveles, libros y las mejores combinaciones.	1. Consigue obsidiana, diamantes y un libro para fabricar la mesa.\n2. Rodea la mesa con 15 estanterías para alcanzar el nivel 30.\n3. Sube de nivel minando, cocinando o comerciando con aldeanos.\n4. Encanta por separado y combina libros con un yunque.\n5. Prioriza Protección, Eficiencia y Fortuna para tu equipo principal.	Encantamientos	Intermedio	1.20	35 min	enchanting_table	f	2026-11-22 19:31:35.512539+00
7	Construye una casa medieval	Materiales, proporciones y detalles para una base con estilo.	1. Elige un terreno plano y marca un rectángulo de 11x9.\n2. Levanta muros de piedra y madera alternando texturas.\n3. Añade un techo a dos aguas con escaleras y losas.\n4. Incorpora ventanas, antorchas y un jardín exterior.\n5. Decora el interior con alfombras, cuadros y cofres.	Construcción	Principiante	1.20	50 min	bricks	f	2026-11-22 19:31:35.512539+00
8	Granja de cultivos automática	Redstone, agua y observadores para cosechar sin esfuerzo.	1. Prepara una parcela de tierra con agua en el centro.\n2. Coloca observadores mirando los cultivos y pistones debajo.\n3. Conecta la redstone con repetidores y palancas.\n4. Añade canales de agua para llevar la cosecha a un cofre.\n5. Prueba el circuito con trigo o zanahorias antes de ampliarlo.	Granjas	Intermedio	1.21	40 min	wheat	f	2026-11-22 19:31:35.512539+00
9	Comercia como un experto con aldeanos	Cómo conseguir mejores precios y desbloquear intercambios útiles.	1. Encuentra una aldea y protege a los aldeanos de los mobs.\n2. Coloca sus puestos de trabajo para definir profesiones.\n3. Comercia varias veces para subir su nivel.\n4. Cura a un aldeano zombi para obtener descuentos permanentes.\n5. Compara precios entre aldeanos antes de gastar esmeraldas.	Aldeas	Principiante	1.20	25 min	emerald	f	2026-11-22 19:31:35.512539+00
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.items (item_id, nombre, descripcion, obtencion, categoria_id, rareza, version, stack_max, icono, destacado, creado_en) FROM stdin;
1	Bloque de diamante	Bloque decorativo y almacenamiento compacto de diamantes. Ideal para exhibir tu progreso.	Minando diamantes y combinando 9 en una mesa de crafteo.	1	Legendario	1.21	64	diamond_block	t	2026-11-22 19:31:35.509788+00
2	Bloque de hierro	Bloque metálico usado para decoración, almacenamiento y para crear golems de hierro.	Fundiendo hierro y combinando 9 lingotes en una mesa de crafteo.	1	Común	1.21	64	iron_block	f	2026-11-22 19:31:35.509788+00
3	Tierra	Bloque básico de construcción y agricultura. Puedes convertirlo en césped con una pala.	Rompiendo bloques de tierra con una pala o a mano.	1	Común	1.20	64	dirt	f	2026-11-22 19:31:35.509788+00
4	Piedra	Bloque resistente para construir refugios, caminos y estructuras. Se convierte en piedra lisa al fundirse.	Minando piedra con un pico de madera o superior.	1	Común	1.21	64	stone	f	2026-11-22 19:31:35.509788+00
5	Obsidiana	Bloque muy resistente que aparece cuando la lava se enfría. Necesario para construir portales al Nether.	Enfriando lava con agua o minando con un pico de diamante.	1	Raro	1.21	64	obsidian	f	2026-11-22 19:31:35.509788+00
6	Pico de diamante	Herramienta rápida y duradera para minar obsidiana y casi cualquier bloque del juego.	Crafteando con 3 diamantes y 2 palos en una mesa de crafteo.	2	Raro	1.21	1	diamond_pickaxe	t	2026-11-22 19:31:35.509788+00
7	Espada de netherita	Una de las mejores armas del juego: alto daño y gran durabilidad para enfrentar mobs peligrosos.	Mejorando una espada de diamante con un lingote de netherita y una plantilla.	2	Legendario	1.21	1	netherite_sword	t	2026-11-22 19:31:35.509788+00
8	Hacha de hierro	Herramienta equilibrada para talar madera y defenderse. Más rápida que el hacha de piedra.	Crafteando con 3 lingotes de hierro y 2 palos.	2	Poco común	1.20	1	iron_axe	f	2026-11-22 19:31:35.509788+00
9	Pala de oro	Pala muy rápida para mover tierra, arena y grava, aunque con poca durabilidad.	Crafteando con 1 lingote de oro y 2 palos.	2	Poco común	1.20	1	golden_shovel	f	2026-11-22 19:31:35.509788+00
11	Casco de tortuga	Casco especial que otorga el efecto Respiración acuática mientras lo llevas puesto.	Crafteando con 5 escamas de tortuga.	3	Poco común	1.20	1	turtle_helmet	f	2026-11-22 19:31:35.509788+00
12	Elytra	Alas para planear por el mundo. Se combinan con cohetes de fuego artificial para volar distancias largas.	Encontrándola en la ciudad del End.	3	Épico	1.21	1	elytra	t	2026-11-22 19:31:35.509788+00
13	Manzana dorada	Comida especial que regenera vida y otorga resistencia. Fundamental para peleas difíciles.	Crafteando con 8 lingotes de oro y una manzana.	4	Raro	1.21	64	golden_apple	t	2026-11-22 19:31:35.509788+00
14	Pan	Alimento sencillo y económico que recupera hambre. Perfecto para los primeros días.	Crafteando con 3 trigo en una mesa de crafteo.	4	Común	1.20	64	bread	f	2026-11-22 19:31:35.509788+00
10	Casco de diamante	Protege la cabeza con la mejor armadura del juego. Reduce el daño recibido y aporta 3 puntos de armadura.	Craftea con 5 diamantes en una mesa de trabajo.	3	Raro	1.21	1	diamond_helmet	f	2026-11-22 19:31:35.509788+00
15	Estofado de hongos	Comida que recupera mucha hambre y puede dejar un cuenco vacío al consumirse.	Crafteando con un cuenco, un hongo rojo y un hongo marrón.	4	Poco común	1.21	1	mushroom_stew	f	2026-11-22 19:31:35.509788+00
16	Bloque de redstone	Bloque compacto de redstone. También se usa como fuente de energía en algunos circuitos.	Combinando 9 polvos de redstone en una mesa de crafteo.	5	Poco común	1.21	64	redstone_block	f	2026-11-22 19:31:35.509788+00
17	Pistón	Componente de redstone que empuja bloques y entidades. Base de muchas granjas automáticas.	Crafteando con madera, piedra, hierro y redstone.	5	Poco común	1.21	64	piston	f	2026-11-22 19:31:35.509788+00
21	Pechera de diamante	La pieza central de la armadura de diamante. Cubre el torso y aporta 8 puntos de armadura.	Craftea con 8 diamantes en una mesa de trabajo.	3	Raro	1.21	1	diamond_chestplate	f	2026-11-22 20:12:07.393996+00
22	Pantalón de diamante	Protege las piernas y completa el conjunto de diamante. Aporta 6 puntos de armadura.	Craftea con 7 diamantes en una mesa de trabajo.	3	Raro	1.21	1	diamond_leggings	f	2026-11-22 20:12:07.393996+00
23	Botas de diamante	Protegen los pies y reducen el daño de caída. Aportan 3 puntos de armadura.	Craftea con 4 diamantes en una mesa de trabajo.	3	Raro	1.21	1	diamond_boots	f	2026-11-22 20:12:07.393996+00
18	Creeper	Mob hostil que se acerca en silencio y explota. Nunca lo dejes llegar a tu base.	Aparece de noche o en cuevas; explota al acercarte.	6	Raro	1.21	1	creeper_face	t	2026-11-22 19:31:35.509788+00
19	Enderman	Mob neutral que se teletransporta y se vuelve hostil si lo miras a los ojos.	Aparece en el End, en el Nether y en cuevas oscuras.	6	Épico	1.21	1	enderman_face	f	2026-11-22 19:31:35.509788+00
20	Aldeano	Habitante de las aldeas con el que puedes comerciar. Cada profesión ofrece intercambios distintos.	Aparece en aldeas; puedes comerciar con él.	6	Común	1.20	1	villager_face	f	2026-11-22 19:31:35.509788+00
\.



--
-- Name: categorias_categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categorias_categoria_id_seq', 6, true);


--
-- Name: guias_guia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.guias_guia_id_seq', 9, true);


--
-- Name: items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.items_item_id_seq', 23, true);



--
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (categoria_id);


--
-- Name: categorias categorias_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_slug_key UNIQUE (slug);


--
-- Name: guias guias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guias
    ADD CONSTRAINT guias_pkey PRIMARY KEY (guia_id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);



--
-- Name: idx_guias_dificultad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guias_dificultad ON public.guias USING btree (dificultad);


--
-- Name: idx_guias_tema; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guias_tema ON public.guias USING btree (tema);


--
-- Name: idx_items_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_categoria ON public.items USING btree (categoria_id);


--
-- Name: idx_items_rareza; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_rareza ON public.items USING btree (rareza);


--
-- Name: idx_items_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_version ON public.items USING btree (version);


--
-- Name: items items_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(categoria_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


