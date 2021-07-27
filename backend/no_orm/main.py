# No ORM version
import sqlite3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class User(BaseModel):
    first_name: str
    last_name: str
    age: int
    phone: str


con = sqlite3.connect('example.db')
cur = con.cursor()
with open("schema.sql", "r") as f:
    schema = f.readlines()
    schema = "".join([line.strip() for line in schema])
cur.execute(schema)


def dbUserJson(dbUser):
    return {
        "id": dbUser[0],
        "first_name": dbUser[1],
        "last_name": dbUser[2],
        "age": dbUser[3],
        "phone": dbUser[4],
    }


app = FastAPI()


@app.get("/user")
async def get_users():
    users = cur.execute("""SELECT * FROM users""")
    return {"users": list(map(dbUserJson, users))}


@app.post("/user")
async def post_user(user: User):
    if user.age <= 18:
        raise HTTPException(status_code=400, detail="User is too young!")
    statement = f"INSERT INTO users(first_name, last_name, age, phone) VALUES (?, ?, ?, ?)"
    values = (user.first_name,
              user.last_name, user.age, user.phone)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=400, detail="Database integrity violated")
    con.commit()
    return {"id": cur.lastrowid}


@app.get("/user/{user_id}")
async def read_item(user_id: int):
    user = cur.execute(
        """SELECT * FROM users where user_id = :user_id""", {"user_id": user_id})
    user = user.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dbUserJson(user)
