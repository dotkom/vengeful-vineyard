# No ORM version
import sqlite3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class Group(BaseModel):
    id: int
    name: str
    rules: str


class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    age: int
    phone: str


con = sqlite3.connect("example.db")
cur = con.cursor()
with open("schema.sql", "r") as f:
    schema = f.readlines()
    schema = "".join([line.strip() for line in schema])
cur.executescript(schema)


def dbToGroup(dbGroup) -> Group:
    return Group(**dict(zip(Group.__fields__.keys(), dbGroup)))


def dbToUser(dbUser) -> User:
    return User(**dict(zip(User.__fields__.keys(), dbUser)))


def insertUser(user: User):
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


app = FastAPI()


@app.get("/user", tags=["User"])
async def get_users():
    users = cur.execute("""SELECT * FROM users""")
    return {"users": list(map(dbToUser, users))}


@app.post("/user", tags=["User"])
async def post_user(user: User):
    if user.age <= 18:
        raise HTTPException(status_code=400, detail="User is too young!")
    return insertUser(user)


@app.get("/user/{user_id}", tags=["User"])
async def get_user(user_id: int):
    user = cur.execute(
        """SELECT * FROM users where user_id = :user_id""", {"user_id": user_id}
    )
    user = user.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dbToUser(user)


@app.get("/group/{group_id}", tags=["Group"])
async def get_group(group_id: int):
    group = cur.execute(
        """SELECT * FROM groups where group_id = :group_id""", {"group_id": group_id}
    )
    group = group.fetchone()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return dbToGroup(group)


@app.get("/user/{user_id}/group", tags=["User"])
async def get_user_groups(user_id: int):
    groups = cur.execute(
        """SELECT name from group_members
           INNER JOIN users on users.user_id = group_members.user_id
           INNER JOIN groups on groups.group_id = group_members.group_id
           where group_members.user_id = :user_id""",
        {"user_id": user_id},
    )
    groups = groups.fetchall()
    if not groups:
        raise HTTPException(status_code=404, detail="User groups could not be found")
    return {"groups": list(groups)}
