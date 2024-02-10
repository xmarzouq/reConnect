-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    score INTEGER
);

-- Create the refugees table
CREATE TABLE refugees (
    name TEXT,
    age_group TEXT,
    city TEXT,
    education TEXT,
    profession TEXT,
    languages_spoken TEXT,
    email TEXT,
    phone_number TEXT
);
