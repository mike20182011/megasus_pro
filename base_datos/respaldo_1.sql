--
-- PostgreSQL database dump
--

\restrict 7aWWcQDlQQTm6f58ycNpHbjfhFzcQoANwTS6fkuy0SZoMpnWKL0sykXTftkxIYJ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-03-30 18:30:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 41745)
-- Name: deudas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deudas (
    id integer NOT NULL,
    placa character varying(20),
    gestion integer,
    detalle text,
    importe_determinado numeric(10,2),
    descuento numeric(10,2),
    importe_pagar numeric(10,2),
    condonaciones numeric(10,2),
    importe_final numeric(10,2)
);


ALTER TABLE public.deudas OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 41744)
-- Name: deudas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deudas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deudas_id_seq OWNER TO postgres;

--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 222
-- Name: deudas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deudas_id_seq OWNED BY public.deudas.id;


--
-- TOC entry 220 (class 1259 OID 41496)
-- Name: historial_placas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_placas (
    id integer NOT NULL,
    texto_placa character varying(20) NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_registro character varying(50),
    total_deuda numeric(10,2) DEFAULT 0,
    propietario character varying(100),
    marca character varying(50),
    modelo integer
);


ALTER TABLE public.historial_placas OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 41495)
-- Name: historial_placas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_placas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_placas_id_seq OWNER TO postgres;

--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 219
-- Name: historial_placas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_placas_id_seq OWNED BY public.historial_placas.id;


--
-- TOC entry 225 (class 1259 OID 41760)
-- Name: reportes_robo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes_robo (
    id integer NOT NULL,
    placa character varying(20),
    fecha_reporte timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    descripcion_incidente text,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying,
    fecha_recuperacion timestamp without time zone,
    autoridad_cargo character varying(100)
);


ALTER TABLE public.reportes_robo OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 41759)
-- Name: reportes_robo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reportes_robo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reportes_robo_id_seq OWNER TO postgres;

--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 224
-- Name: reportes_robo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reportes_robo_id_seq OWNED BY public.reportes_robo.id;


--
-- TOC entry 218 (class 1259 OID 41482)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 41481)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 221 (class 1259 OID 41739)
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    placa character varying(20) NOT NULL,
    propietario character varying(100),
    poliza character varying(50),
    clase_vehiculo character varying(50),
    marca character varying(50),
    tipo character varying(50),
    modelo integer,
    servicio character varying(50),
    color character varying(50),
    radicatoria character varying(50)
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- TOC entry 4766 (class 2604 OID 41748)
-- Name: deudas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deudas ALTER COLUMN id SET DEFAULT nextval('public.deudas_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 41499)
-- Name: historial_placas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_placas ALTER COLUMN id SET DEFAULT nextval('public.historial_placas_id_seq'::regclass);


--
-- TOC entry 4767 (class 2604 OID 41763)
-- Name: reportes_robo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_robo ALTER COLUMN id SET DEFAULT nextval('public.reportes_robo_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 41485)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4781 (class 2606 OID 41752)
-- Name: deudas deudas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deudas
    ADD CONSTRAINT deudas_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 41502)
-- Name: historial_placas historial_placas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_placas
    ADD CONSTRAINT historial_placas_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 41769)
-- Name: reportes_robo reportes_robo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_robo
    ADD CONSTRAINT reportes_robo_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 41494)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4773 (class 2606 OID 41492)
-- Name: usuarios usuarios_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- TOC entry 4775 (class 2606 OID 41490)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 41743)
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (placa);


--
-- TOC entry 4784 (class 2606 OID 41753)
-- Name: deudas deudas_placa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deudas
    ADD CONSTRAINT deudas_placa_fkey FOREIGN KEY (placa) REFERENCES public.vehiculos(placa);


--
-- TOC entry 4785 (class 2606 OID 41770)
-- Name: reportes_robo reportes_robo_placa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_robo
    ADD CONSTRAINT reportes_robo_placa_fkey FOREIGN KEY (placa) REFERENCES public.vehiculos(placa);


-- Completed on 2026-03-30 18:30:58

--
-- PostgreSQL database dump complete
--

\unrestrict 7aWWcQDlQQTm6f58ycNpHbjfhFzcQoANwTS6fkuy0SZoMpnWKL0sykXTftkxIYJ

