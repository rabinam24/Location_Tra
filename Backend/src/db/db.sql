


CREATE TABLE pool_informations (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    selectisp VARCHAR(255) NOT NULL, 
    selectpool VARCHAR(255) NOT NULL,
    selectpoolstatus VARCHAR(255) NOT NULL,
    selectpoollocation VARCHAR(255) NOT NULL,
    description TEXT,
    image BYTEA
);

INSERT INTO pool_informations (location, latitude, longitude, selectisp, selectpool, selectpoolstatus, selectpoollocation, description, image) VALUES
('Test Location', 0.0, 0.0, 'Test ISP', 'Test Pool', 'Test Status', 'Test Location', 'Test Description', null);

INSERT INTO pool_informations 
    (location, latitude, longitude, selectisp, selectpool, selectpoolstatus, selectpoollocation, description) 
VALUES 
    ('Test Location', 0.0, 0.0, 'Test ISP', 'Test Pool', 'Test Status', 'Test Location', 'Test Description');
