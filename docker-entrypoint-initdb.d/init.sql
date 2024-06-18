CREATE TABLE userform (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    latitude FLOAT8,
    longitude FLOAT8,
    selectpole VARCHAR(255),
    selectpolestatus VARCHAR(255),
    selectpolelocation VARCHAR(255),
    description TEXT,
    availableisp VARCHAR(255),
    selectisp VARCHAR(255),
    poleimage VARCHAR(255),
    multipleimages VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.trip (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    trip_started boolean NOT NULL,
    trip_start_time timestamp without time zone,
    trip_end_time timestamp without time zone
);



