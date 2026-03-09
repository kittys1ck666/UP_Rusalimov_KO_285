--
-- PostgreSQL database dump
--

\restrict LCDOAn8lDIBKGKl3fgj0HiX4TDO5aK3MQMbK3n5Ux5Z8xgoTQvbWBKOdRf1czuH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-03-09 16:33:40

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
-- TOC entry 222 (class 1259 OID 26173)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    comment_id integer NOT NULL,
    message text NOT NULL,
    master_id integer,
    request_id integer NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 26172)
-- Name: comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_comment_id_seq OWNER TO postgres;

--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 221
-- Name: comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_comment_id_seq OWNED BY public.comments.comment_id;


--
-- TOC entry 220 (class 1259 OID 26150)
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    request_id integer NOT NULL,
    start_date date,
    climate_tech_type character varying(120),
    climate_tech_model character varying(120),
    problem_description text,
    request_status character varying(50),
    completion_date date,
    repair_parts text,
    master_id integer,
    client_id integer NOT NULL,
    CONSTRAINT requests_check CHECK (((completion_date IS NULL) OR (start_date IS NULL) OR (completion_date >= start_date)))
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 26149)
-- Name: requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requests_request_id_seq OWNER TO postgres;

--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 219
-- Name: requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requests_request_id_seq OWNED BY public.requests.request_id;


--
-- TOC entry 218 (class 1259 OID 26141)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    fio character varying(200) NOT NULL,
    phone character varying(30),
    login character varying(100),
    password character varying(200),
    type character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 26140)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4754 (class 2604 OID 26176)
-- Name: comments comment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN comment_id SET DEFAULT nextval('public.comments_comment_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 26153)
-- Name: requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests ALTER COLUMN request_id SET DEFAULT nextval('public.requests_request_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 26144)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4921 (class 0 OID 26173)
-- Dependencies: 222
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (comment_id, message, master_id, request_id) FROM stdin;
1	Интересная поломка	2	1
2	Очень странно, будем разбираться!	3	2
3	Скорее всего потребуется мотор обдува!	2	7
4	Интересная проблема	2	1
5	Очень странно, будем разбираться!	3	6
7	Продление срока: test	3	2
\.


--
-- TOC entry 4919 (class 0 OID 26150)
-- Dependencies: 220
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (request_id, start_date, climate_tech_type, climate_tech_model, problem_description, request_status, completion_date, repair_parts, master_id, client_id) FROM stdin;
1	2023-06-06	Кондиционер	TCL TAC-12CHSA/TPG-W белый	Не охлаждает воздух	В процессе ремонта	\N	\N	2	7
3	2022-07-07	Увлажнитель воздуха	Xiaomi Smart Humidifier 2	Пар имеет неприятный запах	Готова к выдаче	2023-01-01	\N	3	9
5	2023-08-02	Сушилка для рук	Ballu BAHD-1250	Не работает	Новая заявка	\N	\N	\N	9
6	2023-02-06	Увлажнитель воздуха	Kitfort KT-2801-1 белый	Не включается	В процессе ремонта	\N	\N	2	7
7	2023-02-06	Вентилятор	Xiaomi Mi Smart Standing Fan 2 Lite	Шумит при работе	В процессе ремонта	\N	\N	2	8
2	2023-05-05	Кондиционер	Electrolux EACS/I-09HAT/N3_21Y белый	Выключается сам по себе	Ожидание запчастей	2026-03-10	\N	3	8
4	2023-08-02	Увлажнитель воздуха	Polaris PUH 2300 WIFI IQ Home	Увлажнитель воздуха продолжает работать при проблеме с батарейкой	Новая заявка	\N	\N	3	8
\.


--
-- TOC entry 4917 (class 0 OID 26141)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, fio, phone, login, password, type) FROM stdin;
1	Трубин Никита Юрьевич	89210563128	kasoo	root	Менеджер
2	Мурашов Андрей Юрьевич	89535078985	murashov123	qwerty	Мастер
3	Степанов Андрей Викторович	89210673849	test1	test1	Мастер
4	Перина Анастасия Денисовна	89990563748	perinaAD	250519	Оператор
5	Мажитова Ксения Сергеевна	89994563847	krutiha1234567	1234567890	Оператор
6	Казакова Вероника Дмитриевна	89210567854	kazakova	55555	Оператор
7	Смирнов Владимир Сергеевич	89330124852	smirnov	11111	Клиент
9	Иванов Иван Иванович	89330124854	ivanov	33333	Клиент
8	Пукин Василий Петрович	89330124853	pupkin	22222	Клиент
\.


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 221
-- Name: comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_comment_id_seq', 7, true);


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 219
-- Name: requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requests_request_id_seq', 7, true);


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 9, true);


--
-- TOC entry 4764 (class 2606 OID 26180)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (comment_id);


--
-- TOC entry 4762 (class 2606 OID 26158)
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (request_id);


--
-- TOC entry 4757 (class 2606 OID 26148)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4765 (class 1259 OID 26192)
-- Name: ix_comments_master_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comments_master_id ON public.comments USING btree (master_id);


--
-- TOC entry 4766 (class 1259 OID 26191)
-- Name: ix_comments_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comments_request_id ON public.comments USING btree (request_id);


--
-- TOC entry 4758 (class 1259 OID 26170)
-- Name: ix_requests_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_requests_client_id ON public.requests USING btree (client_id);


--
-- TOC entry 4759 (class 1259 OID 26169)
-- Name: ix_requests_master_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_requests_master_id ON public.requests USING btree (master_id);


--
-- TOC entry 4760 (class 1259 OID 26171)
-- Name: ix_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_requests_status ON public.requests USING btree (request_status);


--
-- TOC entry 4769 (class 2606 OID 26181)
-- Name: comments comments_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 4770 (class 2606 OID 26186)
-- Name: comments comments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(request_id) ON DELETE CASCADE;


--
-- TOC entry 4767 (class 2606 OID 26164)
-- Name: requests requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- TOC entry 4768 (class 2606 OID 26159)
-- Name: requests requests_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


-- Completed on 2026-03-09 16:33:40

--
-- PostgreSQL database dump complete
--

\unrestrict LCDOAn8lDIBKGKl3fgj0HiX4TDO5aK3MQMbK3n5Ux5Z8xgoTQvbWBKOdRf1czuH

