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

CREATE TABLE userform_isps (
    userform_id INT REFERENCES userform(id) ON DELETE CASCADE,
    selectisp JSONB,
    PRIMARY KEY (userform_id, selectisp)
);


CREATE TABLE userform (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    selectpole VARCHAR(255),
    selectpolestatus VARCHAR(255),
    selectpolelocation VARCHAR(255),
    description TEXT,
    availableisp VARCHAR(255),
    poleimage TEXT,
    selectisp VARCHAR(255),
    multipleimages TEXT,
    additional_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE additional_info (
    id SERIAL PRIMARY KEY,
    userform_id INTEGER REFERENCES userform(id),
    selectisp VARCHAR(255),
    multipleimages TEXT
);
