import os
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager

DB_POOL = SimpleConnectionPool(
    minconn=1,
    maxconn=20,
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port=os.getenv("DB_PORT", 5432),
)

@contextmanager
def db_conn():
    conn = DB_POOL.getconn()
    try:
        yield conn
    finally:
        DB_POOL.putconn(conn)