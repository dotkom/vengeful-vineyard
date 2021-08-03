from pydantic import BaseModel


class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    age: int
    phone: str


class Group(BaseModel):
    id: int
    name: str
    rules: str
