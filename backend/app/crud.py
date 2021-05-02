from typing import Union, List, Optional
from sqlalchemy.orm import Session

from app import models
from app import schemas


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_name(db: Session, name: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.name == name).first()


def get_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user_punishment(db: Session, punishment_id: int) -> models.Punishment:
    return db_punish


def create_user_punishment(
    db: Session, punishment: schemas.PunishmentBase, user_id: int, group_id: int
) -> models.Punishment:
    db_punish = models.Punishment(
        reason=punishment.reason,
        givenTo_id=punishment.givenTo_id,
        type_id=punishment.type_id,
        group_id=punishment.group_id,
    )
    db.add(db_punish)
    db.commit()
    db.refresh(db_punish)
    return db_punish


def get_group(db: Session, group_id: int) -> Optional[models.Group]:
    return db.query(models.Group).filter(models.Group.id == group_id).first()


def get_group_by_name(db: Session, name: str) -> Optional[models.Group]:
    return db.query(models.Group).filter(models.Group.name == name).first()


def get_groups(db: Session) -> List[models.Group]:
    return db.query(models.Group).all()


def create_group(db: Session, group: schemas.GroupCreate) -> models.Group:
    db_group = models.Group(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def add_user_to_group(
    db: Session, user: models.User, group: models.Group, admin: bool
) -> models.UserGroupLink:
    db_link = models.UserGroupLink(user_id=user.id, group_id=group.id, admin=admin)
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def get_punishment_types(db: Session) -> List[models.PunishmentType]:
    return db.query(models.PunishmentType).all()

def create_default_punishment_types(db: Session, group_id: int):
    beer = models.PunishmentType(name="Øl", value=33, logoUrl="http://link.com", group_id=group_id)
    wine = models.PunishmentType(name="Vin", value=100, logoUrl="http://link.com", group_id=group_id)
    vodka = models.PunishmentType(name="Dworek", value=300, logoUrl="http://link.com", group_id=group_id)
    db.add(beer)
    db.add(wine)
    db.add(vodka)
    db.commit()

def create_punishment_type(
    db: Session, group_id: int, item: schemas.PunishmentTypeCreate
) -> models.PunishmentType:
    db_item = models.PunishmentType(**item.dict(), group_id=group_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_punishment(db: Session, punishment_id: int) -> Optional[models.Punishment]:
    return db.query(models.Punishment).filter_by(id=punishment_id).first()


def verify_punishment(db: Session, item: schemas.Punishment) -> models.Punishment:
    db_item = models.Punishment(**item.dict())
    db.commit()
    db.refresh(db_item)
    return db_item
