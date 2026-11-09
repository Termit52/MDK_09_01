-- SQLite. Связи проверяются для каждого подключения с foreign_keys = ON.
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    login TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    phone TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin'))
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    starts_at TEXT NOT NULL CHECK (datetime(starts_at) IS NOT NULL),
    ends_at TEXT NOT NULL CHECK (datetime(ends_at) IS NOT NULL AND julianday(ends_at) > julianday(starts_at)),
    place TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE statuses (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL UNIQUE
);

INSERT INTO statuses (id, code, title)
VALUES (1, 'new', 'Новая'), (2, 'assigned', 'Назначено'), (3, 'completed', 'Завершено');

CREATE TABLE applications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_id INTEGER NOT NULL REFERENCES events(id),
    status_id INTEGER NOT NULL DEFAULT 1 REFERENCES statuses(id),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'invoice')),
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

CREATE INDEX applications_event_status_idx ON applications(event_id, status_id);
CREATE INDEX applications_status_idx ON applications(status_id);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id),
    rating INTEGER NOT NULL CHECK (typeof(rating) = 'integer' AND rating BETWEEN 1 AND 5),
    body TEXT NOT NULL CHECK (length(trim(body)) > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
