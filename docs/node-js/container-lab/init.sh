#!/bin/sh
set -eu
psql --username postgres --dbname notes --set=ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE secret text := btrim(pg_read_file('/run/secrets/app_password'));
BEGIN EXECUTE format('CREATE ROLE notes_app LOGIN PASSWORD %L',secret); END
$$;
CREATE TABLE counter(id integer PRIMARY KEY,value integer NOT NULL);
INSERT INTO counter VALUES(1,0);
GRANT CONNECT ON DATABASE notes TO notes_app;
GRANT USAGE ON SCHEMA public TO notes_app;
GRANT SELECT,UPDATE ON counter TO notes_app;
SQL
