import sqlite3
import os
from typing import Dict

from fastapi import HTTPException

from app.models import Group, User

con = None
cur = None
schemaFile = ""


def loadSchema(file: str) -> None:
    global schemaFile
    schemaFile = file
    with open(file, "r") as f:
        schema = f.readlines()
        schemaStr = "".join([line.strip() for line in schema])
    cur.executescript(schemaStr)


def reconnect():
    global con
    global cur

    con = sqlite3.connect(os.environ.get("VENGEFUL_DATABASE"))
    cur = con.cursor()
    try:
        loadSchema(schemaFile)
    except:
        pass


reconnect()


async def insertUser(user: User) -> Dict[str, int]:
    statement = (
        f"INSERT INTO users(first_name, last_name, age, phone) VALUES (?, ?, ?, ?)"
    )
    values = (user.first_name, user.last_name, user.age, user.phone)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}


async def insertGroup(group: Group) -> Dict[str, int]:
    statement = f"INSERT INTO groups(name, rules) VALUES (?, ?)"
    values = (group.name, group.rules)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}


async def insertUserInGroup(group_id: int, user_id: int) -> Dict[str, int]:
    statement = (
        f"INSERT INTO group_members(group_id, user_id, is_admin) VALUES (?, ?, False)"
    )
    values = (group_id, user_id)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}
