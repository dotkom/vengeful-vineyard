from typing import List

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app import models
from app import schemas
from app.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/user", response_model=schemas.User, tags=["User"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_name(db, name=user.name)
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    return crud.create_user(db=db, user=user)


@app.get("/user", response_model=List[schemas.User], tags=["User"])
def read_users(db: Session = Depends(get_db)):
    users = crud.get_users(db)
    return users


@app.get("/user/{user_id}", response_model=schemas.User, tags=["User"])
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/group", response_model=List[schemas.Group], tags=["Group"])
def read_groups(db: Session = Depends(get_db)):
    return crud.get_groups(db)


@app.post("/group", response_model=schemas.Group, tags=["Group"])
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    db_group = crud.get_group_by_name(db, name=group.name)
    if db_group:
        raise HTTPException(status_code=400, detail="Group already exists")
    return crud.create_group(db, group)


@app.get("/group/{group_id}", response_model=schemas.Group, tags=["Group"])
def read_group(group_id: int, db: Session = Depends(get_db)):
    db_group = crud.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="group not found")
    return db_group


@app.post("/group/{group_id}/punishmentType", tags=["Group"])
def create_punishment_type(
    group_id: int,
    punishmentType: schemas.PunishmentTypeCreate,
    db: Session = Depends(get_db),
):
    return crud.create_punishment_type(db=db, group_id=group_id, item=punishmentType)


@app.post("/group/{group_id}/{user_id}", tags=["Group"])
def add_user_to_group(user_id: int, group_id: int, db: Session = Depends(get_db)):
    db_group = crud.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="group not found")
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="user not found")

    userInGroup = (
        db.query(models.UserGroupLink)
        .filter(
            models.UserGroupLink.user_id == user_id
            and models.UserGroupLink.group_id == group_id
        )
        .first()
    )
    if not userInGroup:
        return crud.add_user_to_group(db, db_user, db_group)
    raise HTTPException(status_code=400, detail="User is already in group")


@app.post(
    "/group/{group_id}/{user_id}/punishment",
    response_model=schemas.Punishment,
    tags=["Punishment"],
)
def create_punishment_for_user(
    user_id: int,
    group_id: int,
    punishment: schemas.PunishmentCreate,
    db: Session = Depends(get_db),
):
    return crud.create_user_punishment(db=db, punishment=punishment, user_id=user_id, group_id=group_id)


@app.post(
    "/group/{group_id}/{user_id}/punishment/{punishment_id}/validate",
    tags=["Punishment"],
)
def validate_punishment_for_user(
    user_id: int, group_id: int, punishment_id: int, db: Session = Depends(get_db)
):
    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
