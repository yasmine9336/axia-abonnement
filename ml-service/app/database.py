import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(
    os.getenv("DB_CONNECTION"),
    fast_executemany=True
)

def get_connection():
    return engine.connect()