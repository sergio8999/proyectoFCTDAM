CREATE TABLE IF NOT EXISTS users(
    dni TEXT PRIMARY KEY, 
    name_user TEXT,
    email TEXT,
    password_user TEXT,
    help TEXT,
    rol TEXT,
    avatar TEXT
);


INSERT or IGNORE INTO users( dni, name_user,password_user, help, email, rol, avatar) VALUES ('121212', 'administrador','U2FsdGVkX18SzpCeAAHGuj/v1RCzHdhrJK6uHTf+Ax8=','string', 'administrador@email.com', 'admin', 'av-6.png');


CREATE TABLE IF NOT EXISTS materials(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dni TEXT, 
    name_material TEXT,
    stock INTEGER
);

CREATE TABLE IF NOT EXISTS clients(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dni TEXT, 
    name_client TEXT,
    surname TEXT,
    tel TEXT,
    fullName TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS appointments(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_appointments TEXT, 
    hour TEXT,
    name_appointments TEXT,
    surname TEXT,
    description_appointment TEXT,
    dni_cliente TEXT,
    CONSTRAINT `fk_dni_cliente`
    FOREIGN KEY (`dni_cliente`)
    REFERENCES `clients` (`dni`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

