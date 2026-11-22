-- Dump de la base de datos demo_web (NovaTech Store, INF211).
-- Compatible con PostgreSQL 14 o superior.
-- Importar con: psql -U demo_user -h localhost -d demo_web -f database/dump.sql

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
-- Name: demo_categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demo_categorias (
    categoria_id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    descripcion character varying(200) NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: demo_categorias_categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.demo_categorias_categoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: demo_categorias_categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.demo_categorias_categoria_id_seq OWNED BY public.demo_categorias.categoria_id;


--
-- Name: demo_productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demo_productos (
    producto_id integer NOT NULL,
    nombre character varying(120) NOT NULL,
    descripcion character varying(500) NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    destacado boolean DEFAULT false NOT NULL,
    categoria_id integer NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT demo_productos_precio_check CHECK ((precio > (0)::numeric)),
    CONSTRAINT demo_productos_stock_check CHECK ((stock >= 0))
);


--
-- Name: demo_productos_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.demo_productos_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: demo_productos_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.demo_productos_producto_id_seq OWNED BY public.demo_productos.producto_id;


--
-- Name: mensajes_contacto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensajes_contacto (
    mensaje_id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    email character varying(120) NOT NULL,
    asunto character varying(120) NOT NULL,
    mensaje character varying(1000) NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mensajes_contacto_mensaje_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mensajes_contacto_mensaje_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mensajes_contacto_mensaje_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mensajes_contacto_mensaje_id_seq OWNED BY public.mensajes_contacto.mensaje_id;


--
-- Name: demo_categorias categoria_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_categorias ALTER COLUMN categoria_id SET DEFAULT nextval('public.demo_categorias_categoria_id_seq'::regclass);


--
-- Name: demo_productos producto_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_productos ALTER COLUMN producto_id SET DEFAULT nextval('public.demo_productos_producto_id_seq'::regclass);


--
-- Name: mensajes_contacto mensaje_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_contacto ALTER COLUMN mensaje_id SET DEFAULT nextval('public.mensajes_contacto_mensaje_id_seq'::regclass);


--
-- Data for Name: demo_categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.demo_categorias (categoria_id, nombre, descripcion, creado_en) FROM stdin;
1	Notebooks y computación	Equipos portátiles, mini PC y monitores para estudio y trabajo.	2026-11-22 19:06:28.657219+00
2	Smartphones y tablets	Dispositivos móviles, tablets y wearables de última generación.	2026-11-22 19:06:28.657219+00
3	Audio y accesorios	Audífonos, parlantes y periféricos para tu setup.	2026-11-22 19:06:28.657219+00
4	Redes y seguridad	Router, cámaras IP y soluciones de conectividad.	2026-11-22 19:06:28.657219+00
\.


--
-- Data for Name: demo_productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.demo_productos (producto_id, nombre, descripcion, precio, stock, destacado, categoria_id, creado_en) FROM stdin;
1	Notebook NovaBook Pro 14	Notebook con procesador de 12 núcleos, 16 GB de RAM y SSD de 1 TB. Ideal para desarrollo y diseño.	899990.00	12	t	1	2026-11-22 19:06:28.65913+00
2	Notebook NovaBook Air 13	Ultrabook liviana de 1,1 kg, pantalla Full HD y hasta 14 horas de autonomía.	649990.00	18	f	1	2026-11-22 19:06:28.65913+00
3	Mini PC NovaCube X1	Equipo compacto con 16 GB de RAM y SSD de 512 GB. Perfecto para oficina y punto de venta.	429990.00	9	f	1	2026-11-22 19:06:28.65913+00
4	Monitor UltraWide 29"	Monitor IPS 2560 x 1080 con 75 Hz, altavoces integrados y conexión HDMI/DisplayPort.	279990.00	15	f	1	2026-11-22 19:06:28.65913+00
5	Smartphone NovaPhone 5G	Pantalla AMOLED de 6,5", 256 GB de almacenamiento y cámara principal de 108 MP.	499990.00	25	t	2	2026-11-22 19:06:28.65913+00
6	Tablet NovaPad 11	Tablet de 11" con lápiz incluido, 128 GB y batería para todo el día.	329990.00	14	f	2	2026-11-22 19:06:28.65913+00
7	Smartwatch NovaWatch Fit	Reloj deportivo con GPS, monitor de ritmo cardíaco y resistencia al agua 5 ATM.	129990.00	30	f	2	2026-11-22 19:06:28.65913+00
8	Audífonos NovaBuds ANC	Audífonos inalámbricos con cancelación activa de ruido y estuche de carga rápida.	79990.00	40	t	3	2026-11-22 19:06:28.65913+00
9	Parlante Bluetooth NovaSound	Parlante portátil de 30 W, resistente al agua IPX7 y 18 horas de reproducción.	59990.00	22	f	3	2026-11-22 19:06:28.65913+00
10	Teclado mecánico NovaType K7	Teclado mecánico inalámbrico con switches táctiles y retroiluminación RGB.	89990.00	17	f	3	2026-11-22 19:06:28.65913+00
11	Router WiFi 6 NovaNet AX3000	Router dual band con WiFi 6, control parental y red de invitados.	119990.00	11	f	4	2026-11-22 19:06:28.65913+00
12	Cámara IP NovaCam 2K	Cámara de seguridad interior/exterior con visión nocturna y notificaciones al móvil.	64990.00	20	f	4	2026-11-22 19:06:28.65913+00
\.


--
-- Data for Name: mensajes_contacto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mensajes_contacto (mensaje_id, nombre, email, asunto, mensaje, creado_en) FROM stdin;
1	María Fernández	maria.fernandez@example.com	Consulta por Notebook Pro	Hola, quisiera saber si la Notebook NovaBook Pro 14 tiene stock disponible para retiro en tienda. Gracias.	2026-11-22 19:06:28.662337+00
\.


--
-- Name: demo_categorias_categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.demo_categorias_categoria_id_seq', 4, true);


--
-- Name: demo_productos_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.demo_productos_producto_id_seq', 12, true);


--
-- Name: mensajes_contacto_mensaje_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mensajes_contacto_mensaje_id_seq', 1, true);


--
-- Name: demo_categorias demo_categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_categorias
    ADD CONSTRAINT demo_categorias_nombre_key UNIQUE (nombre);


--
-- Name: demo_categorias demo_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_categorias
    ADD CONSTRAINT demo_categorias_pkey PRIMARY KEY (categoria_id);


--
-- Name: demo_productos demo_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_productos
    ADD CONSTRAINT demo_productos_pkey PRIMARY KEY (producto_id);


--
-- Name: mensajes_contacto mensajes_contacto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_contacto
    ADD CONSTRAINT mensajes_contacto_pkey PRIMARY KEY (mensaje_id);


--
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_categoria ON public.demo_productos USING btree (categoria_id);


--
-- Name: idx_productos_precio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_precio ON public.demo_productos USING btree (precio);


--
-- Name: demo_productos demo_productos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demo_productos
    ADD CONSTRAINT demo_productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.demo_categorias(categoria_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


