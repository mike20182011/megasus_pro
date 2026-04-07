--
-- PostgreSQL database dump
--

\restrict byqIwULNyblvjd3jjLGhOMYAHoBoWwZgj0l7ICgclXkBXlt1guvDaGO2pH9iKYe

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-03-30 18:32:50

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

--
-- TOC entry 4926 (class 0 OID 41739)
-- Dependencies: 221
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (placa, propietario, poliza, clase_vehiculo, marca, tipo, modelo, servicio, color, radicatoria) FROM stdin;
2033159	JUAN PEREZ MAMANI	774822-LPZ	MINIBUS	NISSAN	CARAVAN	2000	PUBLICO	DORADO	EL ALTO
1937FAS	JUAN PEREZ MAMANI	774822-LPZ	MINIBUS	NISSAN	CARAVAN	2000	PUBLICO	DORADO	EL ALTO
1852PHD	JUAN PEREZ MAMANI	774822-LPZ	MINIBUS	NISSAN	CARAVAN	2000	PUBLICO	DORADO	EL ALTO
\.


--
-- TOC entry 4928 (class 0 OID 41745)
-- Dependencies: 223
-- Data for Name: deudas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deudas (id, placa, gestion, detalle, importe_determinado, descuento, importe_pagar, condonaciones, importe_final) FROM stdin;
1	2033159	2023	IMPUESTO A LA PROPIEDAD VEHICULAR	450.00	45.00	405.00	0.00	405.00
2	2033159	2024	IMPUESTO A LA PROPIEDAD VEHICULAR	450.00	0.00	450.00	0.00	450.00
5	1937FAS	2023	IMPUESTO A LA PROPIEDAD VEHICULAR	450.00	45.00	405.00	0.00	405.00
6	1937FAS	2024	IMPUESTO A LA PROPIEDAD VEHICULAR	450.00	0.00	450.00	0.00	450.00
7	1852PHD	2023	IMPUESTO A LA PROPIEDAD VEHICULAR	450.00	45.00	405.00	0.00	405.00
8	1852PHD	2024	IMPUESTO A LA PROPIEDAD VEHICULAR	450.00	0.00	450.00	0.00	450.00
\.


--
-- TOC entry 4925 (class 0 OID 41496)
-- Dependencies: 220
-- Data for Name: historial_placas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_placas (id, texto_placa, fecha_hora, usuario_registro, total_deuda, propietario, marca, modelo) FROM stdin;
1	1852PHD	2026-03-16 10:05:46.859424	admin	0.00	\N	\N	\N
2	1852PHD	2026-03-16 10:58:33.738193	admin	0.00	\N	\N	\N
3	1852PHD	2026-03-16 18:27:00.959081	admin	0.00	\N	\N	\N
4	3529TBD	2026-03-16 18:27:30.0093	admin	0.00	\N	\N	\N
5	1852PHD	2026-03-17 14:43:13.759324	admin	0.00	\N	\N	\N
6	1852PHD	2026-03-17 15:36:39.071588	admin	0.00	\N	\N	\N
7	1852PHD	2026-03-17 15:37:59.904833	admin	0.00	\N	\N	\N
8	1852PHD	2026-03-17 16:33:37.293749	admin	0.00	\N	\N	\N
9	1852PHD	2026-03-17 17:17:07.686915	admin	0.00	\N	\N	\N
10	1852PHD	2026-03-18 22:27:50.852957	admin	0.00	\N	\N	\N
11	1852PHD	2026-03-19 11:00:19.176001	admin	0.00	\N	\N	\N
12	3529IDD	2026-03-30 15:21:02.899	Administrador	0.00	\N	\N	\N
13	3529TBD	2026-03-30 15:21:10.955	Administrador	0.00	\N	\N	\N
14	1852PHD	2026-03-30 15:24:03.769	Administrador	855.00	\N	\N	\N
15	1852PHD	2026-03-30 15:47:05.606	Administrador	855.00	\N	\N	\N
16	1852PHD	2026-03-30 15:50:53.38	Administrador	855.00	\N	\N	\N
17	1852PHD	2026-03-30 15:51:57.422	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
18	1852PHD	2026-03-30 15:52:27.644	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
19	1852PHD	2026-03-30 16:29:35.984	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
20	1852PHD	2026-03-30 16:44:42.433	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
21	1852PHD	2026-03-30 17:02:57.265	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
22	80L7VTA	2026-03-30 17:18:14.621	Administrador	0.00	DESCONOCIDO	N/A	0
23	3529TBD	2026-03-30 17:18:24.132	Administrador	0.00	DESCONOCIDO	N/A	0
24	1852PHD	2026-03-30 17:18:55.085	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
25	1852PHD	2026-03-30 17:49:11.831	Administrador	855.00	JUAN PEREZ MAMANI	NISSAN	2000
\.


--
-- TOC entry 4930 (class 0 OID 41760)
-- Dependencies: 225
-- Data for Name: reportes_robo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reportes_robo (id, placa, fecha_reporte, descripcion_incidente, estado, fecha_recuperacion, autoridad_cargo) FROM stdin;
1	1852PHD	2026-03-30 16:26:40.017505	Robo a mano armada en zona central	ACTIVO	\N	POLICIA NAL
\.


--
-- TOC entry 4923 (class 0 OID 41482)
-- Dependencies: 218
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre_usuario, email, password_hash, fecha_registro) FROM stdin;
1	admin	admin@ejemplo.com	$2b$10$gwQvtgq/jiZ6Hhcw6cayIeBb0eKS4mhyJkkCH0poY96H8zACrBU4C	2026-01-21 10:48:41.188523
2	operador1	operador@megasus.com	$2b$10$OS7/KvN/tQYwZ1M5e9m4vOchNpJiCyloLzOJSz/SyggX27LugzHRq	2026-03-24 17:23:41.559654
\.


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 222
-- Name: deudas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deudas_id_seq', 8, true);


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 219
-- Name: historial_placas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_placas_id_seq', 25, true);


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 224
-- Name: reportes_robo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reportes_robo_id_seq', 1, true);


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


-- Completed on 2026-03-30 18:32:50

--
-- PostgreSQL database dump complete
--

\unrestrict byqIwULNyblvjd3jjLGhOMYAHoBoWwZgj0l7ICgclXkBXlt1guvDaGO2pH9iKYe

