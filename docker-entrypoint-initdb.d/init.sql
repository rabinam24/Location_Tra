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
    username VARCHAR NOT NULL UNIQUE,
    trip_started boolean NOT NULL,
    trip_start_time timestamp without time zone,
    trip_end_time timestamp without time zone
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password VARCHAR(100) NOT NULL
);
