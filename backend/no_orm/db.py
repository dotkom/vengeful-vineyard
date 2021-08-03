import sqlite3
from typing import Dict

from fastapi import HTTPException

from models import User

con = sqlite3.connect("example.db")
cur = con.cursor()


def loadSchema(file: str) -> None:
    with open(file, "r") as f:
        schema = f.readlines()
        schemaStr = "".join([line.strip() for line in schema])
    cur.executescript(schemaStr)


async def insertUser(user: User) -> Dict[str, int]:
    statement = (
        f"INSERT INTO users(first_name, last_name, age, phone) VALUES (?, ?, ?, ?)"
    )
    values = (user.first_name, user.last_name, user.age, user.phone)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Database integrity violated")
    con.commit()
    return {"id": cur.lastrowid}
